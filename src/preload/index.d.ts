import { ElectronAPI } from '@electron-toolkit/preload'
import Api from "./Api";
import { MainEvent } from "./MainEventHandler";

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
    mainEvent: MainEvent
  }
}
