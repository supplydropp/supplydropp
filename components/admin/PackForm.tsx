import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { databases, appwriteConfig } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";

export default function PackForm({
  products,
  onSaved,
}: {
  products: any[];
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<"guest" | "host">("guest");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!name || !price || selectedProducts.length === 0) {
      Alert.alert("Missing fields", "Please complete all fields.");
      return;
    }
    try {
      setSaving(true);
      const newPack = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.packsCollectionId,
        ID.unique(),
        {
          name,
          description: desc,
          price: parseFloat(price),
          type,
          active: true,
          image_url: "https://via.placeholder.com/400x300.png?text=New+Pack",
          target_margin: 0.35,
        }
      );
      for (const p of selectedProducts) {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.packItemsCollectionId,
          ID.unique(),
          { packId: newPack.$id, productId: p.$id, quantity: 1 }
        );
      }
      Alert.alert("Success", "Pack added!");
      setName("");
      setDesc("");
      setPrice("");
      setType("guest");
      setSelectedProducts([]);
      onSaved();
    } catch (err: any) {
      console.error("Add pack failed:", err);
      Alert.alert("Error", err.message ?? "Could not add pack.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="bg-gray-100 p-4 rounded-lg mb-4">
      <Text className="font-semibold mb-2">Add New Pack</Text>
      <TextInput
        placeholder="Pack Name"
        value={name}
        onChangeText={setName}
        className="border rounded p-2 mb-2"
      />
      <TextInput
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
        className="border rounded p-2 mb-2"
      />
      <TextInput
        placeholder="Price (€)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        className="border rounded p-2 mb-2"
      />
      <View className="flex-row gap-2 mb-3">
        {(["guest", "host"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setType(t)}
            className={`px-3 py-2 rounded ${
              type === t ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <Text className="text-white">{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="font-semibold mb-2">Select Products</Text>
      {products.map((p) => (
        <TouchableOpacity
          key={p.$id}
          onPress={() =>
            setSelectedProducts((prev) =>
              prev.find((sp) => sp.$id === p.$id)
                ? prev.filter((sp) => sp.$id !== p.$id)
                : [...prev, p]
            )
          }
          className={`p-2 rounded mb-1 ${
            selectedProducts.find((sp) => sp.$id === p.$id)
              ? "bg-green-300"
              : "bg-gray-200"
          }`}
        >
          <Text>{p.name}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={handleAdd}
        disabled={saving}
        className="bg-emerald-600 p-3 rounded-lg mt-3"
      >
        <Text className="text-white text-center font-semibold">
          {saving ? "Saving..." : "Add Pack"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
