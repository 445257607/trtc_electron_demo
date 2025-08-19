import Api, { JoinRoomParams } from "@preload/Api";
import * as trtc from "./trtc";


const api: Api = {
  async joinRoom(joinRoomParams: JoinRoomParams): Promise<void> {
    console.info('joinRoom:', joinRoomParams);
    trtc.enterRoom(1, '1', '')
  },
  async leaveRoom(): Promise<void> {
    trtc.exitRoom()
  }
}

export default api
