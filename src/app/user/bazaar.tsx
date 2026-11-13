import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PixelButton from '../../components/PixelButton';
import ScreenHeader from '../../components/ScreenHeader';
import { bazaarArt, cardIcons } from '../../components/icons';
import { fonts, ui } from '../../constants/theme';
import { useGame } from '../../context/GameContext';
import { itemImage } from '../../lib/itemImage';
import { supabase } from '../../lib/supabase';

type ShopItem = {
  id: string;
  name: string;
  kind: 'avatar' | 'potion';
  imageKey: string | null;
  imageUrl: string | null;
  description: string;
  stock: number | null;
  price: number;
  levelRequired: number;
  xpBonus: number;
};

const MIN_SLOTS = 6; // always show at least 2 rows
const PAD = 16;
const GAP = 10;
const CARD_RATIO = 0.78; // width / height of the parchment art
const KEEPER_RATIO = 200 / 150; // width / height of the slime art

export default function BazaarScreen() {
  const { width } = useWindowDimensions();
  const { profile, refresh: refreshGame } = useGame();

  const [items, setItems] = useState<ShopItem[]>([]);
  const [owned, setOwned] = useState<Map<string, number>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [pose, setPose] = useState(0);

  const level = profile?.level ?? 1;
  const coins = profile?.pointBalance ?? 0;
  const equipped = profile?.avatarItem ?? null;

  const cardW = (width - PAD * 2 - GAP * 2) / 3;
  const cardH = cardW / CARD_RATIO;
  const keeperW = width * 0.6;
  const keeperH = keeperW / KEEPER_RATIO;

  const onTapKeeper = () =>
    setPose((p) => {
      // pick a different pose each tap
      let next = Math.floor(Math.random() * bazaarArt.keeper.length);
      if (next === p) next = (next + 1) % bazaarArt.keeper.length;
      return next;
    });

  const load = useCallback(async () => {
    const [i, inv] = await Promise.all([
      supabase
        .from('cosmetic_items')
        .select('id, name, kind, image_key, image_url, description, stock, price, level_required, xp_bonus')
        .eq('active', true)
        .order('price'),
      supabase.from('inventory_items').select('item_id, quantity'),
    ]);
    if (i.data) {
      setItems(
        i.data.map((r: any) => ({
          id: r.id,
          name: r.name,
          kind: r.kind,
          imageKey: r.image_key,
          imageUrl: r.image_url,
          description: r.description ?? '',
          stock: r.stock,
          price: r.price,
          levelRequired: r.level_required,
          xpBonus: r.xp_bonus,
        }))
      );
    }
    setOwned(new Map((inv.data ?? []).map((r: any) => [r.item_id, r.quantity])));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const run = async (fn: string, args: object, okMessage: string) => {
    setBusy(true);
    setNote('');
    const { error } = await supabase.rpc(fn, args);
    setBusy(false);
    if (error) return setNote(error.message);
    setNote(okMessage);
    await load();
    refreshGame();
  };

  const closeModal = () => {
    setSelectedId(null);
    setNote('');
  };

  const slotCount = Math.max(MIN_SLOTS, Math.ceil(items.length / 3) * 3);
  const slots: (ShopItem | null)[] = Array.from({ length: slotCount }, (_, i) => items[i] ?? null);
  const rows: (ShopItem | null)[][] = [];
  for (let i = 0; i < slots.length; i += 3) rows.push(slots.slice(i, i + 3));

  const selected = items.find((x) => x.id === selectedId) ?? null;
  const qty = selected ? owned.get(selected.id) ?? 0 : 0;
  const locked = selected ? level < selected.levelRequired : false;
  const soldOut = selected ? selected.stock !== null && selected.stock <= 0 : false;

  const tagFor = (item: ShopItem) => {
    const q = owned.get(item.id) ?? 0;
    if (item.stock !== null && item.stock <= 0 && q === 0) return 'SOLD OUT';
    if (item.kind === 'avatar' && q > 0) return item.id === equipped ? 'EQUIPPED' : 'OWNED';
    if (item.kind === 'potion' && q > 0) return `x${q}`;
    if (level < item.levelRequired) return `Lv ${item.levelRequired}`;
    return null;
  };

  const renderSlot = (item: ShopItem | null, index: number) => {
    const tag = item ? tagFor(item) : null;
    return (
      <Pressable
        key={item?.id ?? `empty-${index}`}
        disabled={!item}
        onPress={() => item && setSelectedId(item.id)}
        style={{ width: cardW, height: cardH }}
      >
        <ImageBackground source={bazaarArt.card} style={styles.card} resizeMode="stretch">
          {item && (
            <>
              <Image
                source={itemImage(item.imageKey, item.imageUrl)}
                style={[styles.itemImage, level < item.levelRequired && styles.itemLocked]}
                resizeMode="contain"
              />
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.priceRow}>
                <Image source={cardIcons.coins} style={styles.priceIcon} resizeMode="contain" />
                <Text style={styles.priceText}>{item.price}</Text>
              </View>
              {tag && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              )}
            </>
          )}
        </ImageBackground>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <ScreenHeader title="THE BAZAAR" />
        <View style={styles.coinPill}>
          <Image source={cardIcons.coins} style={styles.coinIcon} resizeMode="contain" />
          <Text style={styles.coinText}>{coins}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.keeperWrap}>
          <Pressable onPress={onTapKeeper}>
            <Image
              source={bazaarArt.keeper[pose]}
              style={{ width: keeperW, height: keeperH }}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <View style={[styles.shelf, { marginTop: -keeperH * 0.12 }]}>
          <View style={[styles.band, { top: cardH + GAP / 2 - 6, height: cardH * 0.5 }]} />
          {rows.map((row, r) => (
            <View key={r} style={[styles.row, r > 0 && { marginTop: GAP * 2 }]}>
              {row.map((item, i) => renderSlot(item, r * 3 + i))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Item details */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {selected && (
              <>
                <Image
                  source={itemImage(selected.imageKey, selected.imageUrl)}
                  style={styles.sheetImage}
                  resizeMode="contain"
                />
                <Text style={styles.sheetName}>{selected.name}</Text>
                <Text style={styles.sheetInfo}>
                  {selected.description ||
                    (selected.kind === 'potion'
                      ? `Drink it to gain ${selected.xpBonus} XP.`
                      : 'An avatar for your guild card.')}
                </Text>
                <View style={styles.priceRow}>
                  <Image source={cardIcons.coins} style={styles.priceIcon} resizeMode="contain" />
                  <Text style={styles.sheetInfo}>{selected.price}</Text>
                  <Text style={styles.sheetInfo}>   Level {selected.levelRequired}+</Text>
                </View>

                <View style={styles.sheetActions}>
                  {selected.kind === 'avatar' && qty > 0 ? (
                    selected.id === equipped ? (
                      <PixelButton
                        label="Unequip"
                        width={140}
                        disabled={busy}
                        onPress={() => run('equip_avatar', { p_item: null }, 'Avatar removed.')}
                      />
                    ) : (
                      <PixelButton
                        label="Equip"
                        width={140}
                        disabled={busy}
                        onPress={() => run('equip_avatar', { p_item: selected.id }, 'Avatar equipped!')}
                      />
                    )
                  ) : (
                    <PixelButton
                      label={locked ? `Lv ${selected.levelRequired}` : soldOut ? 'Sold out' : 'Buy'}
                      width={140}
                      disabled={busy || locked || soldOut}
                      onPress={() => run('purchase_item', { p_item: selected.id }, 'Purchased!')}
                    />
                  )}

                  {selected.kind === 'potion' && qty > 0 && (
                    <PixelButton
                      label={`Use (${qty})`}
                      width={140}
                      disabled={busy}
                      onPress={() => run('use_potion', { p_item: selected.id }, `+${selected.xpBonus} XP!`)}
                    />
                  )}
                </View>

                {!!note && <Text style={styles.note}>{note}</Text>}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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

  keeperWrap: { alignItems: 'center', marginTop: 4 },

  shelf: { paddingHorizontal: PAD },
  band: { position: 'absolute', left: 0, right: 0, backgroundColor: ui.shelfBand },
  row: { flexDirection: 'row', gap: GAP },

  card: { flex: 1, paddingTop: 22, paddingBottom: 14, paddingHorizontal: 12, alignItems: 'center' },
  itemImage: { flex: 1, width: '100%' },
  itemLocked: { opacity: 0.35 },
  itemName: { fontFamily: fonts.body, fontSize: 11, color: ui.text, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priceIcon: { width: 12, height: 12 },
  priceText: { fontFamily: fonts.body, fontSize: 11, color: ui.text },
  tag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: ui.button,
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  tagText: { fontFamily: fonts.body, fontSize: 9, color: ui.buttonText },

  backdrop: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: ui.background, borderRadius: 14, padding: 18, alignItems: 'center', gap: 6 },
  sheetImage: { width: 120, height: 120 },
  sheetName: { fontFamily: fonts.heading, fontSize: 22, color: ui.text },
  sheetInfo: { fontFamily: fonts.body, fontSize: 14, color: ui.text, textAlign: 'center' },
  sheetActions: { gap: 10, marginTop: 10, alignItems: 'center' },
  note: { fontFamily: fonts.body, fontSize: 14, color: ui.danger, textAlign: 'center', marginTop: 6 },
});