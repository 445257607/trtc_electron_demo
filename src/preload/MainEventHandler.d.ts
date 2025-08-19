
export interface ErrorInfo {
  code: number
  message: string
}

export interface WarningInfo {
  code: number
  message: string
}

export default interface MainEventHandler {
  onError(info: ErrorInfo)
  onWarning(info: WarningInfo)
}


export interface MainEvent {
  addHandler(handler: MainEventHandler): void
}
