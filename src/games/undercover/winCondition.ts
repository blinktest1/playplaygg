/** Pure win-condition check for Undercover. */

import type { UndercoverPlayer } from './types';
import { getSpyCount } from './words';

export type GameResult = 'civilians_win' | 'spies_win' | 'continue';

export function checkWinCondition(players: UndercoverPlayer[]): GameResult {
  const alive = players.filter((p) => p.alive);
  const spiesAlive = alive.filter((p) => p.role === 'SPY');
  const totalSpies = players.filter((p) => p.role === 'SPY').length;

  // All spies eliminated → civilians win
  if (spiesAlive.length === 0) return 'civilians_win';

  // Spies >= civilians → spies win
  // Exact thresholds based on original spy count
  const civiliansAlive = alive.length - spiesAlive.length;
  if (spiesAlive.length >= civiliansAlive) return 'spies_win';

  return 'continue';
}
