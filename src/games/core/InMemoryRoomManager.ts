/** Generic in-memory room manager for room-based group games. */

export interface BaseRoom {
  chatId: number;
  roomId: number;
  active: boolean;
}

export class InMemoryRoomManager<TRoom extends BaseRoom> {
  private readonly roomsByChat = new Map<number, TRoom[]>();

  constructor(
    private readonly maxRoomsPerChat: number,
    private readonly createRoomState: (chatId: number, roomId: number) => TRoom,
  ) {}

  getActiveRooms(chatId: number): TRoom[] {
    return (this.roomsByChat.get(chatId) || []).filter((room) => room.active);
  }

  getRoom(chatId: number, roomId: number): TRoom | undefined {
    return (this.roomsByChat.get(chatId) || []).find((room) => room.roomId === roomId && room.active);
  }

  createRoom(chatId: number): TRoom | null {
    const activeRooms = this.getActiveRooms(chatId);
    if (activeRooms.length >= this.maxRoomsPerChat) return null;

    const usedIds = new Set(activeRooms.map((room) => room.roomId));
    let nextId = 1;
    while (usedIds.has(nextId) && nextId <= this.maxRoomsPerChat) nextId += 1;
    if (nextId > this.maxRoomsPerChat) return null;

    const room = this.createRoomState(chatId, nextId);
    const list = this.roomsByChat.get(chatId) || [];
    this.roomsByChat.set(chatId, [...list, room]);
    return room;
  }

  endRoom(room: TRoom): void {
    room.active = false;
  }

  entries(): IterableIterator<[number, TRoom[]]> {
    return this.roomsByChat.entries();
  }
}
