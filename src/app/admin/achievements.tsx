import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AdminModal, Btn, Card, Chips, Field, Input, Page, SearchBar, table } from '../../components/admin/AdminUI';
import { BadgeIconKey, badgeIcons } from '../../components/icons';
import { admin } from '../../constants/theme';
import { confirmAction } from '../../lib/admin';
import { supabase } from '../../lib/supabase';

type Badge = {
  id: string; name: string; description: string; icon: BadgeIconKey;
  criteria_type: 'quests_completed' | 'streak' | 'study_habits'; criteria_value: number;
};
type Form = { id: string | null; name: string; description: string; icon: BadgeIconKey; criteria_type: Badge['criteria_type']; value: string };

const CRITERIA = [
  { value: 'quests_completed', label: 'Quests completed' },
  { value: 'streak', label: 'Best habit streak (days)' },
  { value: 'study_habits', label: 'Study habits completed' },
] as const;
const ICONS: BadgeIconKey[] = ['swords', 'fire', 'book'];

const blank = (): Form => ({ id: null, name: '', description: '', icon: 'swords', criteria_type: 'quests_completed', value: '1' });
const label = (b: Badge) => `${CRITERIA.find((c) => c.value === b.criteria_type)?.label} ≥ ${b.criteria_value}`;

export default function Achievements() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [msg, setMsg] = useState('');
  const [formMsg, setFormMsg] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('badges').select('*').order('criteria_value').order('name');
    if (error) return setMsg(error.message);
    setBadges((data ?? []) as Badge[]);
  }, []);

  useEffect(() => {
  let cancelled = false;
  supabase
    .from('badges')
    .select('*')
    .order('criteria_value')
    .order('name')
    .then(({ data, error }) => {
      if (cancelled) return;
      if (error) setMsg(error.message);
      else setBadges((data ?? []) as Badge[]);
    });
  return () => {
    cancelled = true;
  };
}, []);

  const q = search.trim().toLowerCase();
  const shown = badges.filter((b) => !q || b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));

  const open = (b?: Badge) => {
    setFormMsg('');
    setForm(b ? { id: b.id, name: b.name, description: b.description, icon: b.icon, criteria_type: b.criteria_type, value: String(b.criteria_value) } : blank());
  };

  const save = async () => {
    if (!form) return;
    const value = Number(form.value);
    if (!form.name.trim()) return setFormMsg('Title is required.');
    if (!form.description.trim()) return setFormMsg('Describe how to unlock it.');
    if (!Number.isInteger(value) || value < 1) return setFormMsg('Target must be a whole number, 1 or more.');
    const row = { name: form.name.trim(), description: form.description.trim(), icon: form.icon, criteria_type: form.criteria_type, criteria_value: value };
    const { error } = form.id
      ? await supabase.from('badges').update(row).eq('id', form.id)
      : await supabase.from('badges').insert(row);
    if (error) return setFormMsg(error.message);
    setForm(null);
    setMsg(form.id ? 'Achievement updated.' : 'Achievement added.');
    load();
  };

  const remove = async (b: Badge) => {
    if (!confirmAction(`Delete "${b.name}"? Players who unlocked it will lose it.`)) return;
    const { error } = await supabase.from('badges').delete().eq('id', b.id);
    setMsg(error ? error.message : 'Achievement deleted.');
    if (!error) load();
  };

  return (
    <Page
      title="Achievement manager"
      subtitle="Create and manage the milestones adventurers can earn."
      action={<Btn label="Add New Achievement" icon="plus" onPress={() => open()} />}
    >
      {!!msg && <Text style={{ color: admin.primary }}>{msg}</Text>}

      <Card style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search achievements by title or criteria" />
        <Text style={table.muted}>{badges.length} achievements</Text>
      </Card>

      <Card>
        <View style={table.head}>
          <Text style={[table.headText, { width: 80 }]}>ICON</Text>
          <Text style={[table.headText, { flex: 2 }]}>TITLE</Text>
          <Text style={[table.headText, { flex: 3 }]}>UNLOCK CRITERIA</Text>
          <Text style={[table.headText, { width: 170 }]}>ACTIONS</Text>
        </View>
        {shown.length === 0 && <Text style={table.empty}>No achievements found.</Text>}
        {shown.map((b, i) => (
          <View key={b.id} style={[table.row, i % 2 === 1 && { backgroundColor: admin.surfaceAlt }]}>
            <View style={{ width: 80 }}>
              <View style={s.icon}><Image source={badgeIcons[b.icon]} style={{ width: 26, height: 26 }} resizeMode="contain" /></View>
            </View>
            <View style={{ flex: 2 }}>
              <Text style={[table.text, { fontWeight: '700' }]}>{b.name}</Text>
              <Text style={table.muted}>ACH-{b.id.slice(0, 4).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 3 }}>
              <Text style={table.text}>{b.description}</Text>
              <Text style={table.muted}>Rule: {label(b)}</Text>
            </View>
            <View style={{ width: 170, flexDirection: 'row', gap: 8 }}>
              <Btn kind="tan" label="Edit" onPress={() => open(b)} />
              <Btn kind="danger" label="Delete" onPress={() => remove(b)} />
            </View>
          </View>
        ))}
        <View style={[table.row, { backgroundColor: admin.surfaceAlt, justifyContent: 'space-between' }]}>
          <Text style={table.muted}>Showing {shown.length} of {badges.length} achievements</Text>
        </View>
      </Card>

      <AdminModal visible={!!form} title={form?.id ? 'Edit achievement' : 'New achievement'} onClose={() => setForm(null)}>
        {form && (
          <>
            <Field label="Title"><Input value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} /></Field>
            <Field label="Description (shown to players)"><Input value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} /></Field>
            <Field label="Icon">
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {ICONS.map((ic) => (
                  <Pressable key={ic} onPress={() => setForm({ ...form, icon: ic })} style={[s.icon, form.icon === ic && s.iconOn]}>
                    <Image source={badgeIcons[ic]} style={{ width: 26, height: 26 }} resizeMode="contain" />
                  </Pressable>
                ))}
              </View>
            </Field>
            <Field label="Unlocks when the player reaches">
              <Chips value={form.criteria_type} onChange={(v) => setForm({ ...form, criteria_type: v })} options={[...CRITERIA]} />
            </Field>
            <Field label="Target"><Input value={form.value} onChangeText={(v) => setForm({ ...form, value: v })} keyboardType="number-pad" /></Field>
            {!!formMsg && <Text style={{ color: admin.red, fontSize: 13 }}>{formMsg}</Text>}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <Btn kind="ghost" label="Cancel" onPress={() => setForm(null)} />
              <Btn label="Save" onPress={save} />
            </View>
          </>
        )}
      </AdminModal>
    </Page>
  );
}

const s = StyleSheet.create({
  icon: { width: 44, height: 44, borderRadius: 10, backgroundColor: admin.tan, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  iconOn: { borderColor: admin.primary },
});