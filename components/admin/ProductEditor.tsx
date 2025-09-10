import React, { useState } from "react";
import * as FileSystem from "expo-file-system";
import { Platform, View, Text, ScrollView, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { databases, storage, appwriteConfig } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";

import TextInput from "@/components/ui/TextInput"; // ✅ standardized input
import Button from "@/components/ui/Button";       // ✅ standardized button

interface ProductEditorProps {
  product: any;
  onCancel: () => void;
  onSaved: () => void;
}

export default function ProductEditor({
  product,
  onCancel,
  onSaved,
}: ProductEditorProps) {
  const [form, setForm] = useState({
    name: product.name ?? "",
    description: product.description ?? "",
    cost_price: String(product.cost_price ?? 0),
    supplier: product.supplier ?? "Mercadona",
    image_url: product.image_url ?? "",
    image_thumb: product.image_thumb ?? "",
    active: product.active ?? true,
    default_markup: String(product.default_markup ?? 0.3),
  });

  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        setUploading(true);
        const asset = result.assets[0];
        let uploaded;

        if (Platform.OS === "web") {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          uploaded = await storage.createFile(appwriteConfig.bucketId, ID.unique(), blob as any);
        } else {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          uploaded = await storage.createFile(appwriteConfig.bucketId, ID.unique(), {
            uri: asset.uri,
            type: asset.type ?? "image/jpeg",
            name: asset.fileName ?? `upload-${Date.now()}.jpg`,
            size: fileInfo.size ?? 1,
          });
        }

        const fileId = uploaded.$id;
        const fullUrl = storage.getFileView(appwriteConfig.bucketId, fileId);
        const thumbUrl = storage.getFilePreview(appwriteConfig.bucketId, fileId, 120, 120);

        setForm((f) => ({
          ...f,
          image_url: fullUrl,
          image_thumb: thumbUrl,
        }));
      } catch (err) {
        console.error("❌ Image upload failed:", err);
        Alert.alert("Upload Failed", "Could not upload image.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: form.name,
        description: form.description,
        cost_price: parseFloat(form.cost_price),
        supplier: form.supplier,
        image_url: form.image_url,
        image_thumb: form.image_thumb,
        active: form.active,
        default_markup: parseFloat(form.default_markup),
      };

      if (product.$id) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId,
          product.$id,
          payload
        );
      } else {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId,
          ID.unique(),
          payload
        );
      }

      Alert.alert("Success", "Product saved!");
      onSaved();
    } catch (err: any) {
      console.error("❌ [ProductEditor] Save failed:", err);
      Alert.alert("Error", err.message ?? "Could not save product.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-6">
        {product.$id ? "Edit Product" : "New Product"}
      </Text>

      <TextInput
        label="Product Name"
        placeholder="Enter product name"
        value={form.name}
        onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
      />

      <TextInput
        label="Description"
        placeholder="Enter description"
        value={form.description}
        onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
        multiline
      />

      <TextInput
        label="Cost Price (€)"
        placeholder="0.00"
        value={form.cost_price}
        onChangeText={(t) => setForm((f) => ({ ...f, cost_price: t }))}
        keyboardType="numeric"
      />

      {/* Supplier Dropdown */}
      <Text className="mb-1 text-gray-700 font-semibold">Supplier</Text>
      <View className="border border-gray-300 rounded-lg mb-4">
        <Picker
          selectedValue={form.supplier}
          onValueChange={(val) => setForm((f) => ({ ...f, supplier: val }))}
        >
          <Picker.Item label="Mercadona" value="Mercadona" />
          <Picker.Item label="Carrefour" value="Carrefour" />
        </Picker>
      </View>

      <TextInput
        label="Default Markup"
        placeholder="e.g. 0.3"
        value={form.default_markup}
        onChangeText={(t) => setForm((f) => ({ ...f, default_markup: t }))}
        keyboardType="numeric"
      />

      {/* Image Upload */}
      <View className="mb-6">
        {form.image_thumb ? (
          <Image
            source={{ uri: form.image_thumb }}
            style={{ width: 120, height: 120, borderRadius: 8, marginBottom: 10 }}
          />
        ) : (
          <Text className="text-gray-500 mb-2">No image selected</Text>
        )}

        <Button
          variant="secondary"
          isLoading={uploading}
          onPress={pickImage}
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3">
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
    </ScrollView>
  );
}
