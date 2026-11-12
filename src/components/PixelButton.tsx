import { Image, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { fonts, ui } from '../constants/theme';
import { buttonArt } from './icons';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  width?: number;
  style?: ViewStyle;
};

const RATIO = 4; // width / height of the button art. Adjust if it looks stretched.

export default function PixelButton({ label, onPress, disabled, width = 170, style }: Props) {
  const height = width / RATIO;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[{ width, height, alignSelf: 'center', opacity: disabled ? 0.6 : 1 }, style]}
    >
      {({ pressed }) => (
        <>
          <Image source={buttonArt.primary} style={StyleSheet.absoluteFill} resizeMode="stretch" />
          <Text style={[styles.label, { paddingBottom: height * 0.12 }, pressed && styles.labelPressed]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: fonts.body,
    fontSize: 16,
    color: ui.text,
  },
  labelPressed: { transform: [{ translateY: 2 }] },
});