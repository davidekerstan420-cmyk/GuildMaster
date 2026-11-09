import { MedievalSharp_400Regular, useFonts } from '@expo-google-fonts/medievalsharp';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

function Guard() {
  const { session, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const area = segments[0]; // 'auth' | 'user' | 'admin' | undefined

    if (!session) {
      if (area !== 'auth') router.replace('/auth/login');
      return;
    }
    if (!role) return; // signed in, role still loading

    if (role === 'admin' && area !== 'admin') router.replace('/admin');
    if (role === 'user' && area !== 'user') router.replace('/user');
  }, [session, role, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <Slot />;
}

export default function RootLayout() {
  const [loaded] = useFonts({ MedievalSharp_400Regular });
  if (!loaded) return null;

  return (
    <AuthProvider>
      <Guard />
    </AuthProvider>
  );
}
