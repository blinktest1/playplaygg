/**
 * Cross-game gatekeeper.
 *
 * Goal: prevent multiple top-level game flows from overlapping in the same group.
 * We treat these as mutually exclusive product experiences:
 * - Undercover
 * - Truth or Dare
 * - Anonymous Wall
 */

import { getOrCreateChatState } from './state';

export type MainGame = 'undercover' | 'truthordare' | 'anonymous';

export async function getRunningGame(chatId: number): Promise<MainGame | null> {
  const state = await getOrCreateChatState(chatId);
  if (state.currentGame === 'anonymous' && state.phase !== 'idle') return 'anonymous';

  const { getActiveTodSession } = await import('./games/truthordare');
  const tod = getActiveTodSession(chatId);
  if (tod) return 'truthordare';

  const { getActiveRooms } = await import('./games/undercover/redisRooms');
  const rooms = await getActiveRooms(chatId);
  if (rooms.length > 0) return 'undercover';

  return null;
}

export async function canStartGame(chatId: number, requested: MainGame): Promise<boolean> {
  const running = await getRunningGame(chatId);
  return running == null || running === requested;
}
