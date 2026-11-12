import { Redirect, Tabs } from 'expo-router';
import UserTabBar from '../../components/UserTabBar';
import { useAuth } from '../../context/AuthContext';

export default function UserLayout() {
  const { role } = useAuth();
  if (role !== 'user') return <Redirect href="/" />;

  return (
    <Tabs tabBar={(props) => <UserTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="quest" />
      <Tabs.Screen name="habit" />
      <Tabs.Screen name="bazaar" />
      <Tabs.Screen name="guildcard" />
    </Tabs>
  );
}
