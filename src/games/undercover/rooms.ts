/** In-memory room access for Undercover, built on the shared room manager. */

import { InMemoryRoomManager } from '../core/InMemoryRoomManager';
import type { UndercoverRoom, UndercoverState } from './types';
import { MAX_ROOMS_PER_CHAT } from './types';

function createInitialState(): UndercoverState {
  return {
    players: [],
    undercoverUserIds: [],
    civilianWord: '',
    undercoverWord: '',
    phase: 'waiting',
    speakingIndex: 0,
    votes: {},
    roundNumber: 1,
  };
}

const manager = new InMemoryRoomManager<UndercoverRoom>(
  MAX_ROOMS_PER_CHAT,
  (chatId, roomId) => ({
    chatId,
    roomId,
    state: createInitialState(),
    active: true,
    createdAt: Date.now(),
  }),
);

export function getActiveRooms(chatId: number): UndercoverRoom[] {
  return manager.getActiveRooms(chatId);
}

export function getAllRoomsByChat(): IterableIterator<[number, UndercoverRoom[]]> {
  return manager.entries();
}

export function createRoom(chatId: number): UndercoverRoom | null {
  return manager.createRoom(chatId);
}

export function getRoom(chatId: number, roomId: number): UndercoverRoom | undefined {
  return manager.getRoom(chatId, roomId);
}

export function endRoom(room: UndercoverRoom): void {
  manager.endRoom(room);
}
