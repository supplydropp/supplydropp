import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { databases, appwriteConfig } from "@/lib/appwrite";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.ordersCollectionId
        );
        setOrders(res.documents);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.ordersCollectionId,
        id,
        { status }
      );
      setOrders((prev) => prev.map((o) => (o.$id === id ? { ...o, status } : o)));
      Alert.alert("Updated", `Order marked as ${status}`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update order");
    }
  };

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
      data={orders}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <View className="mb-3 p-3 bg-gray-100 rounded-lg">
          <Text className="font-bold">Order: {item.$id}</Text>
          <Text>Status: {item.status}</Text>
          <View className="flex-row gap-2 mt-2">
            <TouchableOpacity
              onPress={() => handleUpdate(item.$id, "confirmed")}
              className="bg-blue-500 px-3 py-1 rounded"
            >
              <Text className="text-white">Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleUpdate(item.$id, "delivered")}
              className="bg-green-500 px-3 py-1 rounded"
            >
              <Text className="text-white">Deliver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleUpdate(item.$id, "cancelled")}
              className="bg-red-500 px-3 py-1 rounded"
            >
              <Text className="text-white">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}
