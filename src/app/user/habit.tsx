import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { fonts, ui } from '../../constants/theme';

type Habit = { id: string; title: string; icon: string; done: boolean };

// Placeholder glyphs. Swap for your Figma SVG icons later (see notes).
const ICONS = ['☀', '🛡', '📖'];

// Sample data only. We'll replace this with Supabase later.
const initial: Habit[] = [
  { id: '1', title: '20 minute exercise', icon: '☀', done: false },
  { id: '2', title: 'Morning prayer', icon: '☀', done: false },
  { id: '3', title: 'Drink 8 cups of water minimum', icon: '🛡', done: false },
  { id: '4', title: 'Study lessons', icon: '📖', done: false },
];

// Streak as of yesterday. Later this comes from Habit.current_streak / longest_streak.
const BASE_STREAK = 2;
const BASE_BEST = 5;

export default function HabitScreen() {
  const [habits, setHabits] = useState<Habit[]>(initial);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);

  // The streak grows by 1 for today only while every habit is done.
  const allDone = habits.length > 0 && habits.every((h) => h.done);
  const streak = BASE_STREAK + (allDone ? 1 : 0);
  const best = Math.max(BASE_BEST, streak);

  const toggle = (id: string) =>
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h)));

  const remove = (id: string) => setHabits((prev) => prev.filter((h) => h.id !== id));

  const addHabit = () => {
    const title = draft.trim();
    if (!title) return;
    setHabits((prev) => [
      ...prev,
      { id: String(Date.now()), title, icon: ICONS[prev.length % ICONS.length], done: false },
    ]);
    setDraft('');
    setAdding(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={habits}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <ScreenHeader title="HABIT LOG" />

            <View style={styles.streak}>
              <Text style={styles.streakIcon}>🔥</Text>
              <View>
                <Text style={styles.streakTitle}>{streak} DAY HOT STREAK</Text>
                <Text style={styles.streakBest}>best streak {best}</Text>
              </View>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Daily Habits</Text>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => setAdding((v) => !v)}
                  style={[styles.actionBtn, adding && styles.actionActive]}
                >
                  <Text style={styles.actionText}>＋</Text>
                </Pressable>
                <Pressable
                  onPress={() => setDeleteMode((v) => !v)}
                  style={[styles.actionBtn, deleteMode && styles.actionDanger]}
                >
                  <Text style={styles.actionText}>🗑</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.divider} />

            {adding && (
              <View style={styles.addRow}>
                <TextInput
                  style={styles.addInput}
                  placeholder="New habit..."
                  placeholderTextColor={ui.buttonText}
                  value={draft}
                  onChangeText={setDraft}
                  onSubmitEditing={addHabit}
                  returnKeyType="done"
                  autoFocus
                />
              </View>
            )}
            {deleteMode && <Text style={styles.hint}>Tap a habit to delete it</Text>}
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No habits yet. Tap ＋ to add one.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => deleteMode && remove(item.id)}
            style={[styles.card, deleteMode && styles.cardDelete]}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Pressable onPress={() => toggle(item.id)} hitSlop={10}>
              <View style={styles.ring}>
                <View style={[styles.dot, item.done && styles.dotDone]} />
              </View>
            </Pressable>
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

  streak: {
    backgroundColor: ui.banner,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakIcon: { fontSize: 24 },
  streakTitle: { fontFamily: fonts.heading, fontSize: 20, color: ui.text },
  streakBest: { fontFamily: fonts.body, fontSize: 11, color: ui.text, opacity: 0.6 },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: { fontFamily: fonts.body, fontSize: 20, color: ui.text },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 40,
    height: 28,
    borderRadius: 14,
    backgroundColor: ui.banner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionActive: { backgroundColor: ui.toggleOn },
  actionDanger: { backgroundColor: ui.danger },
  actionText: { fontSize: 16, color: ui.text },
  divider: { height: 1, backgroundColor: ui.divider },

  addRow: { backgroundColor: ui.button, borderRadius: 14, paddingHorizontal: 16 },
  addInput: { fontFamily: fonts.body, fontSize: 18, color: ui.buttonText, paddingVertical: 12 },
  hint: { fontFamily: fonts.body, fontSize: 14, color: ui.danger },
  empty: { fontFamily: fonts.body, fontSize: 16, color: ui.text, textAlign: 'center', marginTop: 24 },

  card: {
    backgroundColor: ui.habitCard,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardDelete: { borderColor: ui.danger },
  icon: { fontSize: 24, width: 32, textAlign: 'center', color: ui.text },
  cardTitle: { flex: 1, fontFamily: fonts.body, fontSize: 17, color: ui.text },

  ring: {
    width: 30,
    height: 24,
    borderRadius: 12,
    backgroundColor: ui.toggleRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 20, height: 14, borderRadius: 8, backgroundColor: ui.toggleOff },
  dotDone: { backgroundColor: ui.toggleOn },
});