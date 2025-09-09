// app/(tabs)/profile.tsx
import React, { useState } from "react";
import { runSeeder } from "@/lib/seeder";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import useAuthStore from "@/store/auth.store";
import { joinPropertyByCode, signOut } from "@/lib/appwrite";

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
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-5 gap-4">
        <Text className="text-2xl font-bold">Profile</Text>

        <View className="bg-white rounded-xl p-4 shadow">
          <Text className="paragraph-semibold">
            Name: <Text className="paragraph-medium">{user?.name ?? "—"}</Text>
          </Text>
          <Text className="paragraph-semibold">
            Email: <Text className="paragraph-medium">{user?.email ?? "—"}</Text>
          </Text>
          <Text className="paragraph-semibold">
            Role: <Text className="paragraph-medium">{role}</Text>
          </Text>
          <Text className="paragraph-semibold">
            Current property:{" "}
            <Text className="paragraph-medium">
              {user?.currentPropertyId ?? "Not selected"}
            </Text>
          </Text>
        </View>

        {/* Guest + Host common action */}
        <View className="bg-white rounded-xl p-4 shadow gap-3">
          <Text className="font-semibold">Join property by code</Text>
          <TextInput
            placeholder="e.g. ROSE-101"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            className="border-b p-2"
          />
          <TouchableOpacity
            onPress={handleJoin}
            disabled={joining}
            className="bg-emerald-600 rounded-full p-3 active:opacity-90"
          >
            <Text className="text-white text-center font-semibold">
              {joining ? "Joining…" : "Join"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Admin tools */}
        {role === "admin" && (
          <View className="bg-white rounded-xl p-4 shadow gap-3">
            <Text className="font-semibold">Admin Tools</Text>

            <TouchableOpacity
              onPress={() => router.push("/admin")}
              className="bg-indigo-600 rounded-full p-3 active:opacity-90"
            >
              <Text className="text-white text-center font-semibold">
                Go to Admin Dashboard
              </Text>
            </TouchableOpacity>

            {/* Temporary seeder button */}
            <TouchableOpacity
              onPress={handleSeed}
              className="bg-purple-600 rounded-full p-3 active:opacity-90"
            >
              <Text className="text-white text-center font-semibold">
                Seed DB (Test Only)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity
          disabled={isLoggingOut || isLoading}
          onPress={handleLogout}
          className="bg-error rounded-full p-3 mt-4 active:opacity-90"
        >
          <Text className="text-white text-center font-semibold">
            {isLoggingOut ? "Logging out…" : "Log out"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
