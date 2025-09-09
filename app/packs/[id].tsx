// app/packs/[id].tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { databases, appwriteConfig } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import useAuthStore from "@/store/auth.store";

export default function PackDetail() {
  const { id } = useLocalSearchParams(); // pack id
  const router = useRouter();
  const { user } = useAuthStore();

  const [pack, setPack] = useState<any>(null);
  const [packItems, setPackItems] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // 1. Fetch the pack
        const packRes = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.packsCollectionId,
          id as string
        );
        setPack(packRes);

        // 2. Fetch items linked to this pack
        const packItemsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.packItemsCollectionId,
          [Query.equal("packId", [id as string])]
        );
        setPackItems(packItemsRes.documents);

        // 3. Collect all productIds from pack_items
        const productIds = packItemsRes.documents
          .map((i: any) => i.productId?.[0]) // relationship is array
          .filter(Boolean);

        if (productIds.length > 0) {
          const prodRes = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.productsCollectionId,
            [Query.equal("$id", productIds)]
          );

          const prodMap: Record<string, any> = {};
          prodRes.documents.forEach((p: any) => {
            prodMap[p.$id] = p;
          });
          setProducts(prodMap);
        }
      } catch (err) {
        console.error("Failed to load pack:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAddToOrder = async () => {
    try {
      if (!user) {
        Alert.alert("Login required", "Please sign in to place an order.");
        router.push("/sign-in");
        return;
      }

      // Snapshot the pack items into the order
      const orderItems = packItems.map((i: any) => ({
        productId: i.productId?.[0],
        quantity: i.quantity,
      }));

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.ordersCollectionId,
        "unique()",
        {
          userId: user.$id,
          packId: pack.$id,
          status: "pending",
          scheduledTime: new Date().toISOString(),
          deliveryType: user.role ?? "guest",
          totalPrice: pack.price,
          deliveryFee: 5.0,
          notes: "",
          items: orderItems,
        }
      );

      Alert.alert("Success", "Your order has been placed!");
      router.push("/cart");
    } catch (err: any) {
      console.error("Order failed:", err);
      Alert.alert("Error", "Could not place order. Please try again.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FE8C00" />
      </View>
    );
  }

  if (!pack) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Pack not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <Image
        source={{ uri: pack.image_url }}
        className="w-full h-60"
        resizeMode="cover"
      />

      <View className="p-5">
        <Text className="text-2xl font-bold mb-2">{pack.name}</Text>
        <Text className="text-lg text-gray-600 mb-4">
          €{pack.price.toFixed(2)}
        </Text>
        <Text className="mb-4">{pack.description}</Text>

        {/* Included Items */}
        {packItems.length > 0 && (
          <View className="mb-5">
            <Text className="text-xl font-semibold mb-2">Included Items:</Text>
            {packItems.map((i: any, idx: number) => {
              const productId = i.productId?.[0];
              const product = products[productId];
              return (
                <Text key={idx} className="text-gray-700">
                  • {i.quantity} × {product ? product.name : "Unknown item"}
                </Text>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          onPress={handleAddToOrder}
          className="bg-orange-500 rounded-xl p-4 mt-4 active:opacity-90"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Add to Order
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
