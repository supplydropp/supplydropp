import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { databases, appwriteConfig } from "@/lib/appwrite";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId
        );
        setProducts(res.documents);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FE8C00" />
      </View>
    );
  }

  return (
    <FlatList
      className="p-4"
      data={products}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <View className="mb-3 p-3 bg-gray-100 rounded-lg">
          <Text className="font-bold">{item.name}</Text>
          <Text>Supplier: {item.supplier}</Text>
          <Text>Cost: €{item.cost_price}</Text>
        </View>
      )}
    />
  );
}
