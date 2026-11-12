import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AuthBackground from '../../components/AuthBackground';
import BrandLogo from '../../components/BrandLogo';
import PixelButton from '../../components/PixelButton';
import PixelInput from '../../components/PixelInput';
import { auth, fonts } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    setError('');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) setError(error.message); // the guard redirects on success
  };

  return (
    <AuthBackground>
      <View style={styles.top}>
        <BrandLogo width={320} />
      </View>

      <View style={styles.form}>
        <PixelInput
          placeholder="Email address"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <PixelInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}

        <PixelButton
          label={busy ? '...' : 'Login'}
          onPress={onLogin}
          disabled={busy}
          width={130}
          style={styles.loginBtn}
        />

        <Link href="/auth/register" style={styles.link}>
          SIGN UP?
        </Link>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  top: { marginTop: 24 },
  form: { flex: 1, justifyContent: 'flex-end', gap: 16, paddingBottom: 24 },
  loginBtn: { alignSelf: 'flex-end', marginTop: 8 },
  link: { fontFamily: fonts.body, fontSize: 14, color: auth.linkYellow, marginTop: 24 },
  error: {
    backgroundColor: '#fff8',
    color: '#8a1c14',
    padding: 8,
    borderRadius: 8,
    fontFamily: fonts.body,
  },
});