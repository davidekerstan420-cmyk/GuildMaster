import { Feather } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Btn, Card, Page, StatCard } from '../../components/admin/AdminUI';
import { AreaChart, CATEGORY_COLORS } from '../../components/admin/Charts';
import { admin } from '../../constants/theme';
import { compact, dayLabel, downloadCsv } from '../../lib/admin';
import { supabase } from '../../lib/supabase';

type Activity = { day: string; tasks: number };

export default function Overview() {
  const router = useRouter();
  const [o, setO] = useState<any>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.rpc('admin_overview').then(({ data, error }) => (error ? setError(error.message) : setO(data)));
    supabase.rpc('admin_activity', { p_days: 7 }).then(({ data }) => setActivity((data ?? []) as Activity[]));
  }, []);

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const cats: { category: string; count: number }[] = o?.categories ?? [];
  const maxCat = Math.max(1, ...cats.map((c) => c.count));

  const report = () => {
    if (!o) return;
    downloadCsv('guildmaster-overview.csv', [
      ['Metric', 'Value'],
      ['Active adventurers', o.adventurers],
      ['New adventurers (30 days)', o.new_this_month],
      ['Tasks completed (7 days)', o.tasks_week],
      ['AI tokens used', o.tokens],
      ['Suspended accounts', o.suspended],
      [],
      ['Day', 'Tasks completed'],
      ...activity.map((a) => [a.day, a.tasks]),
      [],
      ['Category', 'Tasks and habits'],
      ...cats.map((c) => [c.category, c.count]),
    ]);
  };

  const attention = [
    { label: 'Suspended accounts', count: o?.suspended ?? 0, icon: 'user-x', to: '/admin/accounts' },
    { label: 'Users near the AI daily limit', count: o?.heavy_ai_users ?? 0, icon: 'zap', to: '/admin/analytics' },
    { label: 'AI fallbacks in the last 24h', count: o?.fallbacks_24h ?? 0, icon: 'alert-triangle', to: '/admin/analytics' },
  ] as const;

  return (
    <Page
      title={`${greeting}, Guild Keeper`}
      subtitle="Here is how your realm is doing today."
      action={<Btn label="Generate report" icon="download" onPress={report} />}
    >
      {!!error && <Text style={{ color: admin.red }}>{error}</Text>}

      <View style={s.row}>
        <StatCard icon="users" label="Active adventurers" value={compact(o?.adventurers ?? 0)} sub={o ? `+${o.new_this_month} in the last 30 days` : undefined} />
        <StatCard icon="check-square" label="Tasks completed" value={compact(o?.tasks_week ?? 0)} sub="Last 7 days" />
        <StatCard icon="cpu" label="AI tokens used" value={compact(o?.tokens ?? 0)} sub="All time" />
      </View>

      <View style={s.row}>
        <Card style={{ flex: 2, minWidth: 420, padding: 20 }}>
          <Text style={s.cardTitle}>Guild activity</Text>
          <Text style={s.cardSub}>Tasks completed over the last 7 days</Text>
          <AreaChart data={activity.map((a) => ({ label: dayLabel(a.day, false), value: a.tasks }))} />
        </Card>

        <Card style={{ flex: 1, minWidth: 280, padding: 20 }}>
          <Text style={s.cardTitle}>Needs attention</Text>
          <Text style={s.cardSub}>Items requiring review</Text>
          {attention.map((a) => (
            <Pressable key={a.label} style={s.attn} onPress={() => router.push(a.to as Href)}>
              <View style={s.attnIcon}><Feather name={a.icon} size={16} color={a.count > 0 ? admin.orange : admin.muted} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.attnLabel}>{a.label}</Text>
                <Text style={s.attnSub}>{a.count} {a.count === 1 ? 'item' : 'items'}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={admin.muted} />
            </Pressable>
          ))}
        </Card>
      </View>

      <Card style={{ padding: 20, gap: 12 }}>
        <Text style={s.cardTitle}>Top task categories</Text>
        {cats.length === 0 && <Text style={s.cardSub}>No tasks yet.</Text>}
        {cats.map((c) => (
          <View key={c.category} style={{ gap: 4 }}>
            <View style={s.catHead}>
              <Text style={s.attnLabel}>{c.category}</Text>
              <Text style={s.cardSub}>{c.count}</Text>
            </View>
            <View style={s.track}>
              <View style={[s.fill, { width: `${(c.count / maxCat) * 100}%`, backgroundColor: CATEGORY_COLORS[c.category] ?? admin.gold }]} />
            </View>
          </View>
        ))}
      </Card>
    </Page>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: admin.text },
  cardSub: { fontSize: 12, color: admin.muted, marginBottom: 8 },
  attn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: admin.border },
  attnIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: admin.orangeBg, alignItems: 'center', justifyContent: 'center' },
  attnLabel: { fontSize: 14, fontWeight: '600', color: admin.text },
  attnSub: { fontSize: 12, color: admin.muted },
  catHead: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 8, borderRadius: 4, backgroundColor: admin.grayBg, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});