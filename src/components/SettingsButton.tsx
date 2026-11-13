import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { fonts, ui } from '../constants/theme';
import { settingsArt } from './icons';

type Props = {
  label: string;
  onPress: () => void;
  width: number;
  fontSize?: number;
  status?: string; // e.g. "ON" / "OFF"
  dimmed?: boolean;
  style?: ViewStyle;
};

const RATIO = 279 / 48; // width / height of the button art

export default function SettingsButton({
  label,
  onPress,
  width,
  fontSize = 22,
  status,
  dimmed,
  style,
}: Props) {
  const height = width / RATIO;

  return (
    <Pressable onPress={onPress} style={[{ width, height }, style]}>
      {({ pressed }) => {
        const flat = pressed || dimmed;
        return (
          <View style={{ width, height, opacity: dimmed ? 0.85 : 1 }}>
            <Image
              source={flat ? settingsArt.buttonPressed : settingsArt.button}
              style={{ width, height }}
              resizeMode="stretch"
            />
            <View
              style={[
                styles.overlay,
                { paddingBottom: height * 0.1 },
                pressed && { transform: [{ translateY: 1 }] },
              ]}
            >
              <Text style={[styles.label, { fontSize }]} numberOfLines={1}>
                {label}
              </Text>
              {!!status && <Text style={styles.status}>{status}</Text>}
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.body, color: ui.text },
  status: {
    position: 'absolute',
    right: 12,
    fontFamily: fonts.body,
    fontSize: 11,
    color: ui.text,
    opacity: 0.7,
  },
});