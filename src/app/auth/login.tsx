import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import AuthBackground from '../../components/AuthBackground';
import GameButton from '../../components/GameButton';
import TitlePlate from '../../components/TitlePlate';
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
        <TitlePlate title="GUILDMASTER" />
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={auth.inputGoldText}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={auth.inputGoldText}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.row}>
          <Link href="/auth/register" style={styles.link}>
            SIGN UP?
          </Link>
          <GameButton
            label={busy ? '...' : 'Login'}
            onPress={onLogin}
            color={auth.buttonLime}
            disabled={busy}
          />
        </View>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  top: { marginTop: 40 },
  form: { flex: 1, justifyContent: 'flex-end', gap: 16, paddingBottom: 24 },
  input: {
    backgroundColor: auth.inputGold,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: fonts.body,
    fontSize: 16,
    color: auth.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  link: { fontFamily: fonts.body, color: auth.link, fontSize: 14 },
  error: {
    backgroundColor: '#fff3',
    color: '#8a1c14',
    padding: 8,
    borderRadius: 8,
    fontFamily: fonts.body,
  },
});