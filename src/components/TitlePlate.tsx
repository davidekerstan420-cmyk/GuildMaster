import { StyleSheet, Text, View } from 'react-native';
import { auth, fonts } from '../constants/theme';

export default function TitlePlate({ title }: { title: string }) {
  return (
    <View style={styles.frame}>
      <View style={styles.plate}>
        <Text style={styles.text}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    backgroundColor: auth.plateBorder,
    padding: 6,
  },
  plate: {
    backgroundColor: auth.plate,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  text: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: auth.plateText,
    textAlign: 'center',
    letterSpacing: 1,
  },
});