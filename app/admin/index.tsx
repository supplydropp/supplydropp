// app/admin/index.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import useAuthStore from "@/store/auth.store";
import { databases, appwriteConfig } from "@/lib/appwrite";
import { colors } from "@/constants/theme";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AdminHome() {
  const { user } = useAuthStore();

  const [counts, setCounts] = useState({
    users: 0,
    packs: 0,
    products: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, packsRes, productsRes, ordersRes] = await Promise.all([
          databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.userCollectionId),
          databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.packsCollectionId),
          databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.productsCollectionId),
          databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.ordersCollectionId),
        ]);

        setCounts({
          users: usersRes.total,
          packs: packsRes.total,
          products: productsRes.total,
          orders: ordersRes.total,
        });
      } catch (err) {
        console.error("Failed to load dashboard counts:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={{
        paddingTop: Platform.OS === "web" ? 24 : 0,
        paddingHorizontal: Platform.OS === "web" ? 32 : 16,
      }}
    >
      {/* Header */}
      <Text className="text-2xl font-bold mb-2">Admin Dashboard</Text>
      <Text className="text-gray-600 mb-6">Signed in as: {user?.email}</Text>

      {/* Summary cards */}
      <View className="flex-row flex-wrap gap-4 mb-6">
        <Card className="flex-1 p-4">
          <Text className="text-lg font-bold text-black">{counts.users}</Text>
          <Text className="text-gray-600">Users</Text>
        </Card>
        <Card className="flex-1 p-4">
          <Text className="text-lg font-bold text-black">{counts.packs}</Text>
          <Text className="text-gray-600">Packs</Text>
        </Card>
        <Card className="flex-1 p-4">
          <Text className="text-lg font-bold text-black">{counts.products}</Text>
          <Text className="text-gray-600">Products</Text>
        </Card>
        <Card className="flex-1 p-4">
          <Text className="text-lg font-bold text-black">{counts.orders}</Text>
          <Text className="text-gray-600">Orders</Text>
        </Card>
      </View>

      {/* Key metrics (no cards, just rows) */}
      <View className="mb-8">
        <Text className="text-xl font-bold mb-3">Key Metrics</Text>

        <View className="border-b border-gray-200 py-3">
          <Text className="font-semibold text-gray-700">Avg. Order Value</Text>
          <Text className="text-lg text-black">
            €{counts.orders > 0 ? (counts.packs * 25 / counts.orders).toFixed(2) : "0.00"}
          </Text>
        </View>

        <View className="border-b border-gray-200 py-3">
          <Text className="font-semibold text-gray-700">Active Packs</Text>
          <Text className="text-lg text-black">{counts.packs}</Text>
        </View>

        <View className="py-3">
          <Text className="font-semibold text-gray-700">Total Revenue (Mock)</Text>
          <Text className="text-lg text-black">€{(counts.orders * 25).toFixed(2)}</Text>
          <Text className="text-gray-500 text-sm">* placeholder estimate</Text>
        </View>
      </View>

      {/* Navigation */}
      <View className="gap-3">
        <Link href="/admin/users" asChild>
          <Button variant="primary">Manage Users</Button>
        </Link>
        <Link href="/admin/packs" asChild>
          <Button variant="primary">Manage Packs</Button>
        </Link>
        <Link href="/admin/products" asChild>
          <Button variant="primary">Manage Products</Button>
        </Link>
        <Link href="/admin/orders" asChild>
          <Button variant="primary">Manage Orders</Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}
