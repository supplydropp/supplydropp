import React from "react";
import { View, Text } from "react-native";

type Props = {
  products: { cost_price: number; quantity: number }[];
  price: number;
  targetMargin?: number;
};

export default function MarginSummary({ products, price, targetMargin = 0.35 }: Props) {
  // Calculate total cost
  const totalCost = products.reduce(
    (sum, p) => sum + p.cost_price * (p.quantity || 1),
    0
  );

  const margin = price > 0 ? (price - totalCost) / price : 0;
  const marginPct = (margin * 100).toFixed(1);

  let marginColor = "text-gray-600";
  if (margin >= targetMargin) marginColor = "text-green-600";
  else if (margin >= 0.2) marginColor = "text-yellow-600";
  else marginColor = "text-red-600";

  return (
    <View className="mt-2">
      <Text className="text-sm text-gray-500">
        Cost: €{totalCost.toFixed(2)} | Price: €{price.toFixed(2)}
      </Text>
      <Text className={`text-sm font-semibold ${marginColor}`}>
        Margin: {marginPct}%
      </Text>
    </View>
  );
}
