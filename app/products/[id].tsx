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
import useAuthStore from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import CartModal from "@/components/cart/CartModal"; // ✅ new modal

export default function ProductDetail() {
  const { id } = useLocalSearchParams(); // product id
  const router = useRouter();
  const { user } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const prodRes = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId,
          id as string
        );
        setProduct(prodRes);
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      Alert.alert("Login required", "Please sign in to add items to cart.");
      router.push("/sign-in");
      return;
    }

    addItem({
      id: product.$id,
      name: product.name,
      price: product.cost_price,
      image_url: product.image_url,
      customizations: [],
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FE8C00" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Product not found.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1 bg-white">
        <Image
          source={{ uri: product.image_url }}
          className="w-full h-60"
          resizeMode="cover"
        />

        <View className="p-5">
          <Text className="text-2xl font-bold mb-2">{product.name}</Text>
          <Text className="text-lg text-gray-600 mb-4">
            €{product.cost_price.toFixed(2)}
          </Text>
          <Text className="mb-4">{product.description}</Text>

          {/* 🔹 Add to Cart button */}
          <TouchableOpacity
            onPress={handleAddToCart}
            className="bg-blue-500 rounded-xl p-4 mt-4 active:opacity-90"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Add to Cart
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 🔹 Cart Modal */}
      <CartModal visible={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
