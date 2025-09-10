// components/ui/Button.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  GestureResponderEvent,
} from "react-native";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void; // ✅ now optional
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}

const Button = ({
  children,
  onPress,
  isLoading = false,
  variant = "primary",
  className = "",
}: ButtonProps) => {
  let base = "px-4 py-3 rounded-lg items-center";
  let variantClasses = "";

  switch (variant) {
    case "primary":
      variantClasses = "bg-[#28aae2]";
      break;
    case "secondary":
      variantClasses = "bg-gray-200";
      break;
    case "danger":
      variantClasses = "bg-red-500"; // ✅ red button
      break;
  }

  return (
    <TouchableOpacity
  onPress={onPress}
  disabled={isLoading}
  className={`${base} ${variantClasses} ${className}`}
>

      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text
          className={`font-semibold ${
            variant === "secondary" ? "text-black" : "text-white"
          }`}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
