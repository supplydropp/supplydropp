// app/(tabs)/profile.tsx
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import useAuthStore from "@/store/auth.store";
import { joinPropertyByCode, signOut } from "@/lib/appwrite";
import { runSeeder } from "@/lib/seeder";

import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import { colors } from "@/constants/theme";

export default function Profile() {
  const { user, fetchAuthenticatedUser, isLoading } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [joining, setJoining] = useState(false);
  const [code, setCode] = useState("");

  const role = user?.role ?? "guest";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
      await fetchAuthenticatedUser();
      router.replace("/sign-in");
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleJoin = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return Alert.alert("Enter code", "Please enter a property code.");
    try {
      setJoining(true);
      const prop = await joinPropertyByCode(c);
      setCode("");
      await fetchAuthenticatedUser();
      Alert.alert("Joined", `You’re now set to: ${prop.name}`);
    } catch (e: any) {
      Alert.alert("Join failed", e?.message ?? "Could not join property.");
    } finally {
      setJoining(false);
    }
  };

  const handleSeed = async () => {
    try {
      await runSeeder();
      Alert.alert("Seeder", "✅ DB seeded successfully!");
    } catch (e: any) {
      console.error("Seeder error:", e);
      Alert.alert("Seeder Failed", e?.message ?? "Unknown error");
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={{
        paddingTop: 24,
        paddingHorizontal: 20,
      }}
    >
      {/* Header */}
      <Text className="text-2xl font-bold mb-6">Profile</Text>

      {/* Profile Info */}
      <View className="gap-2 mb-8">
        <Text className="text-gray-700">
          <Text className="font-semibold">Name:</Text> {user?.name ?? "—"}
        </Text>
        <Text className="text-gray-700">
          <Text className="font-semibold">Email:</Text> {user?.email ?? "—"}
        </Text>
        <Text className="text-gray-700">
          <Text className="font-semibold">Role:</Text> {role}
        </Text>
        <Text className="text-gray-700">
          <Text className="font-semibold">Current property:</Text>{" "}
          {user?.currentPropertyId ?? "Not selected"}
        </Text>
      </View>

      {/* Join property */}
      <View className="mb-8">
        <Text className="font-semibold mb-2">Join property by code</Text>
        <TextInput
          placeholder="e.g. ROSE-101"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        <Button
          variant="primary"
          isLoading={joining}
          onPress={handleJoin}
          className="mt-3"
        >
          Join
        </Button>
      </View>

      {/* Admin tools */}
      {role === "admin" && (
        <View className="mb-8">
          <Text className="font-semibold mb-3">Admin Tools</Text>
          <Button
            variant="secondary"
            onPress={() => router.push("/admin")}
            className="mb-2"
          >
            Go to Admin Dashboard
          </Button>
          <Button variant="secondary" onPress={handleSeed}>
            Seed DB (Test Only)
          </Button>
        </View>
      )}

      {/* Logout */}
      <Button
        variant="danger"
        isLoading={isLoggingOut || isLoading}
        onPress={handleLogout}
      >
        Log out
      </Button>
    </SafeAreaView>
  );
}
