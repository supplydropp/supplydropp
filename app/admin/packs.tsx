// app/(admin)/AdminPacks.tsx
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
import { Query } from "react-native-appwrite";
import PackEditor from "@/components/admin/PackEditor";
import Button from "@/components/ui/Button";
import { colors } from "@/constants/theme";
import PackRow from "@/components/admin/PackRow"; // ✅ row view

export default function AdminPacks() {
  const [packs, setPacks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [packItems, setPackItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingPack, setEditingPack] = useState<any | null>(null);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function loadData() {
    try {
      setLoading(true);
      const [packsRes, productsRes, itemsRes] = await Promise.all([
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.packsCollectionId
        ),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId,
          [Query.equal("active", true)]
        ),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.packItemsCollectionId
        ),
      ]);

      setPacks(packsRes.documents);
      setProducts(productsRes.documents);
      setPackItems(itemsRes.documents);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // Pagination math
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = packs.slice(start, end);

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
        <Text className="text-2xl font-bold">Manage Packs</Text>
        <Button
          variant="primary"
          onPress={() =>
            setEditingPack({
              $id: null,
              name: "",
              description: "",
              price: 0,
              type: "guest",
              override_margin: null,
              image_url: "",
              active: true,
            })
          }
        >
          + New Pack
        </Button>
      </View>

      {/* Pack list */}
      <FlatList
        data={paginated}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <PackRow
            pack={item}
            onEdit={(p) => setEditingPack(p)}
          />
        )}
        // 👇 add bottom padding so pagination doesn’t hug bottom
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? 40 : 0,
        }}
      />

      {/* Pagination (web only) */}
      {Platform.OS === "web" && (
        <View className="flex-row justify-center items-center gap-2 mt-6 mb-4">
          {Array.from(
            { length: Math.ceil(packs.length / pageSize) },
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
        visible={!!editingPack}
        animationType="slide"
        onRequestClose={() => setEditingPack(null)}
      >
        {editingPack && (
          <PackEditor
            pack={editingPack}
            products={products}
            onSaved={async () => {
              await loadData();
              setEditingPack(null);
            }}
            onCancel={() => setEditingPack(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}
