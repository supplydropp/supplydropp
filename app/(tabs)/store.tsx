import React, { useEffect, useState } from "react";
import {
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { databases, appwriteConfig } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import { useCartStore } from "@/store/cart.store";

export default function Store() {
  const router = useRouter();
  const { getTotalItems } = useCartStore();

  const [packs, setPacks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const totalItems = getTotalItems();

  useEffect(() => {
    async function load() {
      try {
        const [packsRes, productsRes] = await Promise.all([
          databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.packsCollectionId, [
            Query.equal("active", true),
          ]),
          databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.productsCollectionId, [
            Query.equal("active", true),
          ]),
        ]);

        setPacks(packsRes.documents);
        setProducts(productsRes.documents);
      } catch (err) {
        console.error("Failed to load store:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#28AAE2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={{
        paddingTop: Platform.OS === "ios" ? 16 : Platform.OS === "web" ? 24 : 0,
        paddingHorizontal: Platform.OS === "web" ? 32 : 16,
      }}
    >
      {/* Title */}
      <Text className="text-2xl font-bold mb-4">Store</Text>

      {/* Best Sellers */}
      <Text className="text-xl font-semibold mb-2">Best Sellers</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={packs.slice(0, 5)}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/packs/${item.$id}` as any)}
            className="mr-4"
          >
            <Image
              source={{ uri: item.image_url }}
              className="w-40 h-28 rounded-lg mb-2"
              resizeMode="cover"
            />
            <Text className="font-semibold">{item.name}</Text>
            <Text className="text-gray-600">€{item.price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Packs */}
      <Text className="text-xl font-semibold mt-6 mb-2">Packs</Text>
      <FlatList
        data={packs}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/packs/${item.$id}` as any)}
            className="flex-row items-center justify-between py-3 border-b border-gray-200"
          >
            <Text className="font-semibold">{item.name}</Text>
            <Text className="text-gray-600">€{item.price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Products */}
      <Text className="text-xl font-semibold mt-6 mb-2">Products</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/products/${item.$id}` as any)}
            className="flex-row items-center justify-between py-3 border-b border-gray-200"
          >
            <Text className="font-semibold">{item.name}</Text>
            <Text className="text-gray-600">€{item.cost_price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <TouchableOpacity
          onPress={() => router.push("/cart" as any)}
          className="bg-[#28AAE2] rounded-full px-5 py-3"
          style={{
            position: "absolute",
            bottom: Platform.OS === "web" ? 32 : 24,
            right: Platform.OS === "web" ? 32 : 16,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Text className="text-white font-bold">Cart ({totalItems})</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
