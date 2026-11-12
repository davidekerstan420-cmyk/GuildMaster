import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { fonts, ui } from '../../constants/theme';
import {
  GlobalNotification,
  listGlobalNotifications,
} from '../../lib/notifications';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    const { data, error: requestError } = await listGlobalNotifications();
    if (requestError)
      setError(`Could not load notifications: ${requestError.message}`);
    else setNotifications(data ?? []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void loadNotifications(), 0);
    return () => clearTimeout(timer);
  }, [loadNotifications]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadNotifications(true)}
            tintColor={ui.button}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title="NOTIFICATIONS" />
            <Text style={styles.subtitle}>
              Important announcements from the GuildMaster realm.
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={ui.button} style={styles.state} />
          ) : (
            <Text style={styles.state}>
              {error || 'No system announcements yet.'}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeading}>
              <Text style={styles.cardLabel}>SYSTEM ANNOUNCEMENT</Text>
              <Text style={styles.date}>
                {new Date(item.sent_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.background },
  content: { padding: 16, paddingBottom: 24, gap: 12 },
  header: { gap: 10, marginBottom: 4 },
  subtitle: { color: ui.text, fontFamily: fonts.body, fontSize: 16 },
  card: {
    backgroundColor: ui.card,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  cardHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardLabel: { color: ui.text, fontFamily: fonts.body, fontSize: 13 },
  date: { color: ui.text, fontFamily: fonts.body, fontSize: 13 },
  message: {
    color: ui.text,
    fontFamily: fonts.body,
    fontSize: 19,
    lineHeight: 26,
  },
  state: {
    color: ui.text,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingVertical: 28,
    textAlign: 'center',
  },
});
