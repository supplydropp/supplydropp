import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

export default function ProductSelector({
  products,
  selected,
  setSelected,
}: {
  products: any[];
  selected: any[];
  setSelected: (val: any[]) => void;
}) {
  function toggleProduct(product: any) {
    if (selected.find((sp) => sp.$id === product.$id)) {
      setSelected(selected.filter((sp) => sp.$id !== product.$id));
    } else {
      setSelected([...selected, product]);
    }
  }

  return (
    <View>
      <Text className="font-semibold mb-2">Products</Text>
      {products.map((p) => (
        <TouchableOpacity
          key={p.$id}
          onPress={() => toggleProduct(p)}
          className={`p-2 rounded mb-1 ${
            selected.find((sp) => sp.$id === p.$id)
              ? "bg-green-300"
              : "bg-gray-200"
          }`}
        >
          <Text>{p.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
