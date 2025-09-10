import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { databases, appwriteConfig } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import useAuthStore from "@/store/auth.store";

export default function Orders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const queries =
          user?.role === "admin" ? [] : [Query.equal("userId", user?.$id)];
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.ordersCollectionId,
          queries
        );
        setOrders(res.documents);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#28aae2" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">No orders yet.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View className="py-4 border-b border-gray-200">
            <Text className="font-semibold">Order #{item.$id}</Text>
            <Text className="text-gray-600">Status: {item.status}</Text>
            <Text className="text-gray-600">
              Total: €{item.totalPrice?.toFixed(2) ?? "0.00"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
