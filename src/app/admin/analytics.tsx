import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Btn, Card, Chips, Page, StatCard } from '../../components/admin/AdminUI';
import { AreaChart, CATEGORY_COLORS, Donut } from '../../components/admin/Charts';
import { admin } from '../../constants/theme';
import { compact, dayLabel, downloadCsv } from '../../lib/admin';
import { supabase } from '../../lib/supabase';

export default function Analytics() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [a, setA] = useState<any>(null);
  const [activity, setActivity] = useState<{ day: string; tasks: number }[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.rpc('admin_analytics', { p_days: days }).then(({ data, error }) => (error ? setError(error.message) : setA(data)));
    supabase.rpc('admin_activity', { p_days: days }).then(({ data }) => setActivity((data ?? []) as any[]));
  }, [days]);

  const cats: { category: string; count: number }[] = a?.categories ?? [];
  const total = cats.reduce((x, c) => x + c.count, 0);
  const avg = a && a.users > 0 ? (a.requests / a.users).toFixed(1) : '0';

  const report = () =>
    a &&
    downloadCsv(`guildmaster-analytics-${days}d.csv`, [
      ['Metric', 'Value'],
      ['AI requests', a.requests], ['Tokens consumed', a.tokens], ['Users of AI', a.users],
      ['AI success rate %', a.success_rate ?? 'n/a'], ['AI fallbacks', a.fallbacks],
      [], ['Day', 'Tasks completed'], ...activity.map((x) => [x.day, x.tasks]),
      [], ['Category', 'Created'], ...cats.map((c) => [c.category, c.count]),
    ]);

  return (
    <Page
      title="Analytics"
      subtitle="Understand AI usage and how adventurers organize their goals."
      action={
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Chips value={days} onChange={setDays} options={[{ value: 7, label: '7 days' }, { value: 30, label: '30 days' }, { value: 90, label: '90 days' }]} />
          <Btn kind="ghost" icon="download" label="Export" onPress={report} />
        </View>
      }
    >
      {!!error && <Text style={{ color: admin.red }}>{error}</Text>}

      <View style={s.row}>
        <StatCard icon="zap" label="AI requests" value={compact(a?.requests ?? 0)} sub={`Last ${days} days`} />
        <StatCard icon="cpu" label="Tokens consumed" value={compact(a?.tokens ?? 0)} sub="Counted since tracking began" />
        <StatCard icon="users" label="Avg. per user" value={avg} sub={`${a?.users ?? 0} users`} />
        <StatCard icon="check-circle" label="AI success rate" value={a?.success_rate == null ? 'n/a' : `${a.success_rate}%`} sub={`${a?.fallbacks ?? 0} fallbacks`} />
      </View>

      <View style={s.row}>
        <Card style={{ flex: 2, minWidth: 420, padding: 20 }}>
          <Text style={s.title}>Guild activity</Text>
          <Text style={s.sub}>Tasks completed over the last {days} days</Text>
          <AreaChart data={activity.map((x) => ({ label: dayLabel(x.day, days > 7), value: x.tasks }))} height={280} />
        </Card>

        <Card style={{ flex: 1, minWidth: 300, padding: 20, gap: 12 }}>
          <Text style={s.title}>Task categories</Text>
          <Text style={s.sub}>Quests and habits created in this period</Text>
          <Donut
            data={cats.map((c) => ({ label: c.category, value: c.count, color: CATEGORY_COLORS[c.category] ?? admin.gold }))}
            centerValue={compact(total)}
            centerLabel="Total tasks"
          />
          {cats.map((c) => (
            <View key={c.category} style={s.legend}>
              <View style={[s.swatch, { backgroundColor: CATEGORY_COLORS[c.category] ?? admin.gold }]} />
              <Text style={[s.legendText, { flex: 1 }]}>{c.category}</Text>
              <Text style={s.legendText}>{total ? Math.round((c.count / total) * 100) : 0}%</Text>
            </View>
          ))}
        </Card>
      </View>
    </Page>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 16, fontWeight: '700', color: admin.text },
  sub: { fontSize: 12, color: admin.muted, marginBottom: 8 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 13, color: admin.text },
});