import { Category } from '../constants/categories';
import { supabase } from './supabase';

export type Challenge = {
  title: string;
  description: string;
  category: Category;
  fallback: boolean;
};

export type ChallengeResult =
  | { ok: true; challenge: Challenge }
  | { ok: false; code: 'consent_required' | 'limit' | 'error'; message: string };

export async function requestChallenge(kind: 'quest' | 'habit'): Promise<ChallengeResult> {
  const { data, error } = await supabase.functions.invoke('generate-challenge', { body: { kind } });
  if (error || !data) {
    return { ok: false, code: 'error', message: 'Could not reach the Challenge service.' };
  }
  return data as ChallengeResult;
}

export async function grantAiConsent(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) return false;
  const { error } = await supabase.from('profiles').update({ ai_consent: true }).eq('id', id);
  return !error;
}