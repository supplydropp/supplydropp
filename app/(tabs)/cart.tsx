import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import useAuthStore from "@/store/auth.store";
import { databases, appwriteConfig } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import { ChevronDown, ChevronUp } from "lucide-react-native";

export default function Orders() {
  const { user } = useAuthStore();
  const role = user?.role ?? "guest";

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        let queries: any[] = [];
        if (role !== "admin" && user?.$id) {
          queries.push(Query.equal("userId", user.$id));
        }

        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.ordersCollectionId,
          queries
        );

        setOrders(res.documents);

        // Collect all productIds across all orders
        const allProductIds = res.documents
          .flatMap((o: any) => (o.items ? o.items.map((i: any) => i.productId) : []))
          .filter(Boolean);

        if (allProductIds.length > 0) {
          const prodRes = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.productsCollectionId,
            [Query.equal("$id", allProductIds)]
          );

          const prodMap: Record<string, any> = {};
          prodRes.documents.forEach((p: any) => {
            prodMap[p.$id] = p;
          });
          setProducts(prodMap);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [role, user]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.ordersCollectionId,
        orderId,
        { status: newStatus }
      );
      Alert.alert("Updated", `Order marked as ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) =>
          o.$id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      Alert.alert("Error", "Could not update order status.");
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FE8C00" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">No orders found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">My Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => {
          const isExpanded = expanded.has(item.$id);

          return (
            <View className="bg-gray-100 rounded-xl mb-3 overflow-hidden">
              {/* Summary row with chevron */}
              <TouchableOpacity
                onPress={() => toggleExpand(item.$id)}
                activeOpacity={0.8}
                className="flex-row justify-between items-center p-4"
              >
                <View>
                  <Text className="font-semibold">Order ID: {item.$id}</Text>
                  <Text>Status: {item.status}</Text>
                  <Text>Total: €{item.totalPrice?.toFixed(2)}</Text>
                  <Text>
                    Scheduled: {new Date(item.scheduledTime).toLocaleString()}
                  </Text>
                </View>

                {isExpanded ? (
                  <ChevronUp size={20} color="#333" />
                ) : (
                  <ChevronDown size={20} color="#333" />
                )}
              </TouchableOpacity>

              {/* Expanded content */}
              {isExpanded && (
                <View className="px-4 pb-4">
                  {item.items && item.items.length > 0 && (
                    <View className="mb-2">
                      <Text className="font-semibold">Items:</Text>
                      {item.items.map((i: any, idx: number) => {
                        const product = products[i.productId];
                        return (
                          <Text key={idx} className="text-gray-700">
                            • {i.quantity} × {product ? product.name : i.productId}
                          </Text>
                        );
                      })}
                    </View>
                  )}

                  {role === "admin" && (
                    <View className="flex-row gap-2 mt-2">
                      <TouchableOpacity
                        onPress={() => handleUpdateStatus(item.$id, "confirmed")}
                        className="bg-blue-500 rounded px-3 py-1"
                      >
                        <Text className="text-white">Confirm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleUpdateStatus(item.$id, "delivered")}
                        className="bg-green-500 rounded px-3 py-1"
                      >
                        <Text className="text-white">Deliver</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleUpdateStatus(item.$id, "cancelled")}
                        className="bg-red-500 rounded px-3 py-1"
                      >
                        <Text className="text-white">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
