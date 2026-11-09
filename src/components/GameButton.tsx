import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { auth, fonts } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function GameButton({
  label,
  onPress,
  color = auth.buttonGold,
  disabled,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: color, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
  },
  label: { fontFamily: fonts.body, fontSize: 16, color: auth.text },
});