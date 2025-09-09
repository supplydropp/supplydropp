import { Redirect, Slot } from "expo-router";
import useAuthStore from "@/store/auth.store";

export default function AdminLayout() {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (user?.role !== "admin") return <Redirect href="/(tabs)" />;
  return <Slot />;
}
