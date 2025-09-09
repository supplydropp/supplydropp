import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import useAuthStore from "@/store/auth.store";
import { databases, appwriteConfig } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";

export default function Store() {
  const { user } = useAuthStore();
  const role = user?.role ?? "guest";
  const router = useRouter();

  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.packsCollectionId,
          [
            Query.equal("type", role),
            Query.equal("active", true)
          ]
        );
        setPacks(res.documents);
      } catch (err) {
        console.error("Failed to load packs:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [role]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FE8C00" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Available Packs</Text>
      <FlatList
        data={packs}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-1 bg-gray-100 rounded-xl p-3 mx-1"
            onPress={() => router.push(`/packs/${item.$id}`)}
          >
            <Image
              source={{ uri: item.image_url }}
              resizeMode="cover"
              className="w-full h-32 rounded-lg mb-2"
            />
            <Text className="font-semibold">{item.name}</Text>
            <Text className="text-gray-600">€{item.price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
