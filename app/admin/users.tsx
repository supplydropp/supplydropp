import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useAuthStore from '@/store/auth.store';
import { listUsers, updateUserProfile } from '@/lib/appwrite';
import type { User } from '@/type';

type Role = 'guest' | 'host' | 'admin';

type RowUser = {
  $id: string;
  name?: string;
  email?: string;
  role?: Role;
  hotelId?: string | null;
  currentPropertyId?: string | null;
};

const RolePill = ({ label, active, onPress }: { label: Role; active: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} className={`px-3 py-1 rounded-full ${active ? 'bg-primary' : 'bg-gray-200'}`} style={{ marginRight: 8 }}>
    <Text className={active ? 'text-white font-semibold' : 'text-black'}>{label}</Text>
  </TouchableOpacity>
);

export default function AdminUsers() {
  const { isAdmin } = useAuthStore();
  const [users, setUsers] = useState<RowUser[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const docs = await listUsers();
      const rows = (docs as User[]).map((d) => ({
        $id: d.$id,
        name: d.name,
        email: d.email,
        role: (d.role ?? 'guest') as Role,
        hotelId: d.hotelId ?? null,
        currentPropertyId: d.currentPropertyId ?? null,
      }));
      setUsers(rows);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) load();
  }, []);

  const onSetRole = (userId: string, role: Role) => setUsers((prev) => prev.map((u) => (u.$id === userId ? { ...u, role } : u)));
  const onSetHotel = (userId: string, hotelId: string) => setUsers((prev) => prev.map((u) => (u.$id === userId ? { ...u, hotelId } : u)));
  const onSetCurrentProperty = (userId: string, pid: string) => setUsers((prev) => prev.map((u) => (u.$id === userId ? { ...u, currentPropertyId: pid } : u)));

  const save = async (u: RowUser) => {
    try {
      setSaving(u.$id);
      await updateUserProfile(u.$id, { role: u.role, hotelId: u.hotelId ?? null, currentPropertyId: u.currentPropertyId ?? null });
      Alert.alert('Saved', `${u.email || u.name || u.$id} updated`);
    } catch (e: any) {
      Alert.alert('Update failed', e?.message ?? 'Check collection Update permissions or switch to a server function.');
    } finally {
      setSaving(null);
    }
  };

  const counts = useMemo(
    () => users.reduce((acc, u) => { const r = (u.role ?? 'guest') as Role; acc[r] = (acc[r] || 0) + 1; return acc; }, { guest: 0, host: 0, admin: 0 } as Record<Role, number>),
    [users]
  );

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return users;
    return users.filter((u) => u.name?.toLowerCase().includes(qq) || u.email?.toLowerCase().includes(qq) || u.role?.toLowerCase().includes(qq));
  }, [q, users]);

  // ADMIN-ONLY GUARD
  if (!isAdmin()) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-5">
        <Text>You don't have permission to view this page.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-2">Users</Text>

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row gap-2">
          <View className="px-3 py-2 rounded-xl bg-gray-200"><Text>Guests: {counts.guest}</Text></View>
          <View className="px-3 py-2 rounded-xl bg-gray-200"><Text>Hosts: {counts.host}</Text></View>
          <View className="px-3 py-2 rounded-xl bg-gray-200"><Text>Admins: {counts.admin}</Text></View>
        </View>
      </View>

      <TextInput
        placeholder="Search by name, email, or role"
        value={q}
        onChangeText={setQ}
        className="border-b p-2 mb-3"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {loading ? (
        <Text>Loading…</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.$id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <View className="bg-white rounded-xl p-4 shadow">
              <Text className="font-semibold">{item.name || '—'}</Text>
              <Text className="text-gray-500">{item.email || '—'}</Text>

              <View className="flex-row items-center mt-3">
                <RolePill label="guest" active={item.role === 'guest'} onPress={() => onSetRole(item.$id, 'guest')} />
                <RolePill label="host" active={item.role === 'host'} onPress={() => onSetRole(item.$id, 'host')} />
                <RolePill label="admin" active={item.role === 'admin'} onPress={() => onSetRole(item.$id, 'admin')} />
              </View>

              <Text className="mt-3 mb-1 text-gray-600">hotelId (legacy)</Text>
              <TextInput
                placeholder="e.g. 68643a390017b239fa0f"
                value={item.hotelId ?? ''}
                onChangeText={(t) => onSetHotel(item.$id, t)}
                className="border-b p-2"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text className="mt-3 mb-1 text-gray-600">currentPropertyId</Text>
              <TextInput
                placeholder="property document ID"
                value={item.currentPropertyId ?? ''}
                onChangeText={(t) => onSetCurrentProperty(item.$id, t)}
                className="border-b p-2"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity onPress={() => save(item)} disabled={saving === item.$id} className="bg-primary p-3 rounded-xl mt-3 active:opacity-90">
                <Text className="text-white text-center font-semibold">{saving === item.$id ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
