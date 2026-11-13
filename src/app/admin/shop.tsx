import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Btn, Card, Chips, Field, Input, Page, Pill, SearchBar } from '../../components/admin/AdminUI';
import { admin } from '../../constants/theme';
import { confirmAction } from '../../lib/admin';
import { itemImage } from '../../lib/itemImage';
import { supabase } from '../../lib/supabase';

type Item = {
  id: string | null; name: string; kind: 'avatar' | 'potion'; description: string;
  price: string; stock: string; levelRequired: string; xpBonus: string;
  imageKey: string | null; imageUrl: string | null; active: boolean;
};

const blank = (): Item => ({
  id: null, name: '', kind: 'avatar', description: '', price: '50', stock: '',
  levelRequired: '1', xpBonus: '0', imageKey: null, imageUrl: null, active: false,
});

const fromRow = (r: any): Item => ({
  id: r.id, name: r.name, kind: r.kind, description: r.description ?? '', price: String(r.price),
  stock: r.stock == null ? '' : String(r.stock), levelRequired: String(r.level_required),
  xpBonus: String(r.xp_bonus), imageKey: r.image_key, imageUrl: r.image_url, active: r.active,
});

const BUCKET = 'item-images';
const TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function Shop() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<Item | null>(null);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('cosmetic_items').select('*').order('created_at');
    if (error) return setMsg(error.message);
    setRows(data ?? []);
  }, []);

  // Initial load. State is only set after the await, and ignored if the page is gone.
useEffect(() => {
  let cancelled = false;
  supabase
    .from('cosmetic_items')
    .select('*')
    .order('created_at')
    .then(({ data, error }) => {
      if (cancelled) return;
      if (error) setMsg(error.message);
      else setRows(data ?? []);
    });
  return () => {
    cancelled = true;
  };
}, []);

  const set = (patch: Partial<Item>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const shown = rows.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()));

  const upload = async () => {
    setMsg('');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled) return;
    setUploading(true);
    try {
      const blob = await (await fetch(res.assets[0].uri)).blob();
      if (!TYPES.includes(blob.type)) return setMsg('Use a PNG, JPG or WebP image.');
      if (blob.size > 1024 * 1024) return setMsg('The image must be under 1 MB.');
      const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: '31536000' });
      if (error) return setMsg(error.message);
      set({ imageUrl: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl });
      setMsg('Image uploaded. Save the item to keep it.');
    } finally {
      setUploading(false);
    }
  };

  const save = async (publish: boolean) => {
    if (!form) return;
    const name = form.name.trim();
    const price = Number(form.price);
    const level = Number(form.levelRequired);
    const xp = Number(form.xpBonus);
    const stock = form.stock.trim() === '' ? null : Number(form.stock);

    if (!name || name.length > 40) return setMsg('Name is required (40 characters max).');
    if (!Number.isInteger(price) || price < 0) return setMsg('Price must be a whole number, 0 or more.');
    if (!Number.isInteger(level) || level < 1) return setMsg('Level required must be 1 or more.');
    if (form.kind === 'potion' && (!Number.isInteger(xp) || xp < 0)) return setMsg('XP bonus must be a whole number, 0 or more.');
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) return setMsg('Stock must be blank (unlimited) or a whole number.');
    if (publish && !form.imageUrl && !form.imageKey) return setMsg('Upload an image before publishing.');

    const row = {
      name, kind: form.kind, description: form.description.trim().slice(0, 300), price,
      level_required: level, xp_bonus: form.kind === 'potion' ? xp : 0, stock,
      image_url: form.imageUrl, image_key: form.imageKey, active: publish,
    };

    setSaving(true);
    const q = form.id
      ? supabase.from('cosmetic_items').update(row).eq('id', form.id).select('*').single()
      : supabase.from('cosmetic_items').insert(row).select('*').single();
    const { data, error } = await q;
    setSaving(false);
    if (error) return setMsg(error.message);
    setForm(fromRow(data));
    setMsg(publish ? 'Published. Players can see it in the Bazaar.' : 'Saved as a draft. Players cannot see it.');
    load();
  };

  const remove = async () => {
    if (!form?.id) return;
    if (!confirmAction('Delete this item? Players who own it will lose it. Choose "Save draft" to just hide it instead.')) return;
    const { error } = await supabase.from('cosmetic_items').delete().eq('id', form.id);
    if (error) return setMsg(error.message);
    setForm(null);
    setMsg('Item deleted.');
    load();
  };

  const preview = form ? itemImage(form.imageKey, form.imageUrl) : undefined;

  return (
    <Page
      title="Shop editor"
      subtitle="Curate avatars and potions for the Bazaar."
      action={<Btn label="New item" icon="plus" onPress={() => { setForm(blank()); setMsg(''); }} />}
    >
      <View style={s.cols}>
        <Card style={s.list}>
          <View style={{ padding: 12 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search items" />
          </View>
          {shown.map((r) => (
            <Pressable key={r.id} onPress={() => { setForm(fromRow(r)); setMsg(''); }} style={[s.item, form?.id === r.id && s.itemOn]}>
              <View style={s.thumb}>
                {itemImage(r.image_key, r.image_url) ? (
                  <Image source={itemImage(r.image_key, r.image_url)} style={{ width: 30, height: 30 }} resizeMode="contain" />
                ) : (
                  <Feather name="image" size={16} color={admin.purple} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.itemName}>{r.name}</Text>
                <Text style={s.itemSub}>
                  {r.kind === 'potion' ? 'Potion' : 'Avatar'} · {r.price} gold{r.active ? '' : ' · draft'}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={admin.muted} />
            </Pressable>
          ))}
          {shown.length === 0 && <Text style={s.empty}>No items yet.</Text>}
        </Card>

        <Card style={s.detail}>
          {!form ? (
            <Text style={s.empty}>Select an item, or create a new one.</Text>
          ) : (
            <View style={{ padding: 24, gap: 16 }}>
              <View style={s.detailHead}>
                <View>
                  <Text style={s.eyebrow}>ITEM DETAILS</Text>
                  <Text style={s.detailTitle}>{form.name || 'New item'}</Text>
                </View>
                {form.id && <Pill text={form.active ? 'Published' : 'Draft'} tone={form.active ? 'green' : 'gray'} />}
              </View>

              <View style={s.imageRow}>
                <View style={s.preview}>
                  {preview ? <Image source={preview} style={{ width: 88, height: 88 }} resizeMode="contain" /> : <Feather name="image" size={28} color={admin.muted} />}
                </View>
                <View style={{ gap: 6 }}>
                  <Btn kind="tan" icon="upload" label={uploading ? 'Uploading...' : 'Upload image'} onPress={upload} disabled={uploading} />
                  <Text style={s.hint}>PNG, JPG or WebP, under 1 MB. Square images with a transparent background work best.</Text>
                </View>
              </View>

              <View style={s.twoCol}>
                <Field label="Name" style={{ flex: 1 }}><Input value={form.name} onChangeText={(v) => set({ name: v })} maxLength={40} /></Field>
                <Field label="Item type" style={{ flex: 1 }}>
                  <Chips value={form.kind} onChange={(v) => set({ kind: v })} options={[{ value: 'avatar', label: 'Avatar' }, { value: 'potion', label: 'Potion' }]} />
                </Field>
              </View>

              <Field label="Description">
                <Input value={form.description} onChangeText={(v) => set({ description: v })} multiline maxLength={300} placeholder="Shown to players in the Bazaar" />
              </Field>

              <View style={s.twoCol}>
                <Field label="Price (gold)" style={{ flex: 1 }}><Input value={form.price} onChangeText={(v) => set({ price: v })} keyboardType="number-pad" /></Field>
                <Field label="Stock (blank = unlimited)" style={{ flex: 1 }}><Input value={form.stock} onChangeText={(v) => set({ stock: v })} keyboardType="number-pad" placeholder="Unlimited" /></Field>
              </View>

              <View style={s.twoCol}>
                <Field label="Level required" style={{ flex: 1 }}><Input value={form.levelRequired} onChangeText={(v) => set({ levelRequired: v })} keyboardType="number-pad" /></Field>
                {form.kind === 'potion' ? (
                  <Field label="XP bonus" style={{ flex: 1 }}><Input value={form.xpBonus} onChangeText={(v) => set({ xpBonus: v })} keyboardType="number-pad" /></Field>
                ) : <View style={{ flex: 1 }} />}
              </View>

              {!!msg && <Text style={s.msg}>{msg}</Text>}

              <View style={s.actions}>
                {form.id ? <Btn kind="danger" label="Delete" onPress={remove} /> : <View />}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Btn kind="ghost" label="Save draft" onPress={() => save(false)} disabled={saving} />
                  <Btn label="Publish changes" onPress={() => save(true)} disabled={saving} />
                </View>
              </View>
            </View>
          )}
        </Card>
      </View>
      {!form && !!msg && <Text style={s.msg}>{msg}</Text>}
    </Page>
  );
}

const s = StyleSheet.create({
  cols: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' },
  list: { width: 340 },
  detail: { flex: 1, minWidth: 480 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  itemOn: { backgroundColor: admin.tan },
  thumb: { width: 40, height: 40, borderRadius: 10, backgroundColor: admin.purpleBg, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 14, fontWeight: '600', color: admin.text },
  itemSub: { fontSize: 12, color: admin.muted },
  empty: { padding: 28, textAlign: 'center', color: admin.muted },
  detailHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { fontSize: 11, fontWeight: '600', color: admin.gold, letterSpacing: 1 },
  detailTitle: { fontSize: 20, fontWeight: '700', color: admin.text, marginTop: 4 },
  imageRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  preview: { width: 100, height: 100, borderRadius: 12, borderWidth: 1, borderColor: admin.border, backgroundColor: admin.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 12, color: admin.muted, maxWidth: 320 },
  twoCol: { flexDirection: 'row', gap: 16 },
  msg: { fontSize: 13, color: admin.primary },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: admin.border, paddingTop: 16 },
});