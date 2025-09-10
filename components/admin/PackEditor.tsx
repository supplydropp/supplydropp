import React, { useEffect, useState } from "react";
import { View, Text, Alert, FlatList } from "react-native";
import { databases, appwriteConfig } from "@/lib/appwrite";
import { ID, Query } from "react-native-appwrite";

import TextInput from "@/components/ui/TextInput"; // ✅ standardized input
import Button from "@/components/ui/Button";       // ✅ standardized button

interface PackEditorProps {
  pack: any;
  products: any[];
  onCancel: () => void;
  onSaved: () => void;
}

export default function PackEditor({
  pack,
  products,
  onCancel,
  onSaved,
}: PackEditorProps) {
  const [form, setForm] = useState({
    name: pack.name,
    description: pack.description,
    price: String(pack.price),
    type: pack.type,
    override_margin: pack.override_margin ?? null,
  });

  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<"all" | "Mercadona" | "Carrefour">("all");

  // Load existing pack items
  useEffect(() => {
    async function loadItems() {
      try {
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.packItemsCollectionId,
          [Query.equal("packIdStr", pack.$id)]
        );

        setItems(
          res.documents.map((d: any) => ({
            productId: d.productIdStr ?? d.productId?.[0],
            quantity: d.quantity,
          }))
        );
      } catch (err) {
        console.error("Failed to load pack items:", err);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, [pack.$id]);

  // Helpers
  const toggleProduct = (id: string) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.productId === id);
      if (exists) {
        return prev.filter((i) => i.productId !== id);
      } else {
        return [...prev, { productId: id, quantity: 1 }];
      }
    });
  };

  const changeQuantity = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === id ? { ...i, quantity: Math.max(1, qty) } : i
      )
    );
  };

  // Calculate cost base
  const costBase = items.reduce((sum, i) => {
    const prod = products.find((p) => p.$id === i.productId);
    return sum + (prod ? prod.cost_price * i.quantity : 0);
  }, 0);

  const margin = form.override_margin ?? pack.target_margin ?? 0.3;
  const suggestedPrice = costBase * (1 + margin);

  // Save pack + items
  const handleSave = async () => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.packsCollectionId,
        pack.$id,
        {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          type: form.type,
          override_margin: form.override_margin,
        }
      );

      // clear old pack_items
      const oldItems = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.packItemsCollectionId,
        [Query.equal("packIdStr", pack.$id)]
      );
      for (const item of oldItems.documents) {
        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.packItemsCollectionId,
          item.$id
        );
      }

      // insert new pack_items
      for (const i of items) {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.packItemsCollectionId,
          ID.unique(),
          {
            packId: [pack.$id],
            packIdStr: pack.$id,
            productId: [i.productId],
            productIdStr: i.productId,
            quantity: i.quantity,
          }
        );
      }

      Alert.alert("Success", "Pack updated!");
      onSaved();
    } catch (err: any) {
      console.error("❌ [PackEditor] Update failed:", err);
      Alert.alert("Error", err.message ?? "Could not save pack.");
    }
  };

  // Render a single product card
  const renderProduct = (p: any) => {
    const selected = items.find((i) => i.productId === p.$id);
    return (
      <View
        key={p.$id}
        className={`p-3 rounded-lg mb-3 border ${
          selected ? "border-primary bg-blue-50" : "border-gray-200 bg-white"
        }`}
      >
        <Button variant="secondary" onPress={() => toggleProduct(p.$id)}>
          <View>
            <Text className="font-semibold">{p.name}</Text>
            <Text className="text-sm text-gray-600">Cost: €{p.cost_price}</Text>
            <Text className="text-sm text-gray-500">Supplier: {p.supplier ?? "—"}</Text>
          </View>
        </Button>

        {selected && (
          <View className="flex-row items-center mt-3 gap-3">
            <Button variant="secondary" onPress={() => changeQuantity(p.$id, selected.quantity - 1)}>-</Button>
            <Text>{selected.quantity}</Text>
            <Button variant="secondary" onPress={() => changeQuantity(p.$id, selected.quantity + 1)}>+</Button>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="p-4">
        <Text>Loading...</Text>
      </View>
    );
  }

  // Filtered product list by search + supplier
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesSupplier =
      supplierFilter === "all" || p.supplier === supplierFilter;
    return matchesSearch && matchesSupplier;
  });

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-6">Edit Pack</Text>

      {/* Basic Info */}
      <TextInput
        label="Pack Name"
        placeholder="Enter pack name"
        value={form.name}
        onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
      />
      <TextInput
        label="Description"
        placeholder="Enter description"
        value={form.description}
        onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
      />

      {/* Type toggle */}
      <View className="flex-row gap-2 mb-4">
        {(["guest", "host"] as const).map((t) => (
          <Button
            key={t}
            variant={form.type === t ? "primary" : "secondary"}
            onPress={() => setForm((f) => ({ ...f, type: t }))}
          >
            {t}
          </Button>
        ))}
      </View>

      {/* Pricing Panel */}
      <View className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Text>Cost Base: €{costBase.toFixed(2)}</Text>
        {form.override_margin !== null ? (
          <>
            <Text className="mt-2">
              Suggested Price (with margin): €{suggestedPrice.toFixed(2)}
            </Text>
            <TextInput
              label="Override Margin"
              placeholder="e.g. 0.3"
              value={String(form.override_margin)}
              onChangeText={(t) =>
                setForm((f) => ({
                  ...f,
                  override_margin: t ? parseFloat(t) : null,
                }))
              }
              keyboardType="numeric"
            />
          </>
        ) : (
          <Text className="mt-2">
            Current Margin:{" "}
            {costBase > 0
              ? (
                  ((parseFloat(form.price) - costBase) / costBase) *
                  100
                ).toFixed(1) + "%"
              : "—"}
          </Text>
        )}
        <TextInput
          label="Price (€)"
          placeholder="0.00"
          value={form.price}
          onChangeText={(t) => setForm((f) => ({ ...f, price: t }))}
          keyboardType="numeric"
        />
      </View>

      {/* Search Bar */}
      <TextInput
        label="Search products"
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Supplier Filter */}
      <View className="flex-row gap-2 my-4">
        {(["all", "Mercadona", "Carrefour"] as const).map((sup) => (
          <Button
            key={sup}
            variant={supplierFilter === sup ? "primary" : "secondary"}
            onPress={() => setSupplierFilter(sup)}
          >
            {sup}
          </Button>
        ))}
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => renderProduct(item)}
        style={{ marginTop: 10 }}
      />

      {/* Actions */}
      <View className="flex-row gap-3 mt-6">
        <View className="flex-1">
          <Button variant="primary" onPress={handleSave}>
            Save
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="secondary" onPress={onCancel}>
            Cancel
          </Button>
        </View>
      </View>
    </View>
  );
}
