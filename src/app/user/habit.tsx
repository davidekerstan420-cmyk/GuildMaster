import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddItemModal, { NewItem } from '../../components/AddItemModal';
import FilterModal, { CategoryFilter } from '../../components/FilterModal';
import { HabitIconKey, badgeIcons, habitIcons, noticeArt, questArt } from '../../components/icons';
import ScreenHeader from '../../components/ScreenHeader';
import { CATEGORY_ICON } from '../../constants/categories';
import { fonts, ui } from '../../constants/theme';
import { useGame } from '../../context/GameContext';
import { supabase } from '../../lib/supabase';

type Habit = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: HabitIconKey;
  done: boolean;
};

export default function HabitScreen() {
  const { profile, refresh: refreshGame } = useGame();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [error, setError] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [pendingFirst, setPendingFirst] = useState(false);

  const streak = profile?.currentStreak ?? 0;
  const best = profile?.bestStreak ?? 0;

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_habits_today');
    if (error) return setError(error.message);
    setError('');
    setHabits((data ?? []) as Habit[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = habits.filter((h) => categoryFilter === 'All' || h.category === categoryFilter);
  const visible = pendingFirst
    ? [...filtered].sort((a, b) => Number(a.done) - Number(b.done))
    : filtered;

  // One-way for today: the server awards XP once per habit per day.
  const complete = async (id: string) => {
    const h = habits.find((x) => x.id === id);
    if (!h || h.done) return;
    setHabits((prev) => prev.map((x) => (x.id === id ? { ...x, done: true } : x)));
    const { error } = await supabase.rpc('complete_habit', { p_id: id });
    if (error) setError(error.message);
    else setError('');
    await load();
    refreshGame();
  };

  const remove = async (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) setError(error.message);
    load();
  };

  const addHabit = async (item: NewItem) => {
    const { error } = await supabase.from('habits').insert({
      title: item.title,
      description: item.description,
      category: item.category,
      icon: CATEGORY_ICON[item.category],
    });
    if (error) setError(error.message);
    load();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={visible}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <ScreenHeader title="HABIT LOG" />

            <View style={styles.streak}>
              <Image source={badgeIcons.fire} style={styles.streakIcon} resizeMode="contain" />
              <View>
                <Text style={styles.streakTitle}>{streak} DAY HOT STREAK</Text>
                <Text style={styles.streakBest}>best streak {best}</Text>
              </View>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Daily Habits</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => setFilterOpen(true)} hitSlop={8}>
                  <Image source={questArt.filter} style={styles.filterIcon} resizeMode="contain" />
                </Pressable>
                <Pressable onPress={() => setAddOpen(true)} style={[styles.pill, styles.pillGold]}>
                  <Text style={styles.plus}>＋</Text>
                </Pressable>
                <Pressable
                  onPress={() => setDeleteMode((v) => !v)}
                  style={[styles.pill, deleteMode && styles.pillDanger]}
                >
                  <Image source={noticeArt.delete} style={styles.actionIcon} resizeMode="contain" />
                </Pressable>
              </View>
            </View>
            <View style={styles.divider} />

            {categoryFilter !== 'All' && <Text style={styles.hint}>Showing: {categoryFilter}</Text>}
            {!!error && <Text style={styles.hint}>{error}</Text>}
            {deleteMode && <Text style={styles.hint}>Tap a habit to delete it</Text>}
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No habits here yet. Tap ＋ to add one.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => deleteMode && remove(item.id)}
            style={[styles.card, deleteMode && styles.cardDelete]}
          >
            <Image source={habitIcons[item.icon]} style={styles.icon} resizeMode="contain" />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {!!item.description && (
                <Text style={styles.desc} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
            </View>
            <Pressable onPress={() => complete(item.id)} hitSlop={10}>
              <View style={styles.ring}>
                <View style={[styles.dot, item.done && styles.dotDone]} />
              </View>
            </Pressable>
          </Pressable>
        )}
      />

      <AddItemModal visible={addOpen} kind="habit" onClose={() => setAddOpen(false)} onSubmit={addHabit} />
      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={categoryFilter}
        onChange={setCategoryFilter}
        extraLabel="Pending first"
        extraValue={pendingFirst}
        onExtraChange={setPendingFirst}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.background },
  content: { padding: 16, paddingBottom: 24, gap: 12 },
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
  streakIcon: { width: 30, height: 30 },
  streakTitle: { fontFamily: fonts.heading, fontSize: 20, color: ui.text },
  streakBest: { fontFamily: fonts.body, fontSize: 11, color: ui.text, opacity: 0.6 },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: { fontFamily: fonts.body, fontSize: 20, color: ui.text },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  filterIcon: { width: 28, height: 28 },
  cardBody: { flex: 1, gap: 2 },
  desc: { fontFamily: fonts.body, fontSize: 12, color: ui.text, opacity: 0.7 },
  pill: {
    width: 42,
    height: 28,
    borderRadius: 14,
    backgroundColor: ui.habitCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillGold: { backgroundColor: ui.banner },
  pillDanger: { backgroundColor: ui.danger },
  plus: { fontSize: 18, color: '#fff', lineHeight: 20 },
  actionIcon: { width: 16, height: 16 },
  divider: { height: 1, backgroundColor: ui.divider },

  
  hint: { fontFamily: fonts.body, fontSize: 14, color: ui.danger },
  empty: { fontFamily: fonts.body, fontSize: 16, color: ui.text, textAlign: 'center', marginTop: 24 },

  card: {
    backgroundColor: ui.habitCard,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardDelete: { borderColor: ui.danger },
  icon: { width: 34, height: 34 },
  cardTitle: { fontFamily: fonts.body, fontSize: 17, color: ui.text },

  ring: {
    width: 32,
    height: 26,
    borderRadius: 13,
    backgroundColor: ui.toggleRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 22, height: 16, borderRadius: 8, backgroundColor: ui.toggleOff },
  dotDone: { backgroundColor: ui.toggleOn },
});