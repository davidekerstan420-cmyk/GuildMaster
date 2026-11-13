import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../components/Avatar';
import PixelButton from '../../components/PixelButton';
import PixelInput from '../../components/PixelInput';
import ScreenHeader from '../../components/ScreenHeader';
import { cardIcons } from '../../components/icons';
import { fonts, ui } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { itemImage } from '../../lib/itemImage';
import { supabase } from '../../lib/supabase';

type OwnedAvatar = { id: string; imageKey: string | null; imageUrl: string | null };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export default function GuildCardScreen() {
  const { session } = useAuth();
  const { profile, refresh: refreshGame } = useGame();
  const userId = session?.user.id;
  const email = session?.user.email ?? '';

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [myAvatars, setMyAvatars] = useState<OwnedAvatar[]>([]);

  // Used by the Cancel button to put the saved values back.
  const loadProfile = async () => {
    if (!userId) return;
    const { data } = await supabase.from('profiles').select('name, age').eq('id', userId).single();
    setName(data?.name ?? '');
    setAge(data?.age != null ? String(data.age) : '');
  };

  // Initial load. State is only set after the await, and ignored if the screen is gone.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('name, age')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (cancelled) return;
        setName(data?.name ?? '');
        setAge(data?.age != null ? String(data.age) : '');
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const openPicker = async () => {
    const { data } = await supabase
      .from('inventory_items')
      .select('item_id, cosmetic_items(id, kind, image_key, image_url)');
    setMyAvatars(
      (data ?? [])
        .map((r: any) => r.cosmetic_items)
        .filter((c: any) => c && c.kind === 'avatar')
        .map((c: any) => ({ id: c.id, imageKey: c.image_key, imageUrl: c.image_url }))
    );
    setPickerOpen(true);
  };

  const pick = async (id: string | null) => {
    await supabase.rpc('equip_avatar', { p_item: id });
    await refreshGame();
    setPickerOpen(false);
  };

  const onSave = async () => {
    setMessage('');
    const ageNum = parseInt(age, 10);
    if (!name.trim()) return setMessage('Name cannot be empty.');
    if (!ageNum || ageNum < 1 || ageNum > 120) return setMessage('Please enter a valid age.');
    if (password && password.length < 6) return setMessage('Watchword must be at least 6 characters.');

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), age: ageNum })
      .eq('id', userId!);

    let pwError = '';
    if (!error && password) {
      const res = await supabase.auth.updateUser({ password });
      if (res.error) pwError = res.error.message;
    }
    setSaving(false);

    if (error || pwError) return setMessage(error?.message ?? pwError);
    setPassword('');
    setEditing(false);
    setMessage('Guild card updated.');
  };

  const onCancel = () => {
    setEditing(false);
    setPassword('');
    setMessage('');
    loadProfile();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="MY GUILD CARD" />

        {/* Stats panel */}
        <View style={styles.statsPanel}>
          <View style={styles.avatarWrap}>
            <Avatar size={125} />
            <Pressable style={styles.avatarEdit} hitSlop={8} onPress={openPicker}>
              <Image source={cardIcons.edit} style={styles.editIcon} resizeMode="contain" />
            </Pressable>
          </View>

          <View style={styles.stats}>
            <View style={styles.statRow}>
              <Image source={cardIcons.swords} style={styles.statIcon} resizeMode="contain" />
              <Text style={styles.statText}>LEVEL {profile?.level ?? 1}</Text>
            </View>
            <View style={styles.statRow}>
              <Image source={cardIcons.coins} style={styles.statIcon} resizeMode="contain" />
              <Text style={styles.statText}>{profile?.pointBalance ?? 0}</Text>
            </View>
          </View>
        </View>

        {/* Form panel */}
        <View style={styles.formPanel}>
          <Pressable
            style={styles.formEdit}
            hitSlop={8}
            onPress={() => (editing ? onCancel() : setEditing(true))}
          >
            <Image source={cardIcons.edit} style={styles.editIcon} resizeMode="contain" />
          </Pressable>

          <Field label="Name">
            <PixelInput value={name} onChangeText={setName} editable={editing} autoCapitalize="words" />
          </Field>
          <Field label="Age">
            <PixelInput value={age} onChangeText={setAge} editable={editing} keyboardType="number-pad" maxLength={3} />
          </Field>
          <Field label="Email">
            <PixelInput value={email} editable={false} />
          </Field>
          <Field label="Watchword">
            <PixelInput
              value={editing ? password : '••••••••'}
              onChangeText={setPassword}
              editable={editing}
              secureTextEntry={editing}
              placeholder="New watchword (blank = keep)"
            />
          </Field>

          {!!message && <Text style={styles.message}>{message}</Text>}

          {editing && (
            <View style={styles.actions}>
              <PixelButton label={saving ? '...' : 'Save'} onPress={onSave} disabled={saving} width={110} />
              <PixelButton label="Cancel" onPress={onCancel} width={110} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Avatar picker */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.pickerBackdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.pickerCard} onPress={() => {}}>
            <Text style={styles.pickerTitle}>CHOOSE AVATAR</Text>
            {myAvatars.length === 0 ? (
              <Text style={styles.pickerEmpty}>You do not own any avatars yet. Visit the Bazaar!</Text>
            ) : (
              <View style={styles.pickerGrid}>
                {myAvatars.map((a) => (
                  <Pressable key={a.id} onPress={() => pick(a.id)}>
                    <Image
                      source={itemImage(a.imageKey, a.imageUrl)}
                      style={styles.pickerImg}
                      resizeMode="contain"
                    />
                  </Pressable>
                ))}
              </View>
            )}
            <PixelButton label="No avatar" width={140} onPress={() => pick(null)} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.background },
  content: { padding: 16, paddingBottom: 32, gap: 16 },

  statsPanel: {
    backgroundColor: ui.homePanel,
    flexDirection: 'row',
    gap: 20,
    padding: 8,
  },
  avatarWrap: { width: 125, height: 125 },
  avatarEdit: { position: 'absolute', right: -2, bottom: -2 },
  editIcon: { width: 22, height: 22 },

  stats: { flex: 1, justifyContent: 'center', gap: 18 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statIcon: { width: 24, height: 24 },
  statText: { fontFamily: fonts.body, fontSize: 16, color: ui.panelText },

  formPanel: { backgroundColor: ui.card, padding: 12, paddingTop: 10, gap: 6 },
  formEdit: { alignSelf: 'flex-end' },

  field: { gap: 2 },
  label: { fontFamily: fonts.body, fontSize: 16, color: ui.text, marginLeft: 4 },

  message: { fontFamily: fonts.body, fontSize: 14, color: ui.text, marginTop: 6 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 10 },

  pickerBackdrop: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', padding: 24 },
  pickerCard: { backgroundColor: ui.background, borderRadius: 14, padding: 16, gap: 12, alignItems: 'center' },
  pickerTitle: { fontFamily: fonts.heading, fontSize: 22, color: ui.text },
  pickerEmpty: { fontFamily: fonts.body, fontSize: 15, color: ui.text, textAlign: 'center' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  pickerImg: { width: 64, height: 64 },
});