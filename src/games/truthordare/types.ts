/** Truth or Dare game types and constants */

export interface TodPlayer {
  userId: number;
  name: string;
  username?: string;
}

export interface TodSession {
  chatId: number;
  players: TodPlayer[];
  /** Index into players array — who's being asked */
  currentIndex: number;
  /** Selected tier for this session */
  tier: 'icebreaker' | 'advanced' | 'spicy';
  /** Whether the session is active */
  active: boolean;
  /** Timestamp of last activity (auto-expire stale sessions) */
  lastActivity: number;
}

/** Minimum players to start */
export const TOD_MIN_PLAYERS = 2;
/** Maximum players */
export const TOD_MAX_PLAYERS = 20;
/** Session auto-expires after 30 min of inactivity */
export const TOD_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
/** Time to answer before auto-skip */
export const TOD_ANSWER_TIMEOUT_MS = 60_000;
