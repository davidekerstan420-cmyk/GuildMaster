import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

export type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string };

const GREETING: ChatMsg = {
  id: 'greeting',
  role: 'assistant',
  content: 'Welcome to the guild, adventurer! What can I help you with?',
};

export function useReceptionistChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([GREETING]);
  const [loading, setLoading] = useState(false);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMsg = { id: `u${Date.now()}`, role: 'user', content: trimmed };
      const next = [...messages, userMsg];
      setMessages(next);
      setLoading(true);

      const addBot = (content: string) =>
        setMessages((m) => [...m, { id: `a${Date.now()}`, role: 'assistant', content }]);

      try {
        // the greeting is local only, so don't send it
        const history = next
          .filter((m) => m.id !== 'greeting')
          .map(({ role, content }) => ({ role, content }));

        const { data, error } = await supabase.functions.invoke('receptionist-chat', {
          body: { messages: history },
        });
        if (error) throw error;

        if (data?.ok) {
          addBot(data.reply);
        } else if (data?.code === 'consent_required') {
          addBot('I can only chat once you have agreed to the AI features. Check your settings!');
        } else {
          addBot(data?.message ?? 'The guild line is down. Try again in a moment!');
        }
      } catch {
        addBot('The guild line is down. Try again in a moment!');
      } finally {
        setLoading(false);
      }
    },
    [messages, loading]
  );

  return { messages, loading, send };
}