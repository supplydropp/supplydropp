import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function PackListItem({
  pack,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  pack: any;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  return (
    <View className="bg-gray-100 rounded-lg p-3 mb-3">
      <Text className="font-semibold">{pack.name}</Text>
      <Text>{pack.description}</Text>
      <Text>Type: {pack.type}</Text>
      <Text>Price: €{pack.price}</Text>
      <Text>Status: {pack.active ? "Active ✅" : "Inactive ❌"}</Text>

      <View className="flex-row gap-2 mt-2">
        <TouchableOpacity
          className="bg-blue-500 px-3 py-2 rounded"
          onPress={onEdit}
        >
          <Text className="text-white">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-500 px-3 py-2 rounded"
          onPress={onDelete}
        >
          <Text className="text-white">Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-3 py-2 rounded ${
            pack.active ? "bg-yellow-500" : "bg-green-600"
          }`}
          onPress={onToggleActive}
        >
          <Text className="text-white">
            {pack.active ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
