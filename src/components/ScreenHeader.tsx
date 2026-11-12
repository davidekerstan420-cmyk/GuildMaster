import { StyleSheet, Text, View } from 'react-native';
import { fonts, ui } from '../constants/theme';
import BackButton from './BackButton';

export default function ScreenHeader({ title }: { title: string }) {
  return (
    <View style={styles.row}>
      <BackButton />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: fonts.heading, fontSize: 26, color: ui.text, letterSpacing: 1 },
});