import { Image, View } from 'react-native';
import { ui } from '../constants/theme';
import { useGame } from '../context/GameContext';
import { itemImage } from '../lib/itemImage';

export default function Avatar({ size }: { size: number }) {
  const { profile } = useGame();
  const src = itemImage(profile?.avatarKey, profile?.avatarUrl);

  return (
    <View style={{ width: size, height: size, backgroundColor: ui.barTrack }}>
      {src ? <Image source={src} style={{ width: size, height: size }} resizeMode="contain" /> : null}
    </View>
  );
}