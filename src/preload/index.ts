import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import Api, { JoinRoomParams } from './Api';
import MainEventHandler, { MainEvent } from "./MainEventHandler";

// Custom APIs for renderer
const api: Api = {
  async joinRoom(params: JoinRoomParams): Promise<void> {
    await ipcRenderer.invoke('Api', 'joinRoom', params)
  },
  async leaveRoom(): Promise<void> {
    await ipcRenderer.invoke('Api', 'leaveRoom')
  }
};

const mainEvent: MainEvent = {
  addHandler(handler: MainEventHandler): void {
    ipcRenderer.on('event', (event, method: string, info: any) => {
      handler[method as keyof MainEventHandler](info)
    });
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('mainEvent', mainEvent)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.mainEvent = mainEvent
}
