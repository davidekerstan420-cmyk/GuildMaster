import { supabase } from './supabase';

export type GlobalNotification = {
  id: string;
  message: string;
  sent_at: string;
  delivery_status: 'sent' | 'failed';
};

export async function listGlobalNotifications() {
  return supabase
    .from('global_notifications')
    .select('id, message, sent_at, delivery_status')
    .order('sent_at', { ascending: false });
}
