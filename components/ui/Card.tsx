import React, { ReactNode } from "react";
import { View } from "react-native";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <View
      className={`bg-white rounded-2xl shadow-sm p-4 border border-gray-200 ${className}`}
    >
      {children}
    </View>
  );
}
