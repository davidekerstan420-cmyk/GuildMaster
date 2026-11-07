import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function UserLayout() {
  const { role } = useAuth();
  if (role !== 'user') return <Redirect href="/" />;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Quests' }} />
      <Tabs.Screen name="habits" options={{ title: 'Habits' }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop' }} />
      <Tabs.Screen name="notices" options={{ title: 'Notices' }} />
      <Tabs.Screen name="character" options={{ title: 'Character' }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
