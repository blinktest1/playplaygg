/**
 * Abstract room repository interface.
 * InMemory for dev, Redis for production — swap without touching game logic.
 *
 * BaseRoom & BasePlayer are the single source of truth — import from here.
 */

export interface BasePlayer {
  userId: number;
  name: string;
  username?: string;
}

export interface BaseRoom {
  chatId: number;
  roomId: number;
  active: boolean;
  createdAt?: number;
  recruitmentMessageId?: number;
  username?: string;
  state: {
    phase: string;
    players: BasePlayer[];
  };
}

export interface RoomRepository<T extends BaseRoom> {
  getRoom(chatId: number, roomId: number): Promise<T | undefined>;
  getActiveRooms(chatId: number): Promise<T[]>;
  createRoom(chatId: number): Promise<T | null>;
  saveRoom(room: T): Promise<void>;
  endRoom(room: T): Promise<void>;
  allEntries(): Promise<Array<[number, T[]]>>;
}
