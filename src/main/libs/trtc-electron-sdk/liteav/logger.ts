import { TRTCLogLevel } from "./trtc_define";

function padMs(ms): string {
  const len = ms.toString().length;
  let ret;
  switch (len) {
    case 1:
      ret = `00${ms}`;
      break;
    case 2:
      ret = `0${ms}`;
      break;
    default:
      ret = ms;
      break;
  }
  return ret;
}

class Logger {
  private prefix;
  private logLevel;

  constructor(prefix = "TRTC") {
    this.prefix = `[${prefix}]`;
    this.logLevel = TRTCLogLevel.TRTCLogLevelInfo;
  }

  public info(...args: unknown[]): void {
    let _a;
    if (this.logLevel <= TRTCLogLevel.TRTCLogLevelInfo) {
      const param = Array.from(args);
      (_a = console.info) === null || _a === void 0
        ? void 0
        : _a.apply(console, [this.getTime(), this.prefix, ...param]);
    }
  }

  public log(...args: unknown[]): void {
    let _a;
    if (this.logLevel <= TRTCLogLevel.TRTCLogLevelInfo) {
      const param = Array.from(args);
      (_a = console.log) === null || _a === void 0
        ? void 0
        : _a.apply(console, [this.getTime(), this.prefix, ...param]);
    }
  }

  public warn(...args: unknown[]): void {
    let _a;
    if (this.logLevel <= TRTCLogLevel.TRTCLogLevelWarn) {
      const param = Array.from(args);
      (_a = console.warn) === null || _a === void 0
        ? void 0
        : _a.apply(console, [this.getTime(), this.prefix, ...param]);
    }
  }

  public error(...args: unknown[]): void {
    let _a;
    if (this.logLevel <= TRTCLogLevel.TRTCLogLevelError) {
      const param = Array.from(args);
      (_a = console.error) === null || _a === void 0
        ? void 0
        : _a.apply(console, [this.getTime(), this.prefix, ...param]);
    }
  }

  public debug(...args: unknown[]): void {
    let _a;
    if (this.logLevel <= TRTCLogLevel.TRTCLogLevelDebug) {
      const param = Array.from(args);
      (_a = console.debug) === null || _a === void 0
        ? void 0
        : _a.apply(console, [this.getTime(), this.prefix, ...param]);
    }
  }

  public setLogLevel(logLevel: TRTCLogLevel): void {
    if (logLevel === TRTCLogLevel.TRTCLogLevelNone) {
      this.logLevel = TRTCLogLevel.TRTCLogLevelError;
    } else {
      this.logLevel = logLevel || TRTCLogLevel.TRTCLogLevelInfo;
    }
  }

  private getTime(): string {
    const date = new Date();
    return `${date.toLocaleTimeString("en-US", {
      hourCycle: "h23",
    })}.${padMs(date.getMilliseconds())}`;
  }
}

const logger: Logger = new Logger("TRTC");

export default logger;
export { Logger };
