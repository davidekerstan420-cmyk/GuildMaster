// src/constants/theme.ts
import '@/global.css';

import { Platform } from 'react-native';

/* ---------- Shared palette ---------- */
export const colors = {
  parchment: '#dcc9a3',
  brown: '#6b3f35',
  darkBrown: '#3b2a24',
  gold: '#d4a94e',
  goldText: '#e8c96a',
  text: '#2b1d17',
  danger: '#b3261e',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 20 };

/* ---------- Fonts ---------- */
export const fonts = {
  heading: 'MedievalSharp_400Regular',
  body: 'MedievalSharp_400Regular',
};

/* ---------- Login / Register screens (mobile) ---------- */
export const auth = {
  plate: '#a8672a',
  plateBorder: '#3a3d47',
  plateText: '#f0d9a8',
  panel: '#d3b574',
  inputOnPanel: '#e4dabc',
  inputGold: '#d9b24f',
  inputGoldText: '#f6ecd0',
  buttonLime: '#c9d04a',
  buttonGold: '#d9b24f',
  text: '#2b1d17',
  link: '#1fb5a3',
};

/* ---------- User screens (mobile) ---------- */
export const ui = {
  background: '#dcc9a3',
  banner: '#d4a94e',
  card: '#cfb780',
  button: '#a8672a',
  buttonText: '#f6ecd0',
  chip: '#d6dc6b',
  text: '#2b1d17',
  danger: '#b3261e',
  segmentActive: '#cdb27c',
  tabBar: '#6b3f35',
  tabActive: '#c9d04a',
  habitCard: '#cfb780',
  toggleRing: '#a8672a',
  toggleOff: '#8d8d8d',
  toggleOn: '#c9d04a',
  divider: '#2b1d17',
};

/* ---------- Admin panel (desktop web) ---------- */
export const admin = {
  sidebar: colors.darkBrown,
  sidebarWidth: 240,
  background: '#f5efe3',
  surface: '#ffffff',
  border: '#d9cfb8',
  text: '#2b1d17',
  accent: colors.gold,
  contentMaxWidth: 1100,
};

/* ---------- Template leftovers: delete once unused ---------- */
export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;