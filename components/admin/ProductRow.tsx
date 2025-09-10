// components/admin/ProductRow.tsx

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native"; // ✅ icon
import { colors } from "@/constants/theme";

interface ProductRowProps {
  product: any;
  onEdit: (product: any) => void;
  onDelete?: (id: string) => void; // optional, for future menu
}

const ProductRow = ({ product, onEdit }: ProductRowProps) => {
  return (
    <TouchableOpacity
      onPress={() => onEdit(product)}
      className="flex-row items-center justify-between py-4 border-b border-gray-200"
    >
      {/* Left side: name + supplier */}
      <View>
        <Text className="text-base font-semibold text-black">
          {product.name}
        </Text>
        <Text className="text-sm text-gray-500">
          {product.supplier ?? "—"}
        </Text>
      </View>

      {/* Right side: price + chevron */}
      <View className="flex-row items-center gap-2">
        <Text className="text-base font-semibold text-black">
          €{Number(product.cost_price || 0).toFixed(2)}
        </Text>
        <ChevronRight size={20} color={colors.gray} />
      </View>
    </TouchableOpacity>
  );
};

export default ProductRow;
