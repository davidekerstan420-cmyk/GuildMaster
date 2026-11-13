import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddItemModal, { NewItem } from '../../components/AddItemModal';
import FilterModal, { CategoryFilter } from '../../components/FilterModal';
import { cardIcons, homeIcons, noticeArt, questArt } from '../../components/icons';
import ScreenHeader from '../../components/ScreenHeader';
import { fonts, ui } from '../../constants/theme';
import { useGame } from '../../context/GameContext';
import { supabase } from '../../lib/supabase';

type Quest = {
  id: string;
  title: string;
  description: string;
  category: string;
  xp: number;
  points: number;
  done: boolean;
  createdAt: number;
};

const COLUMNS = 'id, title, description, category, xp, points, status, created_at';

const toQuest = (r: any): Quest => ({
  id: r.id,
  title: r.title,
  description: r.description ?? '',
  category: r.category,
  xp: r.xp,
  points: r.points,
  done: r.status === 'completed',
  createdAt: Date.parse(r.created_at),
});

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

export default function QuestScreen() {
  const { refresh: refreshGame } = useGame();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'tasks' | 'completed'>('tasks');
  const [deleteMode, setDeleteMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [rewardFirst, setRewardFirst] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('todo_items')
      .select(COLUMNS)
      .order('created_at', { ascending: false });
    if (error) return setError(error.message);
    setError('');
    setQuests((data ?? []).map(toQuest));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Weekly counter: only quests created this week. Resets by itself each week.
  const weekStart = startOfWeek();
  const thisWeek = quests.filter((q) => q.createdAt >= weekStart);
  const doneCount = thisWeek.filter((q) => q.done).length;

  const visible = quests
    .filter((q) => (tab === 'tasks' ? !q.done : q.done))
    .filter((q) => categoryFilter === 'All' || q.category === categoryFilter)
    .sort((a, b) => (rewardFirst ? b.xp - a.xp : b.createdAt - a.createdAt));

  const addQuest = async (item: NewItem) => {
    const { data, error } = await supabase
      .from('todo_items')
      .insert({ title: item.title, description: item.description, category: item.category })
      .select(COLUMNS)
      .single();
    if (error) return setError(error.message);
    setError('');
    setQuests((prev) => [toQuest(data), ...prev]);
  };

  // Completing is one-way: the server awards XP and coins once.
  const complete = async (id: string) => {
    const q = quests.find((x) => x.id === id);
    if (!q || q.done) return;
    setQuests((prev) => prev.map((x) => (x.id === id ? { ...x, done: true } : x)));
    const { error } = await supabase.rpc('complete_quest', { p_id: id });
    if (error) {
      setError(error.message);
      load();
      return;
    }
    setError('');
    refreshGame();
  };

  const remove = async (id: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
    const { error } = await supabase.from('todo_items').delete().eq('id', id);
    if (error) {
      setError(error.message);
      load();
    }
  };

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
              <Image source={questArt.scroll} style={styles.bannerIcon} resizeMode="contain" />
              <Text style={styles.bannerText}>quests completed</Text>
              <Text style={styles.bannerText}>
                {doneCount}/{thisWeek.length}
              </Text>
            </View>

            <View style={styles.addRow}>
              <Pressable style={styles.addPill} onPress={() => setAddOpen(true)}>
                <Text style={styles.plus}>＋</Text>
                <Text style={styles.addLabel}>Add new quest...</Text>
              </Pressable>
              <Pressable
                onPress={() => setDeleteMode((v) => !v)}
                style={[styles.trash, deleteMode && styles.trashActive]}
              >
                <Image source={noticeArt.delete} style={styles.trashIcon} resizeMode="contain" />
              </Pressable>
            </View>

            <View style={styles.segment}>
              {(['tasks', 'completed'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={[styles.segmentItem, tab === t && styles.segmentItemActive]}
                >
                  <Text style={styles.segmentText}>{t === 'tasks' ? 'Tasks' : 'Completed'}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.dateRow}>
              <Text style={styles.date}>{todayLabel()}</Text>
              <Pressable onPress={() => setFilterOpen(true)} hitSlop={10} style={styles.filterBtn}>
                {categoryFilter !== 'All' && <Text style={styles.filterLabel}>{categoryFilter}</Text>}
                <Image source={questArt.filter} style={styles.filterIcon} resizeMode="contain" />
              </Pressable>
            </View>

            {deleteMode && <Text style={styles.hint}>Tap a quest to delete it</Text>}
            {!!error && <Text style={styles.hint}>{error}</Text>}
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No quests here yet.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => deleteMode && remove(item.id)}
            style={[styles.card, deleteMode && styles.cardDelete]}
          >
            <Pressable onPress={() => complete(item.id)} hitSlop={8}>
              <Image
                source={questArt.check}
                style={[styles.check, item.done && styles.checkDone]}
                resizeMode="contain"
              />
            </Pressable>

            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, item.done && styles.titleDone]} numberOfLines={1}>
                {item.title}
              </Text>
              {!!item.description && (
                <Text style={styles.desc} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
              <View style={styles.chip}>
                <Text style={styles.chipText}>{item.category}</Text>
              </View>
            </View>

            <View style={styles.rewards}>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardText}>+{item.xp}</Text>
                <Image source={homeIcons.xp} style={styles.rewardIcon} resizeMode="contain" />
              </View>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardText}>+{item.points}</Text>
                <Image source={cardIcons.coins} style={styles.rewardIcon} resizeMode="contain" />
              </View>
            </View>
          </Pressable>
        )}
      />

      <AddItemModal visible={addOpen} kind="quest" onClose={() => setAddOpen(false)} onSubmit={addQuest} />
      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={categoryFilter}
        onChange={setCategoryFilter}
        extraLabel="Highest reward first"
        extraValue={rewardFirst}
        onExtraChange={setRewardFirst}
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
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerIcon: { width: 30, height: 30 },
  bannerText: { fontFamily: fonts.body, fontSize: 18, color: ui.text },

  addRow: { flexDirection: 'row', gap: 12 },
  addPill: {
    flex: 1,
    backgroundColor: ui.button,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plus: { fontSize: 22, color: ui.buttonText },
  trash: {
    width: 58,
    backgroundColor: ui.banner,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashActive: { backgroundColor: ui.danger },
  trashIcon: { width: 28, height: 28 },

  addLabel: { flex: 1, fontFamily: fonts.body, fontSize: 18, color: ui.buttonText, paddingVertical: 14 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterIcon: { width: 28, height: 28 },
  filterLabel: { fontFamily: fonts.body, fontSize: 12, color: ui.text },
  desc: { fontFamily: fonts.body, fontSize: 13, color: ui.text, opacity: 0.7 },

  segment: { flexDirection: 'row', backgroundColor: ui.banner, borderRadius: 10, padding: 4 },
  segmentItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentItemActive: { backgroundColor: ui.segmentActive },
  segmentText: { fontFamily: fonts.body, fontSize: 18, color: ui.text },

  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
  check: { width: 26, height: 26 },
  checkDone: { opacity: 0.35 },

  cardBody: { flex: 1, gap: 6 },
  cardTitle: { fontFamily: fonts.body, fontSize: 20, color: ui.text },
  titleDone: { textDecorationLine: 'line-through', opacity: 0.6 },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: ui.chip,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  chipText: { fontFamily: fonts.body, fontSize: 12, color: ui.text },

  rewards: { gap: 6, alignItems: 'flex-end' },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rewardText: { fontFamily: fonts.body, fontSize: 13, color: ui.text },
  rewardIcon: { width: 22, height: 22 },
});