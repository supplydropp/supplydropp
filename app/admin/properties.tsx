import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Text, TextInput, View } from 'react-native';
import useAuthStore from '@/store/auth.store';
import { listProperties, listUsers } from '@/lib/appwrite';
import type { Property, User } from '@/type';

type Row = Property & {
  ownerName?: string;
  ownerEmail?: string;
};

export default function AdminProperties() {
  const { user } = useAuthStore();
  const role = user?.role;

  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = async () => {
    try {
      setLoading(true);

      // Pull all properties
      const props = await listProperties(); // returns Property[]
      // Pull all users once and heuristically map "owner" as first host/admin whose currentPropertyId matches
      const users = await listUsers();      // returns User[]

      const byProp: Record<string, User[]> = {};
      for (const u of users) {
        const pid = (u as any).currentPropertyId as string | null;
        if (!pid) continue;
        (byProp[pid] ||= []).push(u);
      }

      const rows: Row[] = props.map((p) => {
        const candidates = byProp[p.$id] || [];
        const hostOrAdmin = candidates.find((u) => u.role === 'host') || candidates.find((u) => u.role === 'admin') || candidates[0];
        return {
          ...p,
          ownerName: hostOrAdmin?.name,
          ownerEmail: hostOrAdmin?.email,
        };
      });

      setItems(rows);
    } catch (e: any) {
      const msg = e?.message ?? 'Failed to load properties';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') load();
  }, [role]);

  const counts = useMemo(() => {
    return items.reduce(
      (acc, p) => {
        if (p.active) acc.active += 1;
        else acc.inactive += 1;
        return acc;
      },
      { active: 0, inactive: 0 }
    );
  }, [items]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((p) =>
      (p.name?.toLowerCase() ?? '').includes(qq) ||
      (p.code?.toLowerCase() ?? '').includes(qq) ||
      (p.address?.toLowerCase() ?? '').includes(qq) ||
      (p.ownerEmail?.toLowerCase() ?? '').includes(qq) ||
      (p.ownerName?.toLowerCase() ?? '').includes(qq)
    );
  }, [q, items]);

  if (role !== 'admin') {
    return (
      <View className="flex-1 bg-white items-center justify-center p-5">
        <Text>You don’t have permission to view this page.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-2">Properties</Text>

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row gap-2">
          <View className="px-3 py-2 rounded-xl bg-gray-200"><Text>Active: {counts.active}</Text></View>
          <View className="px-3 py-2 rounded-xl bg-gray-200"><Text>Inactive: {counts.inactive}</Text></View>
          <View className="px-3 py-2 rounded-xl bg-gray-200"><Text>Total: {items.length}</Text></View>
        </View>
      </View>

      <TextInput
        placeholder="Search by name, code, address, or owner"
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
              <Text className="font-semibold">{item.name}</Text>
              <Text className="text-gray-500">Code: {item.code}</Text>
              {item.address ? <Text className="text-gray-500">Address: {item.address}</Text> : null}
              <Text className="text-gray-500">Status: {item.active ? 'Active' : 'Inactive'}</Text>
              <Text className="text-gray-500">Owner: {item.ownerName || '—'} {item.ownerEmail ? `(${item.ownerEmail})` : ''}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
