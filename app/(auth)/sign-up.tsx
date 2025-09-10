import { View, Text, Alert } from "react-native";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import * as Sentry from "@sentry/react-native";

import TextInput from "@/components/ui/TextInput"; // ✅ standardized input
import Button from "@/components/ui/Button";       // ✅ standardized button
import { createUser } from "@/lib/appwrite";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name || !email || !password) {
      return Alert.alert("Error", "Please enter your name, email and password.");
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createUser({ name, email, password });
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Sign-up failed");
      Sentry.captureException(error, { extra: { email } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-6 bg-white rounded-lg p-5 mt-5">
      <TextInput
        label="Full name"
        placeholder="Enter your full name"
        value={form.name}
        onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
      />
      <TextInput
        label="Email"
        placeholder="Enter your email"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        label="Password"
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
        secureTextEntry
      />

      <Button variant="primary" isLoading={isSubmitting} onPress={submit}>
        Sign Up
      </Button>

      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="text-gray-600">Already have an account?</Text>
        <Link href="/sign-in" className="font-semibold text-primary">
          Sign In
        </Link>
      </View>
    </View>
  );
};

export default SignUp;
