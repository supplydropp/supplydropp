// components/ui/TextInput.tsx
import React from "react";
import {
  TextInput as RNTextInput,
  Text,
  View,
  TextInputProps,
  Platform,
} from "react-native";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

const TextInput = ({ label, error, ...props }: Props) => {
  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1 text-gray-700 font-semibold">{label}</Text>
      )}

      <RNTextInput
        {...props}
        className={`border rounded-lg p-3 bg-white text-base
          ${error ? "border-red-500" : "border-gray-300"}
          focus:border-[#28aae2] focus:ring-1 focus:ring-[#28aae2]
        `}
        placeholderTextColor="#9ca3af"
        autoCapitalize={props.autoCapitalize ?? "none"}
        autoCorrect={props.autoCorrect ?? false}
      />

      {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
    </View>
  );
};

export default TextInput;
