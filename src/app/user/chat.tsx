import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { receptionistArt } from '../../components/icons';
import { fonts, ui } from '../../constants/theme';
import { useReceptionistChat } from '../../hooks/useReceptionistChat';

export default function ChatScreen() {
  const router = useRouter();
  const { messages, loading, send } = useReceptionistChat();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const onSend = () => {
    send(input);
    setInput('');
  };

  const data = loading
    ? [...messages, { id: 'typing', role: 'assistant' as const, content: '...' }]
    : messages;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Image source={receptionistArt.act1} style={styles.portrait} resizeMode="contain" />
        <Text style={styles.title}>Guild Receptionist</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          data={data}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
              <Text style={[styles.msg, item.role === 'user' && styles.userMsg]}>{item.content}</Text>
            </View>
          )}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Speak to the receptionist..."
            placeholderTextColor="#7a5a3a"
            maxLength={300}
            onSubmitEditing={onSend}
            returnKeyType="send"
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.5 }]}
            onPress={onSend}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: ui.background },
  header: { backgroundColor: ui.homePanel, padding: 10, alignItems: 'center', gap: 4 },
  back: { alignSelf: 'flex-start', fontFamily: fonts.body, fontSize: 16, color: ui.panelText },
  portrait: { width: 60, height: 80 },
  title: { fontFamily: fonts.heading, fontSize: 18, color: ui.panelText },

  list: { padding: 12, gap: 8 },
  bubble: { maxWidth: '82%', padding: 10, borderRadius: 12 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: ui.card },
  userBubble: { alignSelf: 'flex-end', backgroundColor: ui.button },
  msg: { fontFamily: fonts.body, fontSize: 15, color: ui.text },
  userMsg: { color: ui.buttonText },

  inputRow: { flexDirection: 'row', gap: 8, padding: 10, backgroundColor: ui.card },
  input: {
    flex: 1,
    backgroundColor: ui.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: fonts.body,
    fontSize: 15,
    color: ui.text,
  },
  sendBtn: { backgroundColor: ui.button, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  sendText: { fontFamily: fonts.body, fontSize: 15, color: ui.buttonText },
});