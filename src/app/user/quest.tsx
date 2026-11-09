import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { fonts, ui } from '../../constants/theme';

type Quest = {
  id: string;
  title: string;
  category: string;
  xp: number;
  done: boolean;
  createdAt: number; // timestamp in ms
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function todayLabel() {
  const d = new Date();
  return `${ordinal(d.getDate())} of ${MONTHS[d.getMonth()]}`;
}

const WEEK_STARTS_ON = 1; // 0 = Sunday, 1 = Monday
function startOfWeek(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = (d.getDay() - WEEK_STARTS_ON + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d.getTime();
}

// Sample data only. We'll replace this with Supabase later.
const initial: Quest[] = [
  { id: '1', title: 'Finish SD3 docs', category: 'School', xp: 10, done: false, createdAt: Date.now() },
  { id: '2', title: 'Make exam reviewer', category: 'School', xp: 10, done: false, createdAt: Date.now() },
  { id: '3', title: 'Achieve 100% in game', category: 'Hobby', xp: 5, done: false, createdAt: Date.now() },
];

export default function QuestScreen() {
  const [quests, setQuests] = useState<Quest[]>(initial);
  const [tab, setTab] = useState<'today' | 'completed'>('today');
  const [draft, setDraft] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);

  const weekStart = startOfWeek();
  const thisWeek = quests.filter((q) => q.createdAt >= weekStart);
  const doneCount = thisWeek.filter((q) => q.done).length;
  const visible = quests.filter((q) => (tab === 'today' ? !q.done : q.done));

  const addQuest = () => {
    const title = draft.trim();
    if (!title) return;
    setQuests((prev) => [
     { id: String(Date.now()), title, category: 'General', xp: 5, done: false, createdAt: Date.now() },
      ...prev,
    ]);
    setDraft('');
  };

  const toggle = (id: string) =>
    setQuests((prev) => prev.map((q) => (q.id === id ? { ...q, done: !q.done } : q)));

  const remove = (id: string) => setQuests((prev) => prev.filter((q) => q.id !== id));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={visible}
        keyExtractor={(q) => q.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <ScreenHeader title="QUEST ARCHIVE" />

            <View style={styles.banner}>
              <Text style={styles.bannerText}>
                {doneCount}/{thisWeek.length}
              </Text>
            </View>

            <View style={styles.addRow}>
              <View style={styles.addPill}>
                <TextInput
                  style={styles.addInput}
                  placeholder="Add new quest..."
                  placeholderTextColor={ui.buttonText}
                  value={draft}
                  onChangeText={setDraft}
                  onSubmitEditing={addQuest}
                  returnKeyType="done"
                />
              </View>
              <Pressable
                onPress={() => setDeleteMode((v) => !v)}
                style={[styles.trash, deleteMode && styles.trashActive]}
              >
                <Text style={styles.trashText}>🗑</Text>
              </Pressable>
            </View>

            <View style={styles.segment}>
              {(['today', 'completed'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={[styles.segmentItem, tab === t && styles.segmentItemActive]}
                >
                  <Text style={styles.segmentText}>{t === 'today' ? 'Today' : 'Completed'}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.date}>{todayLabel()}</Text>
            {deleteMode && <Text style={styles.hint}>Tap a quest to delete it</Text>}
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No quests here yet.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => deleteMode && remove(item.id)}
            style={[styles.card, deleteMode && styles.cardDelete]}
          >
            <Pressable onPress={() => toggle(item.id)} hitSlop={8} style={styles.checkbox}>
              {item.done && <Text style={styles.check}>✓</Text>}
            </Pressable>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{item.category}</Text>
              </View>
            </View>

            <Text style={styles.xp}>+{item.xp} XP</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.background },
  content: { padding: 16, paddingBottom: 24, gap: 10 },
  headerBlock: { gap: 14, marginBottom: 4 },

  banner: {
    backgroundColor: ui.banner,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bannerText: { fontFamily: fonts.body, fontSize: 18, color: ui.text },

  addRow: { flexDirection: 'row', gap: 12 },
  addPill: {
    flex: 1,
    backgroundColor: ui.button,
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addInput: { fontFamily: fonts.body, fontSize: 18, color: ui.buttonText, paddingVertical: 14 },
  trash: {
    width: 56,
    backgroundColor: ui.button,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashActive: { backgroundColor: ui.danger },
  trashText: { fontSize: 24 },

  segment: { flexDirection: 'row', backgroundColor: ui.banner, borderRadius: 10, padding: 4 },
  segmentItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentItemActive: { backgroundColor: ui.segmentActive },
  segmentText: { fontFamily: fonts.body, fontSize: 18, color: ui.text },

  date: { fontFamily: fonts.body, fontSize: 18, color: ui.text },
  hint: { fontFamily: fonts.body, fontSize: 14, color: ui.danger },
  empty: { fontFamily: fonts.body, fontSize: 16, color: ui.text, textAlign: 'center', marginTop: 24 },

  card: {
    backgroundColor: ui.card,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardDelete: { borderColor: ui.danger },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: ui.text,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 16, color: ui.text, lineHeight: 18 },
  cardBody: { flex: 1, gap: 6 },
  cardTitle: { fontFamily: fonts.body, fontSize: 20, color: ui.text },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: ui.chip,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  chipText: { fontFamily: fonts.body, fontSize: 12, color: ui.text },
  xp: { fontFamily: fonts.body, fontSize: 13, color: ui.text },
});