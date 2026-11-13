import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type GameProfile = {
  name: string;
  level: number;
  xpTotal: number;
  pointBalance: number;
  currentStreak: number;
  bestStreak: number;
  avatarItem: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
};

type GameState = {
  profile: GameProfile | null;
  xpPerLevel: number;
  unread: number;
  refresh: () => Promise<void>;
};

const GameContext = createContext<GameState>({
  profile: null,
  xpPerLevel: 100,
  unread: 0,
  refresh: async () => {},
});

export const useGame = () => useContext(GameContext);

export function GameProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [xpPerLevel, setXpPerLevel] = useState(100);
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setUnread(0);
      return;
    }
    const [p, c, n, r] = await Promise.all([
      supabase
        .from('profiles')
        .select('name, level, xp_total, point_balance, current_streak, best_streak, avatar_item, avatar:cosmetic_items!avatar_item(image_key, image_url)')
        .eq('id', userId)
        .single(),
      supabase.from('game_config').select('xp_per_level').eq('id', 1).single(),
      supabase.from('notices').select('id'),
      supabase.from('notice_reads').select('notice_id'),
    ]);

    if (c.data) setXpPerLevel(c.data.xp_per_level);
    if (p.data) {
      setProfile({
        name: p.data.name ?? '',
        level: p.data.level,
        xpTotal: p.data.xp_total,
        pointBalance: p.data.point_balance,
        currentStreak: p.data.current_streak,
        bestStreak: p.data.best_streak,
        avatarItem: p.data.avatar_item ?? null,
        avatarKey: (p.data as any).avatar?.image_key ?? null,
        avatarUrl: (p.data as any).avatar?.image_url ?? null,
      });
    }
    const readIds = new Set((r.data ?? []).map((x: any) => x.notice_id));
    setUnread((n.data ?? []).filter((x: any) => !readIds.has(x.id)).length);
  }, [userId]);

  useEffect(() => {
      if (!userId) return;
      // apply penalties for days missed while the app was closed, then load stats
      supabase.rpc('process_missed_days').then(() => refresh());
    }, [userId, refresh]);

  return (
    <GameContext.Provider
  value={{
    profile: userId ? profile : null,
    xpPerLevel,
    unread: userId ? unread : 0,
    refresh,
  }}
>
      {children}
    </GameContext.Provider>
  );
}