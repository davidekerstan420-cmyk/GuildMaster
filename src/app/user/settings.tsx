import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';
import SettingsButton from '../../components/SettingsButton';
import { settingsArt } from '../../components/icons';
import { fonts, ui } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useStoredToggle } from '../../hooks/useStoredToggle';

const MAIN_W = 250;
const SMALL_W = 128;

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const [notifications, toggleNotifications] = useStoredToggle('pref:notifications');
  const [music, toggleMusic] = useStoredToggle('pref:music');
  const [sound, toggleSound] = useStoredToggle('pref:sound');
  const [message, setMessage] = useState('');

  const comingSoon = (what: string) => setMessage(`${what} is coming soon.`);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton />

        <View style={styles.panel}>
          <Text style={styles.title}>SETTINGS</Text>

          <View style={styles.mainButtons}>
            <SettingsButton
              label="Notification"
              width={MAIN_W}
              status={notifications ? 'ON' : 'OFF'}
              dimmed={!notifications}
              onPress={toggleNotifications}
            />
            <SettingsButton
              label="Music"
              width={MAIN_W}
              status={music ? 'ON' : 'OFF'}
              dimmed={!music}
              onPress={toggleMusic}
            />
            <SettingsButton
              label="Sound"
              width={MAIN_W}
              status={sound ? 'ON' : 'OFF'}
              dimmed={!sound}
              onPress={toggleSound}
            />
            <SettingsButton
              label="Account"
              width={MAIN_W}
              onPress={() => router.push('/user/guildcard')}
            />
          </View>

          <View style={styles.bottomButtons}>
            <SettingsButton
              label="Support"
              width={SMALL_W}
              fontSize={16}
              onPress={() => comingSoon('Support')}
            />
            <SettingsButton
              label="Log out"
              width={SMALL_W}
              fontSize={16}
              onPress={signOut}
            />
          </View>
        </View>

        <View style={styles.links}>
          <Pressable style={styles.linkRow} onPress={() => comingSoon('Help & Support')}>
            <Image source={settingsArt.help} style={styles.linkIcon} resizeMode="contain" />
            <Text style={styles.linkText}>Help & Support</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.linkRow} onPress={() => comingSoon('About the guild')}>
            <Image source={settingsArt.about} style={styles.linkIcon} resizeMode="contain" />
            <Text style={styles.linkText}>About the guild</Text>
          </Pressable>
        </View>

        {!!message && <Text style={styles.message}>{message}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.background },
  content: { padding: 16, paddingBottom: 32, gap: 20 },

  panel: {
    backgroundColor: ui.homePanel,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 20,
  },
  title: { fontFamily: fonts.heading, fontSize: 26, color: ui.settingsTitle, letterSpacing: 1 },
  mainButtons: { gap: 10, alignItems: 'center' },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginTop: 14,
  },

  links: { paddingHorizontal: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  linkIcon: { width: 60, height: 46 },
  linkText: { fontFamily: fonts.body, fontSize: 17, color: ui.text },
  divider: { height: 1, backgroundColor: ui.text, marginVertical: 4 },

  message: { fontFamily: fonts.body, fontSize: 14, color: ui.text, textAlign: 'center' },
});