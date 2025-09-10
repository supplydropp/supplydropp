// app/(tabs)/cart.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useCartStore } from "@/store/cart.store";
import { images } from "@/constants";
import Button from "@/components/ui/Button";

export default function Cart() {
  const {
    items,
    increaseQty,
    decreaseQty,
    removeItem,
    getTotalPrice,
  } = useCartStore();

  const router = useRouter();

  if (items.length === 0) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-white"
        style={{
          paddingHorizontal: Platform.OS === "web" ? 32 : 16,
        }}
      >
        <Image
          source={images.emptyState}
          resizeMode="contain"
          style={{ width: 200, height: 200, marginBottom: 20 }}
        />
        <Text className="text-lg font-semibold text-gray-600 mb-4">
          Your cart is empty
        </Text>
        <Button variant="primary" onPress={() => router.push("/store")}>
          Continue Shopping
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Cart list */}
      <FlatList
        data={items}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
        contentContainerStyle={{
          paddingHorizontal: Platform.OS === "web" ? 32 : 16,
          paddingTop: 16,
          paddingBottom: 120, // ✅ leaves space for sticky footer
        }}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between py-3 border-b border-gray-200">
            {/* Left: product image + info */}
            <View className="flex-row items-center gap-3 flex-1">
              {item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={{ width: 50, height: 50, borderRadius: 8 }}
                />
              )}
              <View className="flex-1">
                <Text className="font-semibold">{item.name}</Text>
                <Text className="text-gray-500">€{item.price.toFixed(2)}</Text>
              </View>
            </View>

            {/* Right: qty controls + trash */}
            <View className="flex-row items-center gap-2">
              {/* Decrease */}
              <TouchableOpacity
                onPress={() => decreaseQty(item.id, item.customizations ?? [])}
                className="bg-gray-200 rounded px-2 py-1"
              >
                <Text>-</Text>
              </TouchableOpacity>

              <Text className="mx-2">{item.quantity}</Text>

              {/* Increase */}
              <TouchableOpacity
                onPress={() => increaseQty(item.id, item.customizations ?? [])}
                className="bg-gray-200 rounded px-2 py-1"
              >
                <Text>+</Text>
              </TouchableOpacity>

              {/* Trash can (always visible) */}
              <TouchableOpacity
                onPress={() => removeItem(item.id, item.customizations ?? [])}
                className="ml-2"
              >
                <Image
                  source={images.trash}
                  style={{ width: 20, height: 20, tintColor: "red" }}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Sticky footer */}
      <View
        className="absolute left-0 right-0 bg-white border-t border-gray-200 p-4"
        style={{
          bottom: Platform.OS === "ios" ? 90 : 70, // ✅ avoids menu bar overlap
          paddingHorizontal: Platform.OS === "web" ? 32 : 16,
        }}
      >
        <Text className="text-xl font-bold mb-3">
          Total: €{getTotalPrice().toFixed(2)}
        </Text>

        <Button variant="primary" onPress={() => router.push("/checkout")}>
          Checkout
        </Button>

        <View className="mt-3">
          <Button variant="secondary" onPress={() => router.push("/store")}>
            Continue Shopping
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
