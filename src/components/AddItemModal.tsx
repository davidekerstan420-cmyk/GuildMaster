import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { CATEGORIES, Category } from '../constants/categories';
import { fonts, ui } from '../constants/theme';
import { grantAiConsent, requestChallenge } from '../lib/challenge';
import PixelButton from './PixelButton';

export type NewItem = { title: string; description: string; category: Category };

type Props = {
  visible: boolean;
  kind: 'quest' | 'habit';
  onClose: () => void;
  onSubmit: (item: NewItem) => Promise<void> | void;
};

function AddItemForm({ kind, onClose, onSubmit }: Omit<Props, 'visible'>) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('General');
  const [error, setError] = useState('');
  const [aiNote, setAiNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [askConsent, setAskConsent] = useState(false);

  const save = async () => {
    if (!title.trim()) return setError('Please enter a title.');
    setBusy(true);
    await onSubmit({ title: title.trim(), description: description.trim(), category });
    setBusy(false);
    onClose();
  };

  const runChallenge = async () => {
    setError('');
    setAiNote('');
    setThinking(true);
    const res = await requestChallenge(kind);
    setThinking(false);

    if (!res.ok) {
      if (res.code === 'consent_required') setAskConsent(true);
      else setError(res.message);
      return;
    }
    setTitle(res.challenge.title);
    setDescription(res.challenge.description);
    setCategory(res.challenge.category);
    setAiNote(
      res.challenge.fallback
        ? 'The AI Instructor is resting, so the guild picked this one. Edit anything you like.'
        : 'Suggested by the AI Instructor. Edit anything you like.'
    );
  };

  const allow = async () => {
    const ok = await grantAiConsent();
    if (!ok) return setError('Could not save your choice. Please try again.');
    setAskConsent(false);
    runChallenge();
  };

  return (
    <KeyboardAvoidingView
      style={styles.backdrop}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.card}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <Text style={styles.heading}>{kind === 'quest' ? 'NEW QUEST' : 'NEW HABIT'}</Text>

          {/* Challenge */}
          <View style={styles.challengeBox}>
            <PixelButton
              label={thinking ? '...' : 'Challenge'}
              onPress={runChallenge}
              disabled={thinking || busy}
              width={150}
            />
            <Text style={styles.hint}>Let the AI pick one for you</Text>
          </View>

          {askConsent && (
            <View style={styles.consent}>
              <Text style={styles.consentText}>
                Challenge sends only your age group, the category you use least and the type of task to
                an AI service. Your name, email and task titles are never sent. Allow this?
              </Text>
              <View style={styles.actions}>
                <PixelButton label="No thanks" onPress={() => setAskConsent(false)} width={120} />
                <PixelButton label="Allow" onPress={allow} width={120} />
              </View>
            </View>
          )}

          {!!aiNote && <Text style={styles.note}>{aiNote}</Text>}

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            placeholder={kind === 'quest' ? 'e.g. Finish SD3 docs' : 'e.g. Morning prayer'}
            placeholderTextColor={ui.text + '88'}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            maxLength={300}
            multiline
            placeholder="Optional details"
            placeholderTextColor={ui.text + '88'}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.chip, category === c && styles.chipOn]}
              >
                <Text style={[styles.chipText, category === c && styles.chipTextOn]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <PixelButton label="Cancel" onPress={onClose} width={120} />
            <PixelButton label={busy ? '...' : 'Save'} onPress={save} disabled={busy} width={120} />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// Only handles visibility. The form unmounts when closed, so it starts empty every time.
export default function AddItemModal({ visible, kind, onClose, onSubmit }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {visible && <AddItemForm kind={kind} onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: ui.background, borderRadius: 14, maxHeight: '92%' },
  scroll: { padding: 16, gap: 6 },
  heading: { fontFamily: fonts.heading, fontSize: 22, color: ui.text, textAlign: 'center', marginBottom: 6 },

  challengeBox: { alignItems: 'center', gap: 4, marginBottom: 4 },
  hint: { fontFamily: fonts.body, fontSize: 12, color: ui.text, opacity: 0.7 },
  consent: { backgroundColor: ui.card, borderRadius: 10, padding: 10, gap: 8 },
  consentText: { fontFamily: fonts.body, fontSize: 13, color: ui.text },
  note: { fontFamily: fonts.body, fontSize: 12, color: ui.badgeDate },

  label: { fontFamily: fonts.body, fontSize: 16, color: ui.text, marginTop: 6 },
  input: {
    backgroundColor: ui.banner,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 16,
    color: ui.text,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: { backgroundColor: ui.chip, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 },
  chipOn: { backgroundColor: ui.button },
  chipText: { fontFamily: fonts.body, fontSize: 14, color: ui.text },
  chipTextOn: { color: ui.buttonText },
  error: { fontFamily: fonts.body, fontSize: 14, color: ui.danger, marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 14 },
});