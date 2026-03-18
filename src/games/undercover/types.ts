/** Undercover game types and constants */

export interface UndercoverPlayer {
  userId: number;
  name: string;
  username?: string;
  alive: boolean;
  role?: 'SPY' | 'CIVILIAN';
  word?: string;
}

export type UndercoverPhase =
  | 'waiting'
  | 'assigning'
  | 'speaking'
  | 'free_talk'
  | 'voting'
  | 'finished';

export interface UndercoverState {
  players: UndercoverPlayer[];
  undercoverUserIds: number[];
  civilianWord: string;
  undercoverWord: string;
  phase: UndercoverPhase;
  speakingIndex: number;
  votes: Record<string, number>;
  roundNumber: number;
}

export interface UndercoverRoom {
  chatId: number;
  roomId: number;
  state: UndercoverState;
  active: boolean;
  createdAt?: number;
  recruitmentMessageId?: number;
  username?: string;
  /** Unix ms deadline for current phase timeout. Persisted to Redis so polling can
   *  resume games after process restart. undefined = no active deadline. */
  phaseDeadline?: number;
  /** Which phase the deadline belongs to, so polling knows what to do on expiry. */
  phaseDeadlineType?: 'countdown' | 'speaking' | 'freetalk' | 'vote' | 'next_round';
}

export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 12;
export const COUNTDOWN_MS = 35_000;
export const SPEAK_TIME_MS = 30_000;
export const FREE_TALK_MS = 90_000;
export const VOTE_TIMEOUT_MS = 20_000;
export const MAX_ROOMS_PER_CHAT = 20;
