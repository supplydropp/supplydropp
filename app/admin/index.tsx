// app/admin/index.tsx
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import useAuthStore from "@/store/auth.store";

export default function AdminHome() {
  const { user } = useAuthStore();

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-4">Admin Panel</Text>
      <Text className="text-gray-600 mb-6">Logged in as: {user?.email}</Text>

      {/* Users */}
      <Link href="/admin/users" asChild>
        <TouchableOpacity className="bg-indigo-600 p-4 rounded-xl mb-3">
          <Text className="text-white text-center font-semibold">
            Manage Users
          </Text>
        </TouchableOpacity>
      </Link>

      {/* Properties */}
      <Link href="/admin/properties" asChild>
        <TouchableOpacity className="bg-blue-600 p-4 rounded-xl mb-3">
          <Text className="text-white text-center font-semibold">
            Manage Properties
          </Text>
        </TouchableOpacity>
      </Link>

      {/* Products */}
      <Link href="/admin/products" asChild>
        <TouchableOpacity className="bg-green-600 p-4 rounded-xl mb-3">
          <Text className="text-white text-center font-semibold">
            Manage Products
          </Text>
        </TouchableOpacity>
      </Link>

      {/* Packs */}
      <Link href="/admin/packs" asChild>
        <TouchableOpacity className="bg-orange-600 p-4 rounded-xl mb-3">
          <Text className="text-white text-center font-semibold">
            Manage Packs
          </Text>
        </TouchableOpacity>
      </Link>

      {/* Orders */}
      <Link href="/admin/orders" asChild>
        <TouchableOpacity className="bg-red-600 p-4 rounded-xl mb-3">
          <Text className="text-white text-center font-semibold">
            Manage Orders
          </Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}
