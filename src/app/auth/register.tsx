import { Link } from 'expo-router';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const onRegister = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(
      error
        ? error.message
        : 'Account created. Check your email if confirmation is enabled.'
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {!!message && <Text>{message}</Text>}
      <Button title="Sign up" onPress={onRegister} />
      <Link href="/auth/login">Back to login</Link>
    </View>
  );
}
