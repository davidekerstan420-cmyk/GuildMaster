import { Feather } from '@expo/vector-icons';
import { ComponentProps, ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { admin } from '../../constants/theme';

type IconName = ComponentProps<typeof Feather>['name'];

export function Page({ title, subtitle, action, children }: {
  title: string; subtitle?: string; action?: ReactNode; children: ReactNode;
}) {
  return (
    <View style={s.page}>
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>GUILDMASTER ADMIN</Text>
          <Text style={s.title}>{title}</Text>
          {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function StatCard({ icon, label, value, sub }: { icon: IconName; label: string; value: string; sub?: string }) {
  return (
    <View style={[s.card, s.stat]}>
      <View style={s.statIcon}><Feather name={icon} size={18} color={admin.purple} /></View>
      <View>
        <Text style={s.statLabel}>{label}</Text>
        <Text style={s.statValue}>{value}</Text>
        {!!sub && <Text style={s.statSub}>{sub}</Text>}
      </View>
    </View>
  );
}

const TONES = {
  green: [admin.greenBg, admin.green], orange: [admin.orangeBg, admin.orange],
  red: [admin.redBg, admin.red], gray: [admin.grayBg, admin.muted], purple: [admin.purpleBg, admin.purple],
} as const;

export function Pill({ text, tone }: { text: string; tone: keyof typeof TONES }) {
  return (
    <View style={[s.pill, { backgroundColor: TONES[tone][0] }]}>
      <Text style={[s.pillText, { color: TONES[tone][1] }]}>{text}</Text>
    </View>
  );
}

export function Btn({ label, onPress, kind = 'primary', disabled, icon }: {
  label: string; onPress: () => void; kind?: 'primary' | 'tan' | 'ghost' | 'danger'; disabled?: boolean; icon?: IconName;
}) {
  const bg = { primary: admin.primary, tan: admin.tan, ghost: admin.surface, danger: admin.redBg }[kind];
  const fg = { primary: '#fff', tan: admin.primary, ghost: admin.text, danger: admin.red }[kind];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[s.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, kind === 'ghost' && { borderWidth: 1, borderColor: admin.border }]}
    >
      {icon && <Feather name={icon} size={14} color={fg} />}
      <Text style={[s.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={s.search}>
      <Feather name="search" size={16} color={admin.muted} />
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={admin.muted} style={s.searchInput} />
    </View>
  );
}

export function Chips<T extends string | number>({ options, value, onChange }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <View style={s.chips}>
      {options.map((o) => (
        <Pressable key={String(o.value)} onPress={() => onChange(o.value)} style={[s.chip, value === o.value && s.chipOn]}>
          <Text style={[s.chipText, value === o.value && s.chipTextOn]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Field({ label, children, style }: { label: string; children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={admin.muted}
      {...props}
      style={[s.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }, props.style]}
    />
  );
}

export function AdminModal({ visible, title, onClose, children }: {
  visible: boolean; title: string; onClose: () => void; children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.modal} onPress={() => {}}>
          <Text style={s.modalTitle}>{title}</Text>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const table = StyleSheet.create({
  head: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 20, backgroundColor: admin.tan },
  headText: { fontSize: 11, fontWeight: '600', color: admin.muted, letterSpacing: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: admin.border },
  text: { fontSize: 14, color: admin.text },
  muted: { fontSize: 12, color: admin.muted },
  empty: { padding: 28, textAlign: 'center', color: admin.muted },
});

const s = StyleSheet.create({
  page: { width: '100%', maxWidth: admin.contentMaxWidth, padding: 32, gap: 20, alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'flex-end', gap: 16, marginBottom: 4 },
  eyebrow: { fontSize: 11, fontWeight: '600', color: admin.gold, letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: '700', color: admin.text, marginTop: 6 },
  subtitle: { fontSize: 14, color: admin.muted, marginTop: 4 },
  card: { backgroundColor: admin.surface, borderRadius: 14, borderWidth: 1, borderColor: admin.border, overflow: 'hidden' },
  stat: { flex: 1, minWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  statIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: admin.purpleBg, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 12, color: admin.muted },
  statValue: { fontSize: 26, fontWeight: '700', color: admin.text },
  statSub: { fontSize: 12, color: admin.green },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  pillText: { fontSize: 11, fontWeight: '600' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  btnText: { fontSize: 14, fontWeight: '600' },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: admin.border, borderRadius: 8, paddingHorizontal: 12, backgroundColor: admin.surfaceAlt },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: admin.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: admin.border, backgroundColor: admin.surface },
  chipOn: { backgroundColor: admin.primary, borderColor: admin.primary },
  chipText: { fontSize: 13, color: admin.text },
  chipTextOn: { color: '#fff' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: admin.text },
  input: { borderWidth: 1, borderColor: admin.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: admin.text, backgroundColor: admin.surface },
  backdrop: { flex: 1, backgroundColor: '#0008', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { width: 520, maxWidth: '100%', backgroundColor: admin.surface, borderRadius: 14, padding: 24, gap: 14 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: admin.text },
});