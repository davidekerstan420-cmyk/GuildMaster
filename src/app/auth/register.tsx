import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import AuthBackground from '../../components/AuthBackground';
import BrandLogo from '../../components/BrandLogo';
import { socialIcons } from '../../components/icons';
import PixelButton from '../../components/PixelButton';
import PixelInput from '../../components/PixelInput';
import TitlePlate from '../../components/TitlePlate';
import { auth, fonts } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const onRegister = async () => {
    setMessage('');
    if (!name.trim() || !email.trim()) return setMessage('Please fill in your name and email.');
    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 1 || ageNum > 120) return setMessage('Please enter a valid age.');
    if (password.length < 6) return setMessage('Watchword must be at least 6 characters.');

    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim(), age: ageNum } },
    });
    setBusy(false);

    setMessage(
      error ? error.message : 'Account created! Check your email if confirmation is enabled.'
    );
  };

  return (
    <AuthBackground>
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10}>
        <Ionicons name="arrow-back" size={22} color={auth.plateText} />
      </Pressable>

      <TitlePlate title={'WELCOME TO\nGUILDMASTER!'} />
      <BrandLogo width={260} />

      <View style={styles.panel}>
        <Text style={styles.label}>Adventurer's name</Text>
        <PixelInput value={name} onChangeText={setName} />

        <Text style={styles.label}>Age</Text>
        <PixelInput value={age} onChangeText={setAge} keyboardType="number-pad" maxLength={3} />

        <Text style={styles.label}>Email</Text>
        <PixelInput value={email} onChangeText={setEmail} keyboardType="email-address" />

        <Text style={styles.label}>Your watchword</Text>
        <PixelInput value={password} onChangeText={setPassword} secureTextEntry />

        {!!message && <Text style={styles.message}>{message}</Text>}

        <PixelButton
          label={busy ? '...' : 'REGISTER'}
          onPress={onRegister}
          disabled={busy}
          style={{ marginTop: 12 }}
        />
      </View>

      <View style={styles.social}>
        <Text style={styles.or}>or register with</Text>
        <View style={styles.socialRow}>
        <Pressable onPress={() => setMessage('Facebook sign-in coming soon.')}>
          {({ pressed }) => (
            <Image
              source={pressed ? socialIcons.facebook.pressed : socialIcons.facebook.idle}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          )}
        </Pressable>
        <Pressable onPress={() => setMessage('Google sign-in coming soon.')}>
          {({ pressed }) => (
            <Image
              source={pressed ? socialIcons.google.pressed : socialIcons.google.idle}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </View>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4a2a1e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  panel: {
    backgroundColor: auth.panel,
    padding: 14,
    marginTop: 20,
  },
  label: { fontFamily: fonts.body, fontSize: 16, color: auth.text, marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: auth.inputOnPanel,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    color: auth.text,
  },
  message: { fontFamily: fonts.body, color: '#8a1c14', marginTop: 10 },
  social: { alignItems: 'center', marginTop: 28, gap: 14 },
  or: { fontFamily: fonts.body, fontSize: 15, color: auth.text },
  socialRow: { flexDirection: 'row', gap: 36 },
  socialIcon: { width: 80, height: 80 },
  icon: { width: 44, height: 44, resizeMode: 'contain' },
});