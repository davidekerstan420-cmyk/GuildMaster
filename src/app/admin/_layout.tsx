import { Feather } from '@expo/vector-icons';
import { Href, Redirect, Slot, usePathname, useRouter } from 'expo-router';
import { ComponentProps, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { admin } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const NAV: { href: string; label: string; icon: ComponentProps<typeof Feather>['name'] }[] = [
  { href: '/admin', label: 'Overview', icon: 'grid' },
  { href: '/admin/accounts', label: 'Accounts', icon: 'user-plus' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'trending-up' },
  { href: '/admin/shop', label: 'Shop', icon: 'shopping-bag' },
  { href: '/admin/achievements', label: 'Achievements', icon: 'award' },
];

export default function AdminLayout() {
  const { role, session, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const router = useRouter();
  const userId = session?.user.id;

  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [adminName, setAdminName] = useState('Guild Keeper');

  useEffect(() => {
    if (role !== 'admin' || !userId) return;
    supabase.from('game_config').select('id').eq('id', 1).single().then(({ error }) => setHealthy(!error));
    supabase.from('profiles').select('name').eq('id', userId).single()
      .then(({ data }) => setAdminName(data?.name || 'Guild Keeper'));
  }, [role, userId]);

  if (role !== 'admin') return <Redirect href="/" />;

  if (Platform.OS !== 'web' || width < 900) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          {Platform.OS !== 'web'
            ? 'The admin console is only available on the web.'
            : 'Please use a desktop-sized screen for the admin console.'}
        </Text>
        <Pressable onPress={signOut}><Text style={styles.link}>Log out</Text></Pressable>
      </View>
    );
  }

  const current = NAV.find((n) => n.href === pathname) ?? NAV[0];
  const initials = adminName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={styles.root}>
      <View style={styles.sidebar}>
        <View style={styles.brand}>
          <View style={styles.logo}><Text style={styles.logoText}>G</Text></View>
          <View>
            <Text style={styles.brandName}>GuildMaster</Text>
            <Text style={styles.brandSub}>ADMIN CONSOLE</Text>
          </View>
        </View>

        <Text style={styles.section}>REALM</Text>
        {NAV.map((n) => {
          const active = n.href === current.href;
          return (
            <Pressable key={n.href} onPress={() => router.push(n.href as Href)} style={[styles.navItem, active && styles.navActive]}>
              <Feather name={n.icon} size={18} color={active ? '#fff' : admin.sidebarText} />
              <Text style={[styles.navText, active && { color: '#fff' }]}>{n.label}</Text>
            </Pressable>
          );
        })}

        <View style={{ flex: 1 }} />

        <View style={styles.health}>
          <View style={[styles.dot, { backgroundColor: healthy === false ? admin.red : admin.green }]} />
          <View>
            <Text style={styles.healthTitle}>{healthy === false ? 'Realm unreachable' : 'Realm healthy'}</Text>
            <Text style={styles.healthSub}>{healthy === false ? 'Database check failed' : 'All systems operational'}</Text>
          </View>
        </View>

        <View style={styles.me}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials || 'GK'}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.meName} numberOfLines={1}>{adminName}</Text>
            <Text style={styles.meRole}>Administrator</Text>
          </View>
          <Pressable onPress={signOut} hitSlop={8}><Feather name="log-out" size={16} color={admin.sidebarText} /></Pressable>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.topbar}>
          <Text style={styles.crumb}>Realm  ›  </Text>
          <Text style={styles.crumbCurrent}>{current.label}</Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          <Slot />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: admin.bg },
  blocked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  blockedText: { fontSize: 18, textAlign: 'center', color: admin.text },
  link: { color: admin.primary, fontSize: 15 },

  sidebar: { width: admin.sidebarWidth, backgroundColor: admin.sidebar, padding: 16, gap: 4 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, marginBottom: 20 },
  logo: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#b07a4f', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  brandName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  brandSub: { color: '#9d8f83', fontSize: 10, letterSpacing: 1 },
  section: { color: '#8d7f73', fontSize: 11, letterSpacing: 1, marginBottom: 8, marginLeft: 8 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 8 },
  navActive: { backgroundColor: admin.sidebarActive },
  navText: { color: admin.sidebarText, fontSize: 14 },

  health: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: admin.sidebarActive, borderRadius: 10, padding: 12, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  healthTitle: { color: '#fff', fontSize: 12, fontWeight: '600' },
  healthSub: { color: '#9d8f83', fontSize: 11 },
  me: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#3a2a20' },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#6c55c8', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  meName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  meRole: { color: '#9d8f83', fontSize: 11 },

  main: { flex: 1 },
  topbar: { flexDirection: 'row', alignItems: 'center', height: 60, paddingHorizontal: 32, backgroundColor: admin.surface, borderBottomWidth: 1, borderBottomColor: admin.border },
  crumb: { color: admin.muted, fontSize: 13 },
  crumbCurrent: { color: admin.text, fontSize: 13, fontWeight: '600' },
});