import { ReactNode } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ui } from '../constants/theme';

const PHONE_MAX_WIDTH = 480;

export default function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.page}>
      <ImageBackground
        source={require('../../assets/images/login-bg.jpg')}
        style={styles.bg}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.flex}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  // On phones this fills the screen. On web it centers a phone-width column.
  page: { flex: 1, alignItems: 'center', backgroundColor: ui.background },
  bg: { flex: 1, width: '100%', maxWidth: PHONE_MAX_WIDTH },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 20 },
});