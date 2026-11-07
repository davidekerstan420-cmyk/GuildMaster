import { Link, Redirect, Slot } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/templates', label: 'Task Templates' },
  { href: '/admin/economy', label: 'Economy & Shop' },
  { href: '/admin/ai-monitor', label: 'AI Monitoring' },
] as const;

export default function AdminLayout() {
  const { role, signOut } = useAuth();
  if (role !== 'admin') return <Redirect href="/" />;

  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 18, textAlign: 'center' }}>
          The admin panel is only available on the web.
        </Text>
        <Pressable onPress={signOut}>
          <Text style={{ textAlign: 'center', marginTop: 16 }}>Log out</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ width: 240, padding: 16, backgroundColor: '#3b2a24' }}>
        <Text style={{ color: '#fff', fontSize: 20, marginBottom: 24 }}>
          GuildMaster Admin
        </Text>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{ color: '#e8c96a', paddingVertical: 8 }}
          >
            {l.label}
          </Link>
        ))}
        <Pressable onPress={signOut}>
          <Text style={{ color: '#fff', marginTop: 24 }}>Log out</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1, padding: 24 }}>
        <Slot />
      </View>
    </View>
  );
}
