import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface ProductCardProps {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, current: boolean) => void;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductCardProps) {
  return (
    <View className="flex-row items-center justify-between bg-gray-100 rounded-lg p-3 mb-3">
      <Image
        source={{ uri: product.image_thumb ?? product.image_url }}
        style={{ width: 60, height: 60, borderRadius: 6, marginRight: 10 }}
      />

      <View className="flex-1">
        <Text className="font-bold">{product.name}</Text>
        <Text className="text-sm text-gray-600">€{product.cost_price}</Text>
        <Text className="text-xs text-gray-500">Supplier: {product.supplier}</Text>
        <Text className="text-xs text-gray-500">
          {product.active ? "Active" : "Inactive"}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          className="bg-blue-500 px-2 py-1 rounded"
          onPress={() => onEdit(product)}
        >
          <Text className="text-white text-sm">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-500 px-2 py-1 rounded"
          onPress={() => onDelete(product.$id)}
        >
          <Text className="text-white text-sm">Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-700 px-2 py-1 rounded"
          onPress={() => onToggleActive(product.$id, product.active)}
        >
          <Text className="text-white text-sm">
            {product.active ? "Disable" : "Enable"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
