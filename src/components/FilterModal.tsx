import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES, Category } from '../constants/categories';
import { fonts, ui } from '../constants/theme';

export type CategoryFilter = Category | 'All';

type Props = {
  visible: boolean;
  onClose: () => void;
  value: CategoryFilter;
  onChange: (v: CategoryFilter) => void;
  extraLabel?: string; // optional extra toggle, e.g. "Highest reward first"
  extraValue?: boolean;
  onExtraChange?: (v: boolean) => void;
};

export default function FilterModal({
  visible,
  onClose,
  value,
  onChange,
  extraLabel,
  extraValue,
  onExtraChange,
}: Props) {
  const options: CategoryFilter[] = ['All', ...CATEGORIES];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.heading}>FILTER</Text>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {options.map((o) => (
              <Pressable
                key={o}
                onPress={() => onChange(o)}
                style={[styles.chip, value === o && styles.chipOn]}
              >
                <Text style={[styles.chipText, value === o && styles.chipTextOn]}>{o}</Text>
              </Pressable>
            ))}
          </View>

          {!!extraLabel && onExtraChange && (
            <Pressable style={styles.extra} onPress={() => onExtraChange(!extraValue)}>
              <View style={[styles.box, extraValue && styles.boxOn]} />
              <Text style={styles.label}>{extraLabel}</Text>
            </Pressable>
          )}

          <Pressable style={styles.done} onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: ui.background, borderRadius: 14, padding: 16, gap: 8 },
  heading: { fontFamily: fonts.heading, fontSize: 22, color: ui.text, textAlign: 'center' },
  label: { fontFamily: fonts.body, fontSize: 16, color: ui.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: ui.chip, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 },
  chipOn: { backgroundColor: ui.button },
  chipText: { fontFamily: fonts.body, fontSize: 14, color: ui.text },
  chipTextOn: { color: ui.buttonText },
  extra: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  box: { width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: ui.text },
  boxOn: { backgroundColor: ui.toggleOn },
  done: { alignSelf: 'center', backgroundColor: ui.banner, borderRadius: 18, paddingHorizontal: 28, paddingVertical: 8, marginTop: 8 },
  doneText: { fontFamily: fonts.body, fontSize: 16, color: ui.text },
});