// app/(admin)/packs.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { databases, appwriteConfig } from "@/lib/appwrite";

export default function AdminPacks() {
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.packsCollectionId
        );
        setPacks(res.documents);
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
      data={packs}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <View className="mb-3 p-3 bg-gray-100 rounded-lg">
          <Text className="font-bold">{item.name}</Text>
          <Text>{item.description}</Text>
          <Text>Type: {item.type}</Text>
          <Text>Price: €{item.price}</Text>
        </View>
      )}
    />
  );
}
