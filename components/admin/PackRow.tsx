import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/constants/theme";

interface PackRowProps {
  pack: any;
  onEdit: (pack: any) => void;
}

const PackRow = ({ pack, onEdit }: PackRowProps) => {
  return (
    <TouchableOpacity
      onPress={() => onEdit(pack)}
      className="flex-row items-center justify-between py-4 border-b border-gray-200"
    >
      {/* Left side: name + description */}
      <View>
        <Text className="text-base font-semibold text-black">{pack.name}</Text>
        <Text className="text-sm text-gray-500" numberOfLines={1}>
          {pack.description || "No description"}
        </Text>
      </View>

      {/* Right side: price + chevron */}
      <View className="flex-row items-center gap-2">
        <Text className="text-base font-semibold text-black">
          €{pack.price?.toFixed(2) ?? "0.00"}
        </Text>
        <ChevronRight size={20} color={colors.gray} />
      </View>
    </TouchableOpacity>
  );
};

export default PackRow;
