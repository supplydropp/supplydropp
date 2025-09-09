// app/(tabs)/host/properties.tsx
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useAuthStore from '@/store/auth.store';
import { createPropertyForCurrentUser, listProperties, setCurrentProperty } from '@/lib/appwrite';
import type { Property } from '@/type';

export default function HostProperties() {
  const { user, fetchAuthenticatedUser } = useAuthStore();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');

  const role = user?.role; // use role for gating & effect deps

  const load = async () => {
    try {
      setLoading(true);
      const props = await listProperties();
      setItems(props);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'host' || role === 'admin') {
      load();
    }
  }, [role]);

  const create = async () => {
    if (!name || !code) {
      return Alert.alert('Missing info', 'Name and code are required');
    }
    try {
      setSaving(true);
      await createPropertyForCurrentUser({
        name,
        code: code.trim().toUpperCase(),
        address,
      });
      setName('');
      setCode('');
      setAddress('');
      await fetchAuthenticatedUser(); // refresh to pick up currentPropertyId change
      await load();
      Alert.alert('Success', 'Property created and set as current');
    } catch (e: any) {
      console.error('createProperty error:', e);
      Alert.alert('Error creating property', e?.message ?? 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const setCurrent = async (propertyId: string) => {
    try {
      if (!user) return;
      setSaving(true);
      await setCurrentProperty(user.$id, propertyId);
      await fetchAuthenticatedUser();
      Alert.alert('Updated', 'Current property set');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to set current property');
    } finally {
      setSaving(false);
    }
  };

  if (!(role === 'host' || role === 'admin')) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-5">
        <Text>You don’t have permission to view this page.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-4">Properties</Text>

      {/* Create form */}
      <View className="bg-white rounded-xl p-4 shadow mb-6">
        <Text className="font-semibold mb-2">Create property</Text>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          className="border-b mb-2 p-2"
        />
        <TextInput
          placeholder="Code (e.g. ROSE-101)"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          className="border-b mb-2 p-2"
        />
        <TextInput
          placeholder="Address (optional)"
          value={address}
          onChangeText={setAddress}
          className="border-b mb-3 p-2"
        />
        <TouchableOpacity onPress={create} disabled={saving} className="bg-primary p-3 rounded-xl">
          <Text className="text-white text-center font-semibold">
            {saving ? 'Saving…' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text>Loading…</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.$id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const isCurrent = user?.currentPropertyId === item.$id;
            return (
              <View className="bg-white rounded-xl p-4 shadow flex-row items-center justify-between">
                <View>
                  <Text className="font-semibold">{item.name}</Text>
                  <Text className="text-gray-500">Code: {item.code}</Text>
                  {item.address ? <Text className="text-gray-500">{item.address}</Text> : null}
                </View>
                <TouchableOpacity
                  onPress={() => setCurrent(item.$id)}
                  disabled={saving || isCurrent}
                  className={`px-4 py-2 rounded-xl ${isCurrent ? 'bg-gray-200' : 'bg-dark-100'}`}
                >
                  <Text className={`font-semibold ${isCurrent ? 'text-gray-500' : 'text-white'}`}>
                    {isCurrent ? 'Current' : 'Set current'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
