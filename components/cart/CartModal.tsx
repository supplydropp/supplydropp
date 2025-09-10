import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useCartStore } from "@/store/cart.store";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CartModal({ visible, onClose }: Props) {
  const router = useRouter();
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  const handleContinueShopping = () => {
    onClose();
    router.push("/store"); // ✅ take user back to store
  };

  const handleGoToCart = () => {
    onClose();
    router.push("/cart"); // ✅ go to cart page
  };

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === "ios" ? "slide" : "fade"}
      transparent
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white p-6 rounded-t-2xl shadow-lg">
          <Text className="text-xl font-bold mb-2">Item added to cart 🎉</Text>
          <Text className="text-lg mb-6">Total: €{totalPrice.toFixed(2)}</Text>

          {/* Buttons */}
          <TouchableOpacity
            onPress={handleGoToCart}
            className="bg-blue-500 p-4 rounded-lg mb-3"
          >
            <Text className="text-white text-center font-semibold">
              Go to Cart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContinueShopping}
            className="bg-gray-200 p-4 rounded-lg"
          >
            <Text className="text-black text-center font-semibold">
              Continue Shopping
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
