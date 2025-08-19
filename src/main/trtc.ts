import TRTCCloud, { TRTCAppScene, TRTCParams, TXLiteAVError, TXLiteAVWarning } from "@main/libs/trtc-electron-sdk/liteav";
import { eventHandler } from '@main/event_handler';

const trtc = TRTCCloud.getTRTCShareInstance();

console.info("trtc.getSDKVersion()", trtc.getSDKVersion());

trtc.on('onError', (errCode: number, errMsg: string) => {
  console.error('onError:', errCode, errMsg);

  switch (errCode) {
    case TXLiteAVError.ERR_USER_SIG_INVALID:
      break;
    default:
      break
  }

  eventHandler.onError({ code: errCode, message: errMsg })
})

trtc.on('onWarning', (warningCode: number, warningMsg: string, extra: any) => {
  console.warn('onWarning:', warningCode, warningMsg, extra);

  switch (warningCode) {
    case TXLiteAVWarning.WARNING_ROOM_DISCONNECT:
      break
    default:
      break
  }

  eventHandler.onWarning({ code: warningCode, message: warningMsg })
})

trtc.on('onEnterRoom', (result: number) => {
  console.info('onEnterRoom', result);
})

trtc.on('onExitRoom', (reason: number) => {
  console.info('onExitRoom', reason);
})

trtc.on('onRemoteUserEnterRoom', (userId: string) => {
  console.info('onRemoteUserEnterRoom', userId);
})

trtc.on('onRemoteUserLeaveRoom', (userId: string, reason: number) => {
  console.info('onRemoteUserLeaveRoom', userId, reason);
})

export function enterRoom(roomId: number, userId: string, userSig: string): void {
  const enterRoomParams = new TRTCParams(
    1252463781, // SDKAppID
    userId, // UserID
    userSig, // UserSig, use GenerateTestUserSig to generate a user sig for testing, please refer to https://cloud.tencent.com/document/product/647/17275#Server
    roomId, // RoomID
  )
  trtc.enterRoom(enterRoomParams, TRTCAppScene.TRTCAppSceneVoiceChatRoom)
}

export function exitRoom(): void {
  trtc.exitRoom()
}
