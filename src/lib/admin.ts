import { Platform } from 'react-native';

const g: any = globalThis;

export const confirmAction = (message: string): boolean =>
  typeof g.confirm === 'function' ? g.confirm(message) : false;

export const askText = (message: string): string | null =>
  typeof g.prompt === 'function' ? g.prompt(message) : null;

export function timeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)} days ago`;
}

export function dayLabel(isoDate: string, numeric: boolean) {
  const d = new Date(isoDate + 'T00:00:00');
  return numeric
    ? `${d.getMonth() + 1}/${d.getDate()}`
    : d.toLocaleDateString('en-US', { weekday: 'short' });
}

export const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  if (Platform.OS !== 'web') return;
  // a leading = + - @ can run as a formula in Excel, so it is neutralized
  const cell = (c: string | number) => {
    let s = String(c);
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = rows.map((r) => r.map(cell).join(',')).join('\n');
  const blob = new g.Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = g.URL.createObjectURL(blob);
  const a = g.document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  g.URL.revokeObjectURL(url);
}