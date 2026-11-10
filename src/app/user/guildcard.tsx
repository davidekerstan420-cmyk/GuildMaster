import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { cardIcons } from '../../components/icons';
import { fonts, ui } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Placeholders. These come from CharacterProfile (level, point_balance) later.
const LEVEL = 1;
const POINTS = 123;

type FieldProps = {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  editable?: boolean;
  secure?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'email-address';
};

function Field({ label, value, onChange, editable, secure, placeholder, keyboardType }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.pill, editable && styles.pillEditing]}
        value={value}
        onChangeText={onChange}
        editable={editable}
        secureTextEntry={secure}
        placeholder={placeholder}
        placeholderTextColor="#2b1d1788"
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

export default function GuildCardScreen() {
  const { session, signOut } = useAuth();
  const userId = session?.user.id;
  const email = session?.user.email ?? '';

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadProfile = async () => {
    if (!userId) return;
    const { data } = await supabase.from('profiles').select('name, age').eq('id', userId).single();
    setName(data?.name ?? '');
    setAge(data?.age != null ? String(data.age) : '');
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

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

        <View style={styles.topRow}>
          <View style={styles.avatar}>
            {/* TODO: render the equipped character here */}
            <Pressable style={styles.avatarEdit} hitSlop={8} onPress={() => setMessage('Character customization coming soon.')}>
              <Image source={cardIcons.edit} style={styles.editIcon} resizeMode="contain" />
            </Pressable>
          </View>

          <View style={styles.stats}>
            <View style={styles.statRow}>
              <Image source={cardIcons.swords} style={styles.statIcon} resizeMode="contain" />
              <Text style={styles.statText}>LEVEL {LEVEL}</Text>
            </View>
            <View style={styles.statRow}>
              <Image source={cardIcons.coins} style={styles.statIcon} resizeMode="contain" />
              <Text style={styles.statText}>{POINTS}</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.formEdit} hitSlop={8} onPress={() => (editing ? onCancel() : setEditing(true))}>
          <Image source={cardIcons.edit} style={styles.editIcon} resizeMode="contain" />
        </Pressable>

        <Field label="Name" value={name} onChange={setName} editable={editing} />
        <Field label="Age" value={age} onChange={setAge} editable={editing} keyboardType="number-pad" />
        <Field label="Email" value={email} editable={false} />
        <Field
          label="Watchword"
          value={editing ? password : '••••••••'}
          onChange={setPassword}
          editable={editing}
          secure={editing}
          placeholder="New watchword (blank = keep)"
        />

        {!!message && <Text style={styles.message}>{message}</Text>}

        {editing && (
          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.btnSave]} onPress={onSave} disabled={saving}>
              <Text style={styles.btnText}>{saving ? '...' : 'Save'}</Text>
            </Pressable>
            <Pressable style={styles.btn} onPress={onCancel}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.logout} onPress={signOut}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.background },
  content: { padding: 16, paddingBottom: 32, gap: 8 },

  topRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  avatar: { width: 140, height: 125, backgroundColor: '#d9d9d9' },
  avatarEdit: { position: 'absolute', right: -4, bottom: -4 },
  editIcon: { width: 22, height: 22 },

  stats: { flex: 1, justifyContent: 'center', gap: 18 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIcon: { width: 24, height: 24 },
  statText: { fontFamily: fonts.body, fontSize: 16, color: ui.text },

  formEdit: { alignSelf: 'flex-end', marginTop: 16 },

  field: { gap: 2, marginTop: 4 },
  label: { fontFamily: fonts.body, fontSize: 16, color: ui.text, marginLeft: 6 },
  pill: {
    backgroundColor: ui.banner,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
    fontFamily: fonts.body,
    fontSize: 16,
    color: ui.text,
  },
  pillEditing: { borderWidth: 2, borderColor: ui.button },

  message: { fontFamily: fonts.body, fontSize: 14, color: ui.text, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 12 },
  btn: { backgroundColor: ui.banner, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  btnSave: { backgroundColor: ui.tabActive },
  btnText: { fontFamily: fonts.body, fontSize: 16, color: ui.text },

  logout: { alignSelf: 'center', marginTop: 28, padding: 8 },
  logoutText: { fontFamily: fonts.body, fontSize: 15, color: ui.danger },
});