import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  listGlobalNotifications,
  GlobalNotification,
} from '../../lib/notifications';
import { supabase } from '../../lib/supabase';

export function NotificationsPage() {
  const { session } = useAuth();
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<GlobalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    async function loadHistory() {
      const { data, error: requestError } = await listGlobalNotifications();
      if (!active) return;
      if (requestError)
        setError(
          `Could not load notification history: ${requestError.message}`
        );
      else setHistory(data ?? []);
      setLoading(false);
    }
    void loadHistory();
    return () => {
      active = false;
    };
  }, []);

  async function broadcast() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !session?.user.id) {
      setError('Enter a notification message before broadcasting.');
      return;
    }
    if (
      !window.confirm(
        'Broadcast this notification to every mobile app account? This cannot be undone.'
      )
    )
      return;

    setBroadcasting(true);
    setError('');
    setNotice('');
    const { data, error: requestError } = await supabase
      .from('global_notifications')
      .insert({ message: trimmedMessage, created_by: session.user.id })
      .select('id, message, sent_at, delivery_status')
      .single();

    if (requestError) setError(`Broadcast failed: ${requestError.message}`);
    else if (data) {
      setHistory((current) => [data, ...current]);
      setMessage('');
      setNotice('Notification broadcast successfully.');
    }
    setBroadcasting(false);
  }

  return (
    <div className="dashboard-page notifications-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">GuildMaster admin</div>
          <h1>Global notifications</h1>
          <p>
            Send an announcement to every mobile app account and review previous
            broadcasts.
          </p>
        </div>
      </div>
      {notice ? (
        <div className="inline-notice" role="status">
          {notice}
        </div>
      ) : null}
      {error ? (
        <div className="error-notice" role="alert">
          {error}
        </div>
      ) : null}
      <section className="panel notification-composer">
        <div className="panel-heading">
          <div>
            <h2>Compose announcement</h2>
            <p>
              This message will be visible in the mobile notification center.
            </p>
          </div>
          <span className="soft-chip">All accounts</span>
        </div>
        <label className="form-field form-field-wide">
          Notification message
          <textarea
            rows={8}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Enter your announcement or system notification here..."
            maxLength={2000}
            aria-describedby="notification-message-count"
          />
        </label>
        <div className="notification-composer-footer">
          <span
            id="notification-message-count"
            className="editor-preview-label"
          >
            {message.length}/2000 characters
          </span>
          <button
            className="button button-primary"
            onClick={() => void broadcast()}
            disabled={broadcasting || !message.trim()}
          >
            {broadcasting ? 'Broadcasting…' : '♧ Broadcast Notification'}
          </button>
        </div>
      </section>
      <section className="panel notification-history">
        <div className="panel-heading">
          <div>
            <h2>Broadcast history</h2>
            <p>Previously sent system-wide announcements.</p>
          </div>
          <span className="count-badge">{history.length}</span>
        </div>
        {loading ? (
          <p className="table-message">Loading notification history…</p>
        ) : null}
        {!loading && history.length === 0 ? (
          <p className="table-message">No broadcasts have been sent yet.</p>
        ) : null}
        {!loading && history.length > 0 ? (
          <div className="notification-history-list">
            {history.map((item) => (
              <article className="notification-history-item" key={item.id}>
                <div>
                  <p>{item.message}</p>
                  <time dateTime={item.sent_at}>
                    {new Date(item.sent_at).toLocaleString()}
                  </time>
                </div>
                <span className="status-chip">
                  <i />
                  {item.delivery_status === 'sent' ? 'Sent' : 'Failed'}
                </span>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
