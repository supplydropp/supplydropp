// app/(tabs)/layout.tsx
import { Redirect, Tabs } from "expo-router";
import useAuthStore from "@/store/auth.store";
import { Image, Text, View } from "react-native";
import cn from "clsx";
import { images } from "@/constants";

const TabBarIcon = ({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: any;
  title: string;
}) => (
  <View className="items-center justify-center">
    <Image
      source={icon}
      resizeMode="contain"
      style={{
        width: 22,
        height: 22,
        tintColor: focused ? "#FE8C00" : "#5D5F6D",
      }}
    />
    <Text
      numberOfLines={1}
      ellipsizeMode="clip"
      style={{ flexShrink: 0 }}
      className={cn(
        "text-[10px] font-medium mt-1",
        focused ? "text-primary" : "text-gray-200"
      )}
    >
      {title}
    </Text>
  </View>
);

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: { paddingVertical: 6 },
        tabBarStyle: {
          height: 80,
          paddingBottom: 12,
          paddingTop: 6,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          shadowColor: "#1a1a1a",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
        },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon title="Home" icon={images.home} focused={focused} />
          ),
        }}
      />

      {/* Store (was Search) */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Store",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon title="Store" icon={images.search} focused={focused} />
          ),
        }}
      />

      {/* Orders (was Cart) */}
      <Tabs.Screen
        name="cart"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon title="Orders" icon={images.bag} focused={focused} />
          ),
        }}
      />

      {/* Profile (expands based on role) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon title="Profile" icon={images.person} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
