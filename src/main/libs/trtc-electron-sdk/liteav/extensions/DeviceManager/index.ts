import {
  TRTCDeviceInfo,
  TRTCDeviceType,
} from "../../trtc_define";
import logger from "@main/libs/trtc-electron-sdk/liteav/logger";
import NodeTRTCEngine from "*.node";
import events_1 from "events";
// declare const NodeTRTCEngine: any;
/**
 * 设备管理器
 */
export class TRTCDeviceManager {
  private logPrefix;
  private isIPCMode;
  private nodeDeviceManager;
  private promiseStore;
  private eventEmitter;
  constructor(options: {
    isIPCMode: boolean;
    nodeTRTCCloud:
      | typeof NodeTRTCEngine.NodeTRTCCloud
      | typeof NodeTRTCEngine.RemoteTRTCCloud;
  }) {
    this.logPrefix = "[TRTCDeviceManager]";
    this.promiseStore = new Map();
    this.eventEmitter = new events_1.EventEmitter();
    this.eventHandler = this.eventHandler.bind(this);
    this.isIPCMode = options.isIPCMode;
    // if (this.isIPCMode) {
    //   this.nodeDeviceManager = new NodeTRTCEngine.NodeRemoteDeviceManager();
    //   this.nodeDeviceManager.setRemoteDeviceManagerCallback(this.eventHandler);
    // } else {
      this.nodeDeviceManager = options.nodeTRTCCloud;
    // }
  }
  destroy(): void {
    let _a, _b;
    this.nodeDeviceManager = null;
    (_a = this.promiseStore) === null || _a === void 0
      ? void 0
      : _a.forEach((value) => {
          value.forEach(({ reject }) => {
            reject();
          });
        });
    (_b = this.promiseStore) === null || _b === void 0 ? void 0 : _b.clear();
    this.promiseStore = undefined;
    this.eventEmitter = undefined;
  }
  /**
   * 获取设备列表
   *
   * @param type {TRTCDeviceType} - 设备类型
   * @returns {Array<TRTCDeviceInfo>}
   */
  getDevicesList(type: TRTCDeviceType): Array<TRTCDeviceInfo> {
    logger.debug(`${this.logPrefix}getDevicesList`, type);
    const deviceInfos = this.nodeDeviceManager.getDevicesList(type);
    if (type === TRTCDeviceType.TRTCDeviceTypeCamera) {
      deviceInfos === null || deviceInfos === void 0
        ? void 0
        : deviceInfos.forEach((item) => {
            try {
              if (item.deviceProperties) {
                const properties = JSON.parse(item.deviceProperties);
                item.deviceProperties = properties;
              } else {
                // 虚拟摄像头可能没有 deviceProperties 字段
                item.deviceProperties = {};
              }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
              logger.warn(
                `${this.logPrefix}camera device properties parse error.`,
                JSON.stringify(item),
              );
              item.deviceProperties = {};
            }
          });
    }
    return deviceInfos;
  }
  setCurrentDevice(
    type: TRTCDeviceType,
    deviceId: string,
  ): Promise<void> | void {
    {
      logger.debug(
        `${this.logPrefix}setCurrentDevice`,
        type,
        deviceId,
      );
      if (this.isIPCMode) {
        return new Promise((resolve, reject) => {
          const key = `setCurrentDevice-${type}`;
          this.addPromise(key, resolve, reject);
          this.nodeDeviceManager.setCurrentDevice(type, deviceId);
        });
      } else {
        this.nodeDeviceManager.setCurrentDevice(type, deviceId);
      }
    }
  }
  getCurrentDevice(
    type: TRTCDeviceType,
  ): Promise<TRTCDeviceInfo> | TRTCDeviceInfo {
    logger.debug(`${this.logPrefix}getCurrentDevice`, type);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `getCurrentDevice-${type}`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.getCurrentDevice(type);
      });
    } else {
      return this.nodeDeviceManager.getCurrentDevice(type);
    }
  }
  setCurrentDeviceVolume(
    type: TRTCDeviceType,
    volume: number,
  ): Promise<void> | void {
    logger.debug(
      `${this.logPrefix}setCurrentDeviceVolume`,
      type,
      volume,
    );
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `setCurrentDeviceVolume-${type}`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.setCurrentDeviceVolume(type, volume);
      });
    } else {
      this.nodeDeviceManager.setCurrentDeviceVolume(type, volume);
    }
  }
  getCurrentDeviceVolume(type: TRTCDeviceType): Promise<number> | number {
    logger.debug(`${this.logPrefix}getCurrentDeviceVolume`, type);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `getCurrentDeviceVolume-${type}`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.getCurrentDeviceVolume(type);
      });
    } else {
      return this.nodeDeviceManager.getCurrentDeviceVolume(type);
    }
  }
  setCurrentDeviceMute(
    type: TRTCDeviceType,
    mute: boolean,
  ): Promise<void> | void {
    logger.debug(`${this.logPrefix}setCurrentDeviceMute`, type, mute);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `setCurrentDeviceMute-${type}`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.setCurrentDeviceMute(type, mute);
      });
    } else {
      this.nodeDeviceManager.setCurrentDeviceMute(type, mute);
    }
  }
  getCurrentDeviceMute(type: TRTCDeviceType): Promise<boolean> | boolean {
    logger.debug(`${this.logPrefix}getCurrentDeviceMute`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `getCurrentDeviceMute-${type}`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.getCurrentDeviceMute(type);
      });
    } else {
      return this.nodeDeviceManager.getCurrentDeviceMute(type);
    }
  }
  enableFollowingDefaultAudioDevice(
    type: TRTCDeviceType,
    enable: boolean,
  ): Promise<void> | void {
    logger.debug(
      `${this.logPrefix}enableFollowingDefaultAudioDevice`,
      type,
      enable,
    );
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `enableFollowingDefaultAudioDevice-${type}`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.enableFollowingDefaultAudioDevice(type, enable);
      });
    } else {
      this.nodeDeviceManager.enableFollowingDefaultAudioDevice(type, enable);
    }
  }
  startMicDeviceTest(
    interval: number,
    playback?: boolean,
  ): Promise<void> | void {
    logger.debug(
      `${this.logPrefix}startMicDeviceTest`,
      interval,
      playback,
    );
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `startMicDeviceTest`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.startMicDeviceTest(interval, playback);
      });
    } else {
      this.nodeDeviceManager.startMicDeviceTest(interval, playback);
    }
  }
  stopMicDeviceTest(): Promise<void> | void {
    logger.debug(`${this.logPrefix}stopMicDeviceTest`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `stopMicDeviceTest`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.stopMicDeviceTest();
      });
    } else {
      this.nodeDeviceManager.stopMicDeviceTest();
    }
  }
  startSpeakerDeviceTest(filePath: string): Promise<void> | void {
    logger.debug(`${this.logPrefix}startSpeakerDeviceTest`, filePath);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `startSpeakerDeviceTest`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.startSpeakerDeviceTest(filePath);
      });
    } else {
      this.nodeDeviceManager.startSpeakerDeviceTest(filePath);
    }
  }
  stopSpeakerDeviceTest(): Promise<void> | void {
    logger.debug(`${this.logPrefix}stopSpeakerDeviceTest`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `stopSpeakerDeviceTest`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.stopSpeakerDeviceTest();
      });
    } else {
      this.nodeDeviceManager.stopSpeakerDeviceTest();
    }
  }
  setApplicationPlayVolume(volume: number): Promise<void> | void {
    logger.debug(`${this.logPrefix}setApplicationPlayVolume`, volume);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `setApplicationPlayVolume`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.setApplicationPlayVolume(volume);
      });
    } else {
      this.nodeDeviceManager.setApplicationPlayVolume(volume);
    }
  }
  getApplicationPlayVolume(): Promise<number> | number {
    logger.debug(`${this.logPrefix}getApplicationPlayVolume`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `getApplicationPlayVolume`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.getApplicationPlayVolume();
      });
    } else {
      return this.nodeDeviceManager.getApplicationPlayVolume();
    }
  }
  setApplicationMuteState(mute: boolean): Promise<void> | void {
    logger.debug(`${this.logPrefix}setApplicationMuteState`, mute);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `setApplicationMuteState`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.setApplicationMuteState(mute);
      });
    } else {
      this.nodeDeviceManager.setApplicationMuteState(mute);
    }
  }
  getApplicationMuteState(): Promise<boolean> | boolean {
    logger.debug(`${this.logPrefix}getApplicationMuteState`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `setApplicationMuteState`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.getApplicationMuteState();
      });
    } else {
      return this.nodeDeviceManager.getApplicationMuteState();
    }
  }
  /**
   * 监听事件
   *
   * @param event {String} - 事件名称
   * @param func {Function} - 事件回调函数
   */
  on(event: string, func: (...args: any[]) => void): void {
      let _a;
      (_a = this.eventEmitter) === null || _a === void 0 ? void 0 : _a.on(event, func);
  }
  /**
   * 取消事件监听
   *
   * @param event {String} - 事件名
   * @param func {Function} - 事件回调函数
   */
  off(event: string, func: (...args: any[]) => void): void {
    let _a;
    (_a = this.eventEmitter) === null || _a === void 0
      ? void 0
      : _a.on(event, func);
  }
  private addPromise;
  // private removePromise;
  private eventHandler;
  // private onDeviceChange;
  // private onSetCurrentDeviceFinished;
  // private onGetCurrentDeviceFinished;
  // private onSetCurrentDeviceVolumeFinished;
  // private onGetCurrentDeviceVolumeFinished;
  // private onSetCurrentDeviceMuteFinished;
  // private onGetCurrentDeviceMuteFinished;
  // private onEnableFollowingDefaultAudioDeviceFinished;
  // private onStartCameraDeviceTestFinished;
  // private onStopCameraDeviceTestFinished;
  // private onStartMicDeviceTestFinished;
  // private onStopMicDeviceTestFinished;
  // private onStartSpeakerDeviceTestFinished;
  // private onStopSpeakerDeviceTestFinished;
  // private onSetApplicationPlayVolumeFinished;
  // private onGetApplicationPlayVolumeFinished;
  // private onSetApplicationMuteStateFinished;
  // private onGetApplicationMuteStateFinished;
}
export default TRTCDeviceManager;
