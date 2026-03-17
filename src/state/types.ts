/** Core state and language types. Current production scope is ru/en/zh only. */

export type ChatGameType = 'undercover' | null;

export type ChatPhase =
  | 'idle'
  | 'waiting_players'
  | 'countdown'
  | 'in_game'
  | 'settlement';

export interface ChatState {
  chatId: number;
  currentGame: ChatGameType;
  phase: ChatPhase;
  data: Record<string, unknown>;
}

export type LanguageCode = 'ru' | 'en' | 'zh';

export type TimerKey = string;
