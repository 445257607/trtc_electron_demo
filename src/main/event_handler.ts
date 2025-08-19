import MainEventHandler, { ErrorInfo, WarningInfo } from "@preload/MainEventHandler";
import { mainWindow } from "@main/index";

export const eventHandler: MainEventHandler = {
  onError: (info: ErrorInfo) => {
    console.error('EventHandler.onError', info)
    mainWindow?.webContents.send("event", 'onError', info);
  },
  onWarning: (info: WarningInfo) => {
    mainWindow?.webContents.send("event", 'onWarning', info);
  }
};
