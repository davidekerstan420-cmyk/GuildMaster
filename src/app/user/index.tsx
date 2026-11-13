import { Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../components/Avatar';
import { homeIcons, receptionistArt } from '../../components/icons';
import { fonts, ui } from '../../constants/theme';
import { useGame } from '../../context/GameContext';

// Placeholders. HP comes from CharacterProfile later.
const HP = 100;
const MAX_HP = 100;

// Sample messages. Later these come from the AI Instructor.
const MESSAGES = [
  'Welcome back, adventurer!',
  'You still have quests waiting on the board.',
  'Keep your streak alive. Check your habits today!',
  'The Bazaar has new wares. Take a look!',
  'Every small quest counts. One at a time!',
   'Your party is waiting. Ready to continue the journey?',
  'A new day, a new chance to level up!',
  'Sharpen your sword and tackle today\'s quests.',
  'Even the greatest heroes started with a single step.',
  'Your streak is glowing. Don\'t let it go out!',
  'The tavern is quiet without you. Time to get back to it!',
  'Loot awaits those who finish their quests.',
  'Rest is part of the adventure, but so is showing up.',
  'The realm needs you. Check your habits today!',
  'Another quest completed means another step toward glory.',
  'Your XP bar is hungry. Feed it with a few habits!',
  'Legends are built one habit at a time.',
  'The road ahead is long, but you\'re getting stronger.',
  'Check the quest board. Something has your name on it!',
];

const POSES = [receptionistArt.act1, receptionistArt.act2];

const RECEPTIONIST_RATIO = 234 / 376; // width / height
const BUBBLE_RATIO = 315 / 135; // width / height
const COUNTER_H = 92

function StatBar({
  label,
  icon,
  value,
  max,
  color,
}: {
  label: string;
  icon: any;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <View style={styles.stat}>
      <View style={styles.statLabelRow}>
        <Image source={icon} style={styles.statIcon} resizeMode="contain" />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { profile, xpPerLevel, unread, refresh } = useGame();

  // reload stats every time Home is opened, so XP is never stale
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const level = profile?.level ?? 1;
  const xp = (profile?.xpTotal ?? 0) % xpPerLevel;

  const [pose, setPose] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  const bubbleW = width * 0.84;
  const bubbleH = bubbleW / BUBBLE_RATIO;

  const onTapReceptionist = () => {
    setPose((p) => (p + 1) % POSES.length);
    setMsgIndex((i) => {
      // pick a different message each tap
      let next = Math.floor(Math.random() * MESSAGES.length);
      if (next === i) next = (next + 1) % MESSAGES.length;
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Status panel */}
      <View style={styles.panelWrap}>
        <View style={styles.panel}>
          <View style={styles.avatarCol}>
            <Avatar size={80} />
            <View style={styles.levelRow}>
              <Image source={homeIcons.level} style={styles.levelIcon} resizeMode="contain" />
              <Text style={styles.levelText}>LEVEL {level}</Text>
            </View>
          </View>

          <View style={styles.bars}>
            <StatBar label="Hitpoints" icon={homeIcons.hp} value={HP} max={MAX_HP} color={ui.hpFill} />
            <StatBar
              label={`Experience  ${xp}/${xpPerLevel}`}
              icon={homeIcons.xp}
              value={xp}
              max={xpPerLevel}
              color={ui.xpFill}
            />
          </View>

          <View style={styles.iconCol}>
            <Pressable onPress={() => router.push('/user/settings' as Href)} hitSlop={8}>
              <Image source={homeIcons.settings} style={styles.sideIcon} resizeMode="contain" />
            </Pressable>
            <Pressable onPress={() => router.push('/user/notice' as Href)} hitSlop={8}>
              <Image
                source={unread > 0 ? homeIcons.noticeUnread : homeIcons.notice}
                style={styles.sideIcon}
                resizeMode="contain"
              />
            </Pressable>
            <Pressable onPress={() => router.push('/user/achievement' as Href)} hitSlop={8}>
              <Image source={homeIcons.achievement} style={styles.sideIcon} resizeMode="contain" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        <Pressable
          onPress={onTapReceptionist}
          style={[styles.receptionistWrap, { bottom: COUNTER_H - 12 }]}
        >
          <Image source={POSES[pose]} style={styles.receptionist} resizeMode="contain" />
        </Pressable>

        <View style={[styles.counter, { height: COUNTER_H }]} />

        <View style={[styles.bubble, { width: bubbleW, height: bubbleH, bottom: 10 }]}>
          <Image source={receptionistArt.bubble} style={StyleSheet.absoluteFill} resizeMode="stretch" />
          <View style={[styles.bubbleText, { top: bubbleH * 0.37, bottom: bubbleH * 0.12 }]}>
            <Text style={styles.message} numberOfLines={2}>
              {MESSAGES[msgIndex]}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.floor} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.background },

  panelWrap: { backgroundColor: ui.background, padding: 10 },
  panel: {
    backgroundColor: ui.homePanel,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    gap: 12,
  },
  avatarCol: { alignItems: 'center', gap: 6 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  levelIcon: { width: 16, height: 16 },
  levelText: { fontFamily: fonts.body, fontSize: 12, color: ui.panelText },

  bars: { flex: 1, gap: 8, paddingTop: 2 },
  stat: { gap: 3 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statIcon: { width: 14, height: 14 },
  statLabel: { fontFamily: fonts.body, fontSize: 14, color: ui.panelText },
  track: { height: 10, borderRadius: 5, backgroundColor: ui.barTrack, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },

  iconCol: { gap: 8, alignItems: 'center' },
  sideIcon: { width: 32, height: 32 },

  stage: { flex: 1, backgroundColor: ui.background, overflow: 'hidden', alignItems: 'center' },
  receptionistWrap: { position: 'absolute', top: 16, alignItems: 'center', justifyContent: 'flex-end' },
  receptionist: { height: '100%', aspectRatio: RECEPTIONIST_RATIO },

  counter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ui.counter,
    borderTopWidth: 4,
    borderTopColor: ui.counterEdge,
  },
  bubble: { position: 'absolute' },
  bubbleText: {
    position: 'absolute',
    left: 22,
    right: 22,
    justifyContent: 'center',
  },
  message: { fontFamily: fonts.body, fontSize: 15, color: ui.text, textAlign: 'center' },

  floor: { height: 14, backgroundColor: ui.floor },
});