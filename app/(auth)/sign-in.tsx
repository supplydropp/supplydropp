import { View, Text, Alert } from "react-native";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import * as Sentry from "@sentry/react-native";

import TextInput from "@/components/ui/TextInput";
import Button from "@/components/ui/Button";
import { signIn } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const { fetchAuthenticatedUser } = useAuthStore();

  const submit = async () => {
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      return Alert.alert("Error", "Please enter valid email address & password.");
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await signIn({ email, password });
      await fetchAuthenticatedUser();
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Sign-in failed");
      Sentry.captureException(error, { extra: { email } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-6 bg-white rounded-lg p-5 mt-5">
      <TextInput
        placeholder="Enter your email"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
        label="Password"
        secureTextEntry
      />

      <Button variant="primary" isLoading={isSubmitting} onPress={submit}>
        Sign In
      </Button>

      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="text-gray-600">Don&apos;t have an account?</Text>
        <Link href="/sign-up" className="font-semibold text-[#28aae2]">
          Sign Up
        </Link>
      </View>
    </View>
  );
};

export default SignIn;
