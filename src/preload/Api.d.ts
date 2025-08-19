
export interface JoinRoomParams {
  roomId: number;
}

export default interface Api {
  joinRoom(params: JoinRoomParams): Promise<void>;
  leaveRoom(): Promise<void>;
}
