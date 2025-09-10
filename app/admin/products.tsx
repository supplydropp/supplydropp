// app/(admin)/AdminProducts.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { databases, appwriteConfig } from "@/lib/appwrite";
import ProductEditor from "@/components/admin/ProductEditor";
import Button from "@/components/ui/Button";
import { colors } from "@/constants/theme";
import ProductRow from "@/components/admin/ProductRow";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId
      );
      setProducts(res.documents);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = products.slice(start, end);

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={{
        paddingTop: Platform.OS === "web" ? 24 : 0,
        paddingHorizontal: Platform.OS === "web" ? 32 : 16,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-black">Manage Products</Text>
        <Button
          variant="primary"
          onPress={() =>
            setEditingProduct({
              $id: null,
              name: "",
              description: "",
              cost_price: 0,
              image_url: "",
              active: true,
              default_markup: 0.3,
              supplier: "Mercadona",
            })
          }
        >
          + New Product
        </Button>
      </View>

      {/* Product list */}
      <FlatList
        data={paginated}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <ProductRow product={item} onEdit={(p) => setEditingProduct(p)} />
        )}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? 40 : 0, // ✅ adds breathing room below list
        }}
      />

      {/* Pagination (web only) */}
      {Platform.OS === "web" && (
        <View className="flex-row justify-center items-center gap-2 mt-6 mb-4">
          {Array.from(
            { length: Math.ceil(products.length / pageSize) },
            (_, i) => i + 1
          ).map((num) => (
            <Button
              key={num}
              variant={num === page ? "primary" : "secondary"}
              onPress={() => setPage(num)}
            >
              {String(num)}
            </Button>
          ))}
        </View>
      )}

      {/* Modal for create/edit */}
      <Modal
        visible={!!editingProduct}
        animationType="slide"
        onRequestClose={() => setEditingProduct(null)}
      >
        {editingProduct && (
          <ProductEditor
            product={editingProduct}
            onSaved={async () => {
              await loadProducts();
              setEditingProduct(null);
            }}
            onCancel={() => setEditingProduct(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}
