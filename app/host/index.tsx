import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import useAuthStore from '@/store/auth.store';

export default function HostHome() {
  const { user } = useAuthStore();

  return (
    <View className="flex-1 bg-white p-5 gap-4">
      <Text className="text-2xl font-bold">Host</Text>
      <Text className="text-gray-600">Current property: {user?.currentPropertyId ?? 'Not selected'}</Text>

      <Link href="/(tabs)/host/properties" asChild>
        <TouchableOpacity className="bg-emerald-600 p-4 rounded-xl">
          <Text className="text-white text-center font-semibold">Manage Properties</Text>
        </TouchableOpacity>
      </Link>

      {/* Future host tools */}
      <Link href="/(tabs)/host/orders" asChild>
        <TouchableOpacity className="bg-dark-100 p-4 rounded-xl">
          <Text className="text-white text-center font-semibold">View Property Orders</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/(tabs)/host/menus" asChild>
        <TouchableOpacity className="bg-primary p-4 rounded-xl">
          <Text className="text-white text-center font-semibold">Manage Menus</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
