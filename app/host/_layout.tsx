import { Redirect, Slot } from "expo-router";
import useAuthStore from "@/store/auth.store";

export default function HostLayout() {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (user?.role !== "host") return <Redirect href="/(tabs)" />;
  return <Slot />;
}
