import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AdminModal, Btn, Card, Chips, Page, Pill, SearchBar, table } from '../../components/admin/AdminUI';
import { admin } from '../../constants/theme';
import { askText, confirmAction, timeAgo } from '../../lib/admin';
import { supabase } from '../../lib/supabase';

type U = {
  id: string; name: string | null; email: string; level: number;
  role: 'user' | 'admin'; status: 'active' | 'suspended'; last_active: string | null;
};

const initials = (u: U) => (u.name || u.email).split(/[ @.]/).filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

export default function Accounts() {
  const [users, setUsers] = useState<U[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'all' | 'user' | 'admin'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [selected, setSelected] = useState<U | null>(null);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_list_users');
    if (error) return setNote(error.message);
    setUsers((data ?? []) as U[]);
  }, []);

 // Initial load. State is only set after the await, and ignored if the page is gone.
useEffect(() => {
  let cancelled = false;
  supabase.rpc('admin_list_users').then(({ data, error }) => {
    if (cancelled) return;
    if (error) setNote(error.message);
    else setUsers((data ?? []) as U[]);
  });
  return () => {
    cancelled = true;
  };
}, []);

  const q = search.trim().toLowerCase();
  const shown = users.filter(
    (u) =>
      (role === 'all' || u.role === role) &&
      (status === 'all' || u.status === status) &&
      (!q || (u.name ?? '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.includes(q))
  );

  const run = async (fn: string, args: object, ok: string) => {
    const { error } = await supabase.rpc(fn, args);
    setNote(error ? error.message : ok);
    if (!error) { setSelected(null); await load(); }
  };

  const toggleStatus = (u: U) => {
    const next = u.status === 'active' ? 'suspended' : 'active';
    if (confirmAction(`${next === 'suspended' ? 'Suspend' : 'Reinstate'} ${u.email}?`))
      run('admin_set_status', { p_user: u.id, p_status: next }, next === 'suspended' ? 'Account suspended.' : 'Account reinstated.');
  };

  const toggleRole = (u: U) => {
    const next = u.role === 'admin' ? 'user' : 'admin';
    if (confirmAction(`Make ${u.email} ${next === 'admin' ? 'an administrator' : 'an adventurer'}?`))
      run('admin_set_role', { p_user: u.id, p_role: next }, 'Role updated.');
  };

  const addAdmin = () => {
    const email = askText('Email of an existing account to make an administrator:');
    if (!email) return;
    const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) return setNote('No account with that email. They need to register first.');
    toggleRole(u);
  };

  return (
    <Page
      title="Account management"
      subtitle="Manage adventurers, permissions and account status."
      action={<Btn label="Add administrator" icon="plus" onPress={addAdmin} />}
    >
      {!!note && <Text style={{ color: admin.primary }}>{note}</Text>}

      <Card style={{ padding: 14, gap: 12 }}>
        <View style={s.filters}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email or user ID" />
        </View>
        <View style={s.filters}>
          <Chips value={role} onChange={setRole} options={[{ value: 'all', label: 'All roles' }, { value: 'user', label: 'Adventurers' }, { value: 'admin', label: 'Admins' }]} />
          <Chips value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />
        </View>
      </Card>

      <Card>
        <View style={table.head}>
          <Text style={[table.headText, { flex: 3 }]}>ADVENTURER</Text>
          <Text style={[table.headText, { flex: 1 }]}>LEVEL</Text>
          <Text style={[table.headText, { flex: 1.2 }]}>ROLE</Text>
          <Text style={[table.headText, { flex: 1.2 }]}>STATUS</Text>
          <Text style={[table.headText, { flex: 1.4 }]}>LAST ACTIVE</Text>
          <View style={{ width: 44 }} />
        </View>
        {shown.length === 0 && <Text style={table.empty}>No accounts match.</Text>}
        {shown.map((u, i) => (
          <View key={u.id} style={[table.row, i % 2 === 1 && { backgroundColor: admin.surfaceAlt }]}>
            <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={s.avatar}><Text style={s.avatarText}>{initials(u)}</Text></View>
              <View>
                <Text style={[table.text, { fontWeight: '600' }]}>{u.name || 'Unnamed adventurer'}</Text>
                <Text style={table.muted}>{u.email}</Text>
              </View>
            </View>
            <Text style={[table.muted, { flex: 1 }]}>Lvl {u.level}</Text>
            <Text style={[table.muted, { flex: 1.2 }]}>{u.role === 'admin' ? 'Admin' : 'Adventurer'}</Text>
            <View style={{ flex: 1.2 }}>
              <Pill text={u.status === 'active' ? 'Active' : 'Suspended'} tone={u.status === 'active' ? 'green' : 'red'} />
            </View>
            <Text style={[table.muted, { flex: 1.4 }]}>{timeAgo(u.last_active)}</Text>
            <Pressable style={s.more} onPress={() => setSelected(u)}>
              <Feather name="more-horizontal" size={16} color={admin.muted} />
            </Pressable>
          </View>
        ))}
      </Card>
      <Text style={table.muted}>Showing {shown.length} of {users.length} accounts (latest 500).</Text>

      <AdminModal visible={!!selected} title={selected?.name || selected?.email || ''} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <Text style={table.muted}>{selected.email}</Text>
            <View style={{ gap: 10 }}>
              <Btn
                kind={selected.status === 'active' ? 'danger' : 'primary'}
                label={selected.status === 'active' ? 'Suspend account' : 'Reinstate account'}
                onPress={() => toggleStatus(selected)}
              />
              <Btn
                kind="tan"
                label={selected.role === 'admin' ? 'Make adventurer' : 'Make administrator'}
                onPress={() => toggleRole(selected)}
              />
              <Btn kind="ghost" label="Close" onPress={() => setSelected(null)} />
            </View>
          </>
        )}
      </AdminModal>
    </Page>
  );
}

const s = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 10, backgroundColor: admin.purpleBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: admin.purple, fontSize: 12, fontWeight: '700' },
  more: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: admin.border, alignItems: 'center', justifyContent: 'center' },
}); 