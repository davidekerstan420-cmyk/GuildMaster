import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { fonts, ui } from '../constants/theme';
import { buttonArt } from './icons';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  width?: number;
  style?: ViewStyle;
};

const RATIO = 155 / 40; // width / height of login_register-button.png

export default function PixelButton({ label, onPress, disabled, width = 170, style }: Props) {
  const height = width / RATIO;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[{ width, height, alignSelf: 'center', opacity: disabled ? 0.6 : 1 }, style]}
    >
      {({ pressed }) => (
        <View style={{ width, height }}>
          <Image source={buttonArt.primary} style={{ width, height }} resizeMode="stretch" />
          <View
            style={[
              styles.labelWrap,
              { paddingBottom: height * 0.15 }, // keeps text above the orange bottom edge
              pressed && { transform: [{ translateY: 2 }] },
            ]}
          >
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  labelWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.body, fontSize: 16, color: ui.text },
});