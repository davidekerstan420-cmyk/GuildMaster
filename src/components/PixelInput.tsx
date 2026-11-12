import { ImageBackground, StyleSheet, TextInput, TextInputProps } from 'react-native';
import { fonts, ui } from '../constants/theme';
import { brandArt } from './icons';

export default function PixelInput({ style, ...props }: TextInputProps) {
  return (
    <ImageBackground source={brandArt.textbox} style={styles.box} resizeMode="stretch">
      <TextInput
        placeholderTextColor={ui.text + '99'}
        autoCapitalize="none"
        {...props}
        style={[styles.input, style]}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  box: { width: '100%', height: 48 },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 6, // keeps text above the box's bottom shadow
    fontFamily: fonts.body,
    fontSize: 16,
    color: ui.text,
  },
});