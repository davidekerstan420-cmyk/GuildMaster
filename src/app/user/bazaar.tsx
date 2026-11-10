import { useState } from 'react';
import {
    Image,
    ImageBackground,
    ImageSourcePropType,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { bazaarArt, cardIcons } from '../../components/icons';
import { fonts, ui } from '../../constants/theme';

type BazaarItem = {
  id: string;
  name: string;
  price: number;
  image: ImageSourcePropType;
};

// Empty for now. Later this comes from the CosmeticItem table.
const ITEMS: BazaarItem[] = [];

const SLOTS = 6; // 2 rows x 3
const PAD = 16;
const GAP = 10;
const CARD_RATIO = 0.78; // width / height of the parchment art
const MERCHANT_RATIO = 460 / 600; // width / height of merch.png

// Placeholder. This comes from CharacterProfile.point_balance later.
const POINTS = 123;

export default function BazaarScreen() {
  const { width } = useWindowDimensions();
  const [message, setMessage] = useState('');

  const cardW = (width - PAD * 2 - GAP * 2) / 3;
  const cardH = cardW / CARD_RATIO;
  const merchantW = width * 0.62;
  const merchantH = merchantW / MERCHANT_RATIO;

  const slots = Array.from({ length: SLOTS }, (_, i) => ITEMS[i] ?? null);
  const rows = [slots.slice(0, 3), slots.slice(3, 6)];

  const renderSlot = (item: BazaarItem | null, index: number) => (
    <Pressable
      key={item?.id ?? `empty-${index}`}
      disabled={!item}
      onPress={() => item && setMessage(`${item.name}: purchase coming soon.`)}
      style={{ width: cardW, height: cardH }}
    >
      <ImageBackground source={bazaarArt.card} style={styles.card} resizeMode="stretch">
        {item && (
          <>
            <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.priceRow}>
              <Image source={cardIcons.coins} style={styles.priceIcon} resizeMode="contain" />
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
          </>
        )}
      </ImageBackground>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <ScreenHeader title="THE BAZAAR" />
        <View style={styles.coinPill}>
          <Image source={cardIcons.coins} style={styles.coinIcon} resizeMode="contain" />
          <Text style={styles.coinText}>{POINTS}</Text>
        </View>
      </View>

      <View style={styles.merchantWrap}>
        <Image
          source={bazaarArt.merchant}
          style={{ width: merchantW, height: merchantH }}
          resizeMode="contain"
        />
      </View>

      {/* Shelf overlaps the merchant's legs, like the mockup */}
      <View style={[styles.shelf, { marginTop: -merchantH * 0.3 }]}>
        <View
          style={[styles.band, { top: cardH + GAP / 2 - 6, height: cardH * 0.5 }]}
        />
        {rows.map((row, r) => (
          <View key={r} style={[styles.row, r === 1 && { marginTop: GAP * 2 }]}>
            {row.map((item, i) => renderSlot(item, r * 3 + i))}
          </View>
        ))}
      </View>

      {!!message && <Text style={styles.message}>{message}</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.background },
  header: { paddingHorizontal: PAD, paddingTop: 8, gap: 8 },

  coinPill: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ui.coinPill,
    borderRadius: 14,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  coinIcon: { width: 16, height: 16 },
  coinText: { fontFamily: fonts.body, fontSize: 14, color: ui.buttonText },

  merchantWrap: { alignItems: 'center', marginTop: 4 },

  shelf: { paddingHorizontal: PAD },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: ui.shelfBand,
  },
  row: { flexDirection: 'row', gap: GAP },

  card: { flex: 1, paddingTop: 22, paddingBottom: 14, paddingHorizontal: 12, alignItems: 'center' },
  itemImage: { flex: 1, width: '100%' },
  itemName: { fontFamily: fonts.body, fontSize: 11, color: ui.text, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priceIcon: { width: 12, height: 12 },
  priceText: { fontFamily: fonts.body, fontSize: 11, color: ui.text },

  message: { fontFamily: fonts.body, fontSize: 14, color: ui.text, textAlign: 'center', marginTop: 16 },
});