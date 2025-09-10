import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface PackCardProps {
  pack: any;
  products: any[];
  packItems: any[];
  onEdit: (pack: any) => void;
  onDelete: (packId: string) => void;
  onToggleActive: (packId: string, current: boolean) => void;
}

export default function PackCard({
  pack,
  products,
  packItems,
  onEdit,
  onDelete,
  onToggleActive,
}: PackCardProps) {
  const items = packItems.filter((i) => i.packIdStr === pack.$id);

  const costBase = items.reduce((sum, i) => {
    const prod = products.find((p) => p.$id === i.productIdStr);
    return sum + (prod ? prod.cost_price * i.quantity : 0);
  }, 0);

  const margin =
    costBase > 0
      ? (((pack.price - costBase) / costBase) * 100).toFixed(1)
      : "—";

  const [expanded, setExpanded] = useState(false);

  return (
    <View className="bg-white border rounded-lg p-3 mb-3 shadow-sm">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-1">
        <Text className="font-semibold text-lg">{pack.name}</Text>
        <Text
          className={`px-2 py-1 rounded text-xs ${
            pack.active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {pack.active ? "Active" : "Inactive"}
        </Text>
      </View>

      {/* Price & Margin */}
      <Text className="text-gray-700">
        Price: €{pack.price} | Margin:{" "}
        <Text
          className={`${
            parseFloat(margin) < 20 ? "text-red-500" : "text-green-600"
          }`}
        >
          {margin}%
        </Text>
      </Text>

      {/* Toggle details */}
      <TouchableOpacity onPress={() => setExpanded(!expanded)} className="mt-2">
        <Text className="text-blue-600 text-sm">
          {expanded ? "Hide Details ▲" : "View Details ▼"}
        </Text>
      </TouchableOpacity>

      {/* Collapsible Section */}
      {expanded && (
        <View className="mt-2 border-t border-gray-200 pt-2">
          {pack.description ? (
            <Text className="text-gray-600 mb-1">{pack.description}</Text>
          ) : null}

          {items.length > 0 ? (
            <View>
              <Text className="font-semibold mb-1">Products:</Text>
              {items.map((i) => {
                const prod = products.find((p) => p.$id === i.productIdStr);
                return (
                  <Text key={i.$id} className="text-sm text-gray-700">
                    • {i.quantity} × {prod ? prod.name : "Unknown"}
                  </Text>
                );
              })}
            </View>
          ) : (
            <Text className="text-sm italic text-gray-500">No products</Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity
          className="bg-blue-500 px-3 py-1 rounded"
          onPress={() => onEdit(pack)}
        >
          <Text className="text-white text-sm">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-3 py-1 rounded ${
            pack.active ? "bg-yellow-500" : "bg-green-600"
          }`}
          onPress={() => onToggleActive(pack.$id, pack.active)}
        >
          <Text className="text-white text-sm">
            {pack.active ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-500 px-3 py-1 rounded"
          onPress={() => onDelete(pack.$id)}
        >
          <Text className="text-white text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
