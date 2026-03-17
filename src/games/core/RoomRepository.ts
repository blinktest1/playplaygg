/**
 * Abstract room repository interface.
 * InMemory for dev, Redis for production — swap without touching game logic.
 */

export interface BaseRoomData {
  chatId: number;
  roomId: number;
  active: boolean;
}

export interface RoomRepository<T extends BaseRoomData> {
  getRoom(chatId: number, roomId: number): Promise<T | undefined>;
  getActiveRooms(chatId: number): Promise<T[]>;
  createRoom(chatId: number): Promise<T | null>;
  saveRoom(room: T): Promise<void>;
  endRoom(room: T): Promise<void>;
  allEntries(): Promise<Array<[number, T[]]>>;
}
