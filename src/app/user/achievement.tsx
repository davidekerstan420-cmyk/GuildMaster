import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { BadgeIconKey, badgeIcons, homeIcons } from '../../components/icons';
import { fonts, ui } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: BadgeIconKey;
  unlockedAt?: string;
  progress?: number;
  target?: number;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function BadgeCard({ badge, locked }: { badge: Badge; locked: boolean }) {
  return (
    <View style={[styles.card, locked && styles.cardLocked]}>
      <View style={[styles.iconBox, locked && styles.iconBoxLocked]}>
        <Image
          source={badgeIcons[badge.icon]}
          style={[styles.icon, locked && styles.iconLocked]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.body}>
        <Text style={[styles.name, locked && styles.textLocked]} numberOfLines={1}>
          {badge.name}
        </Text>
        <Text style={[styles.desc, locked && styles.textLocked]}>{badge.description}</Text>
        {!locked && <Text style={styles.date}>Unlocked: {badge.unlockedAt}</Text>}
      </View>

      {locked && (
        <View style={styles.side}>
          <Text style={[styles.progress, styles.textLocked]}>
            {badge.progress ?? 0}/{badge.target ?? 0}
          </Text>
          <Text style={[styles.lockedTag, styles.textLocked]}>Locked</Text>
        </View>
      )}
    </View>
  );
}

export default function AchievementScreen() {
  const [badges, setBadges] = useState<Badge[]>([]);

  useFocusEffect(
    useCallback(() => {
      supabase.rpc('get_achievements').then(({ data }) => {
        setBadges(
          (data ?? []).map((r: any) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            icon: r.icon as BadgeIconKey,
            target: r.target,
            progress: r.progress,
            unlockedAt: r.unlocked_at ? formatDate(r.unlocked_at) : undefined,
          }))
        );
      });
    }, [])
  );

  const unlocked = badges.filter((b) => b.unlockedAt);
  const locked = badges.filter((b) => !b.unlockedAt);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="USER ACHIEVEMENTS" />

        <View style={styles.banner}>
          <Image source={homeIcons.achievement} style={styles.bannerIcon} resizeMode="contain" />
          <Text style={styles.bannerText}>achievements unlocked</Text>
          <Text style={styles.bannerCount}>{unlocked.length}</Text>
        </View>

        <Text style={styles.section}>Unlocked</Text>
        {unlocked.length === 0 && <Text style={styles.empty}>Nothing unlocked yet. Complete a quest to begin!</Text>}
        {unlocked.map((b) => (
          <BadgeCard key={b.id} badge={b} locked={false} />
        ))}

        <View style={styles.sectionRow}>
          <Text style={[styles.section, styles.textLocked]}>Locked</Text>
          <Text style={[styles.discover, styles.textLocked]}>{locked.length} to discover</Text>
        </View>
        {locked.map((b) => (
          <BadgeCard key={b.id} badge={b} locked />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.background },
  content: { padding: 16, paddingBottom: 32, gap: 10 },

  banner: {
    backgroundColor: ui.banner,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  bannerIcon: { width: 32, height: 32 },
  bannerText: { flex: 1, fontFamily: fonts.body, fontSize: 18, color: ui.text },
  bannerCount: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: ui.countYellow,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  section: { fontFamily: fonts.body, fontSize: 20, color: ui.text, marginTop: 8 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  discover: { fontFamily: fonts.body, fontSize: 13, marginBottom: 2 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: ui.text },

  card: {
    backgroundColor: ui.badgeUnlocked,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardLocked: { backgroundColor: ui.badgeLockedCard },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: ui.banner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxLocked: { backgroundColor: '#b3ad9c' },
  icon: { width: 36, height: 36 },
  iconLocked: { opacity: 0.4 },

  body: { flex: 1, gap: 1 },
  name: { fontFamily: fonts.body, fontSize: 20, color: ui.text },
  desc: { fontFamily: fonts.body, fontSize: 14, color: ui.text },
  date: { fontFamily: fonts.body, fontSize: 12, color: ui.badgeDate },
  textLocked: { color: ui.badgeLockedText },

  side: { alignSelf: 'stretch', alignItems: 'flex-end', justifyContent: 'space-between' },
  progress: { fontFamily: fonts.body, fontSize: 15 },
  lockedTag: { fontFamily: fonts.body, fontSize: 11 },
});