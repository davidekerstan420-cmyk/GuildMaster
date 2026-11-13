import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet } from 'react-native';
import { backIcon } from './icons';

export default function BackButton({ onPress }: { onPress?: () => void }) {
  const router = useRouter();
  const handle = () => {
  if (onPress) onPress();
  else if (router.canGoBack()) router.back();
  else router.replace('/user');
};

  return (
    <Pressable onPress={handle} hitSlop={10}>
      {({ pressed }) => (
        <Image
          source={pressed ? backIcon.pressed : backIcon.idle}
          style={styles.icon}
          resizeMode="contain"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({ icon: { width: 44, height: 44 } });