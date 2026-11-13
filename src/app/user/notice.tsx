import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { homeIcons, noticeArt } from '../../components/icons';
import { fonts, ui } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { supabase } from '../../lib/supabase';

type Notice = { id: string; title: string; lines: string[]; read: boolean };

const PAD = 16;
const FRAME_RATIO = 390 / 584; // width / height of noticeboard_bg.png

export default function NoticeScreen() {
  const { width } = useWindowDimensions();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { refresh: refreshGame } = useGame();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [areaH, setAreaH] = useState(0);

  const maxW = width - PAD * 2;
  const maxH = areaH ? areaH - 32 : Infinity;
  const frameW = Math.min(maxW, maxH * FRAME_RATIO);
  const frameH = frameW / FRAME_RATIO;
  const unread = notices.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    const [n, r] = await Promise.all([
      supabase.from('notices').select('id, title, body').order('created_at', { ascending: false }),
      supabase.from('notice_reads').select('notice_id, dismissed'),
    ]);
    if (n.error) return;
    const reads = new Map((r.data ?? []).map((x: any) => [x.notice_id, x.dismissed]));
    setNotices(
      (n.data ?? [])
        .filter((x: any) => reads.get(x.id) !== true) // hide dismissed notices
        .map((x: any) => ({
          id: x.id,
          title: x.title,
          lines: String(x.body ?? '').split('\n').filter(Boolean),
          read: reads.has(x.id),
        }))
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const save = async (rows: object[]) => {
    if (!rows.length) return;
    await supabase.from('notice_reads').upsert(rows, { onConflict: 'user_id,notice_id' });
    refreshGame();
  };

  const markRead = async (id: string) => {
    const n = notices.find((x) => x.id === id);
    if (!n || n.read || !userId) return;
    setNotices((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)));
    await save([{ user_id: userId, notice_id: id }]);
  };

  const markAllRead = async () => {
    if (!userId) return;
    const rows = notices.filter((n) => !n.read).map((n) => ({ user_id: userId, notice_id: n.id }));
    setNotices((prev) => prev.map((n) => ({ ...n, read: true })));
    await save(rows);
  };

  // The trash button hides notices you have already read.
  const clearRead = async () => {
    if (!userId) return;
    const rows = notices
      .filter((n) => n.read)
      .map((n) => ({ user_id: userId, notice_id: n.id, dismissed: true }));
    setNotices((prev) => prev.filter((n) => !n.read));
    await save(rows);
  };

  // ...keep `return (` and everything below unchanged

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <ScreenHeader title="NOTICE BOARD" />
      </View>

      <ImageBackground
        source={noticeArt.frame}
        style={{ width: frameW, height: frameH, alignSelf: 'center', marginTop: 16 }}
        resizeMode="stretch"
      >
        <View
          style={[
            styles.inner,
            {
              left: frameW * 0.095,
              right: frameW * 0.095,
              top: frameH * 0.05,
              bottom: frameH * 0.045,
            },
          ]}
        >
          <View style={styles.titleRow}>
            <Text style={styles.title}>UNREAD NOTICES</Text>
            <View style={styles.counter}>
              <Image source={homeIcons.notice} style={styles.counterIcon} resizeMode="contain" />
              <Text style={styles.count}>{unread}</Text>
            </View>
          </View>

          <FlatList
            data={notices}
            keyExtractor={(n) => n.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            ListEmptyComponent={<Text style={styles.empty}>No notices right now.</Text>}
            renderItem={({ item }) => (
              <Pressable onPress={() => markRead(item.id)}>
                <ImageBackground source={noticeArt.paper} style={styles.paper} resizeMode="stretch">
                  <View style={[styles.dot, { backgroundColor: item.read ? ui.readDot : ui.unreadDot }]} />
                  <Text style={styles.noticeTitle}>{item.title}</Text>
                  {item.lines.map((line, i) => (
                    <Text key={i} style={styles.noticeLine}>
                      {'\u2022'}  {line}
                    </Text>
                  ))}
                </ImageBackground>
              </Pressable>
            )}
          />

          <View style={styles.footer}>
            <Pressable onPress={markAllRead} style={styles.markAll} hitSlop={8}>
             <Image source={noticeArt.check} style={styles.markIcon} resizeMode="contain" />
             <Text style={styles.footerText}>mark all as read</Text>
            </Pressable>
            <Pressable onPress={clearRead} hitSlop={8}>
              <Image source={noticeArt.delete} style={styles.trash} resizeMode="contain" />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.background },
  header: { paddingHorizontal: PAD, paddingTop: 8 },

  inner: { position: 'absolute' },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: ui.noticeTitle,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  counterIcon: { width: 28, height: 28 },
  count: { fontFamily: fonts.heading, fontSize: 16, color: ui.unreadDot },

  list: { flex: 1 },
  listContent: { gap: 8, paddingBottom: 8 },
  empty: { fontFamily: fonts.body, fontSize: 15, color: ui.text, textAlign: 'center', marginTop: 24 },

  paper: { paddingVertical: 12, paddingHorizontal: 14, minHeight: 76 },
  dot: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 14,
    height: 8,
    borderRadius: 4,
  },
  noticeTitle: { fontFamily: fonts.body, fontSize: 15, color: ui.text, marginBottom: 6 },
  noticeLine: { fontFamily: fonts.body, fontSize: 14, color: ui.text, marginLeft: 10, paddingRight: 8 },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  markAll: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  markIcon: { width: 22, height: 22 },
  footerText: { fontFamily: fonts.body, fontSize: 14, color: ui.text },
  trash: { width: 22, height: 22 },
});