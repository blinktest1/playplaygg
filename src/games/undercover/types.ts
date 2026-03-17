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
  votes: Record<number, number>;
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
  votingEmojis?: string[];
  emojiByPlayerId?: Record<number, string>;
}

export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 12;
export const COUNTDOWN_MS = 35_000;
export const SPEAK_TIME_MS = 25_000;
export const FREE_TALK_MS = 45_000;
export const VOTE_TIMEOUT_MS = 20_000;
export const MAX_ROOMS_PER_CHAT = 20;
