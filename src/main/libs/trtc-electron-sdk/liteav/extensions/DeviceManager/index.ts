import { EventEmitter } from 'events';
import {TRTCDeviceInfo, TRTCDeviceState, TRTCDeviceType } from '../../trtc_define';
import logger from '../../logger';

const NodeTRTCEngine = require('./trtc_electron_sdk.node');

/**
 * 设备管理器
 */
export class TRTCDeviceManager {
  private logPrefix = '[TRTCDeviceManager]';
  private isIPCMode: boolean = false;
  private nodeDeviceManager: typeof NodeTRTCEngine.NodeRemoteDeviceManager | typeof NodeTRTCEngine.TRTCCloud;
  private promiseStore: Map<string, Array<any>> | undefined;
  private eventEmitter: EventEmitter | undefined;

  constructor(options: {
    isIPCMode: boolean;
    nodeTRTCCloud: typeof NodeTRTCEngine.TRTCCloud | typeof NodeTRTCEngine.RemoteTRTCCloud;
  }) {
    this.promiseStore = new Map();
    this.eventEmitter = new EventEmitter();
    this.eventHandler = this.eventHandler.bind(this);

    this.isIPCMode = options.isIPCMode;
    //if (this.isIPCMode) {
      //this.nodeDeviceManager = new NodeTRTCEngine.NodeRemoteDeviceManager();
      //this.nodeDeviceManager.setRemoteDeviceManagerCallback(this.eventHandler);
    //} else {
      this.nodeDeviceManager = options.nodeTRTCCloud;
    //}
  }

  destroy():void {
    this.nodeDeviceManager = null;
    this.promiseStore?.forEach((value: Array<any>) => {
      value.forEach(({reject}) => {
        reject();
      })
    });
    this.promiseStore?.clear();
    this.promiseStore = undefined;
    this.eventEmitter = undefined;
  }

  /**
   * 获取设备列表
   * 
   * @param type {TRTCDeviceType} - 设备类型
   * @returns {Array<TRTCDeviceInfo>}
   */
  public getDevicesList(type: TRTCDeviceType): Array<TRTCDeviceInfo> {
    logger.debug(`${this.logPrefix}getDevicesList`, type);
    const deviceInfos =  this.nodeDeviceManager.getDevicesList(type);
    // if (type === TRTCDeviceType.TRTCDeviceTypeCamera) {
    //   deviceInfos?.forEach((item: Record<string, any>) => {
    //     try {
    //         if(item.deviceProperties) {
    //             const properties = JSON.parse(item.deviceProperties as string);
    //             item.deviceProperties = properties;
    //         } else {
    //             // 虚拟摄像头可能没有 deviceProperties 字段
    //             item.deviceProperties = {};
    //         }
    //     } catch(e) {
    //         logger.warn(`${this.logPrefix}camera device properties parse error.`, JSON.stringify(item));
    //         item.deviceProperties = {};
    //     }
    //   });
    // }
    return deviceInfos;
  }

  public setCurrentDevice(type: TRTCDeviceType, deviceId: string):Promise<void>|void {
    logger.debug(`${this.logPrefix}setCurrentDevice`, type, deviceId);
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

  public getCurrentDevice(type: TRTCDeviceType): Promise<TRTCDeviceInfo>|TRTCDeviceInfo {
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

  public setCurrentDeviceVolume(type: TRTCDeviceType, volume: number): Promise<void>|void {
    logger.debug(`${this.logPrefix}setCurrentDeviceVolume`, type, volume);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `setCurrentDeviceVolume-${type}`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.setCurrentDeviceVolume(type, volume);
      });
    } else {
      this.nodeDeviceManager.setCurrentDeviceVolume(type, volume);
    }
  }

  public getCurrentDeviceVolume(type: TRTCDeviceType): Promise<number> | number {
    logger.debug(`${this.logPrefix}getCurrentDeviceVolume`, type);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `getCurrentDeviceVolume-${type}`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.getCurrentDeviceVolume(type);
      });
    } else {
      return this.nodeDeviceManager.getCurrentDeviceVolume(type);
    }
  }

  public setCurrentDeviceMute(type: TRTCDeviceType, mute: boolean): Promise<void>|void {
    logger.debug(`${this.logPrefix}setCurrentDeviceMute`, type, mute);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `setCurrentDeviceMute-${type}`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.setCurrentDeviceMute(type, mute);
      });
    } else {
      this.nodeDeviceManager.setCurrentDeviceMute(type, mute);
    }
  }

  public getCurrentDeviceMute(type: TRTCDeviceType): Promise<boolean>|boolean {
    logger.debug(`${this.logPrefix}getCurrentDeviceMute`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `getCurrentDeviceMute-${type}`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.getCurrentDeviceMute(type);
      });
    } else {
      return this.nodeDeviceManager.getCurrentDeviceMute(type);
    }
  }

  public enableFollowingDefaultAudioDevice(type: TRTCDeviceType, enable: boolean): Promise<void>|void {
    logger.debug(`${this.logPrefix}enableFollowingDefaultAudioDevice`, type, enable);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `enableFollowingDefaultAudioDevice-${type}`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.enableFollowingDefaultAudioDevice(type, enable);
      });
    } else {
      this.nodeDeviceManager.enableFollowingDefaultAudioDevice(type, enable);
    }
  }

  public startMicDeviceTest(interval: number, playback = false): Promise<void>|void {
    logger.debug(`${this.logPrefix}startMicDeviceTest`, interval, playback);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `startMicDeviceTest`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.startMicDeviceTest(interval, playback);
      });
    } else {
      this.nodeDeviceManager.startMicDeviceTest(interval, playback);
    }
  }

  public stopMicDeviceTest(): Promise<void>|void {
    logger.debug(`${this.logPrefix}stopMicDeviceTest`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `stopMicDeviceTest`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.stopMicDeviceTest();
      });
    } else {
      this.nodeDeviceManager.stopMicDeviceTest();
    }
  }

  public startSpeakerDeviceTest(filePath: string): Promise<void>|void {
    logger.debug(`${this.logPrefix}startSpeakerDeviceTest`, filePath);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `startSpeakerDeviceTest`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.startSpeakerDeviceTest(filePath);
      });
    } else {
      this.nodeDeviceManager.startSpeakerDeviceTest(filePath);
    }
  }

  public stopSpeakerDeviceTest(): Promise<void>|void {
    logger.debug(`${this.logPrefix}stopSpeakerDeviceTest`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `stopSpeakerDeviceTest`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.stopSpeakerDeviceTest();
      });
    } else {
      this.nodeDeviceManager.stopSpeakerDeviceTest();
    }
  }

  public setApplicationPlayVolume(volume: number): Promise<void>|void {
    logger.debug(`${this.logPrefix}setApplicationPlayVolume`, volume);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `setApplicationPlayVolume`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.setApplicationPlayVolume(volume);
      });
    } else {
      this.nodeDeviceManager.setApplicationPlayVolume(volume);
    }
  }

  public getApplicationPlayVolume(): Promise<number>|number {
    logger.debug(`${this.logPrefix}getApplicationPlayVolume`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `getApplicationPlayVolume`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.getApplicationPlayVolume();
      });
    } else {
      return this.nodeDeviceManager.getApplicationPlayVolume();
    }
  }

  public setApplicationMuteState(mute: boolean): Promise<void>|void {
    logger.debug(`${this.logPrefix}setApplicationMuteState`, mute);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `setApplicationMuteState`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.setApplicationMuteState(mute);
      });
    } else {
      this.nodeDeviceManager.setApplicationMuteState(mute);
    }
  }

  public getApplicationMuteState(): Promise<boolean>|boolean {
    logger.debug(`${this.logPrefix}getApplicationMuteState`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) =>{
        const key = `setApplicationMuteState`;
        this.addPromise(key, resolve, reject);
        this.nodeDeviceManager.getApplicationMuteState();
      });
    } else {
      return this.nodeDeviceManager.getApplicationMuteState();
    }
  }

  // public setCameraCaptureParam(params: TRTCCameraCaptureParams): Promise<void>|void {
  //   logger.debug(`${this.logPrefix}setCameraCaptureParam:`, params);
  //   if (this.isIPCMode) {
  //     return this.nodeDeviceManager.setCameraCapturerParam(params);
  //   } else {
  //     this.nodeDeviceManager.setCameraCaptureParam(params);
  //   }
  // }

  /**
   * 监听事件
   *
   * @param event {String} - 事件名称
   * @param func {Function} - 事件回调函数
   */
  on(event: string, func: (...args: any[]) => void): void {
    this.eventEmitter?.on(event, func);
  }

  /**
   * 取消事件监听
   *
   * @param event {String} - 事件名
   * @param func {Function} - 事件回调函数
   */
  off(event: string, func: (...args: any[]) => void):void {
    this.eventEmitter?.off(event, func);
  }

  private addPromise(
    key: string, 
    resolve: (data: any) => void, 
    reject: (data: any) => void
  ): void {
    if (!this.promiseStore?.has(key)) {
      this.promiseStore?.set(key, []);
    }
    const storedPromises = this.promiseStore?.get(key);
    storedPromises?.push({
      resolve,
      reject
    });
  }

  private removePromise(key: string, value: any): void {
    const storedPromises = this.promiseStore?.get(key);
    if (storedPromises) {
      storedPromises.forEach(({resolve, reject}) => {
        resolve(value);
      });
      this.promiseStore?.delete(key);
    }
  }

  private eventHandler(args: Array<string | { [key: string]: never }>): void {
    logger.debug('TRTCDeviceManager event:', args);
    const key = args[0] as string;
    const data = args[1] as { [key: string]: any };
    switch (key) {
      case "onDeviceChanged":
        this.onDeviceChange(data.deviceId, data.type, data.state);
        break;
      case "onSetCurrentDeviceFinished":
        this.onSetCurrentDeviceFinished(data.type, data.result);
        break;
      case "onGetCurrentDeviceFinished":
        this.onGetCurrentDeviceFinished(data.type, {
          deviceId: data.deviceId as string,
          deviceName: data.deviceName as string,
          deviceProperties: {}
        });
        break;
      case "onSetCurrentDeviceVolumeFinished":
        this.onSetCurrentDeviceVolumeFinished(data.type, data.result);
        break;
      case "onGetCurrentDeviceVolumeFinished":
        this.onGetCurrentDeviceVolumeFinished(data.type, data.volume);
        break;
      case "onSetCurrentDeviceMuteFinished":
        this.onSetCurrentDeviceMuteFinished(data.type, data.result);
        break;
      case "onGetCurrentDeviceMuteFinished":
        this.onGetCurrentDeviceMuteFinished(data.type, data.muted);
        break;
      case "onEnableFollowingDefaultAudioDeviceFinished":
        this.onEnableFollowingDefaultAudioDeviceFinished(data.type, data.result);
        break;
      case "onStartCameraDeviceTestFinished":
        this.onStartCameraDeviceTestFinished(data.result);
        break;
      case "onStopCameraDeviceTestFinished":
        this.onStopCameraDeviceTestFinished(data.result);
        break;
      case "onStartMicDeviceTestFinished":
        this.onStartMicDeviceTestFinished(data.result);
        break;
      case "onStopMicDeviceTestFinished":
        this.onStopMicDeviceTestFinished(data.result);
        break;
      case "onStartSpeakerDeviceTestFinished":
        this.onStartSpeakerDeviceTestFinished(data.result);
        break;
      case "onStopSpeakerDeviceTestFinished":
        this.onStopSpeakerDeviceTestFinished(data.result);
        break;
      case "onSetApplicationPlayVolumeFinished":
        this.onSetApplicationPlayVolumeFinished(data.result);
        break;
      case "onGetApplicationPlayVolumeFinished":
        this.onGetApplicationPlayVolumeFinished(data.volume);
        break;
      case "onSetApplicationMuteStateFinished":
        this.onSetApplicationMuteStateFinished(data.result);
        break;
      case "onGetApplicationMuteStateFinished":
        this.onGetApplicationMuteStateFinished(data.muted);
        break;
      default:
        logger.warn("TRTCDeviceManager unsupported event type:", key);
        break;
    }
  }

  private onDeviceChange(deviceId: string, type: TRTCDeviceType, state: TRTCDeviceState): void {
    logger.debug(`${this.logPrefix}onDeviceChange`, deviceId, type, state);
    this.eventEmitter?.emit('onDeviceChange', deviceId, type, state);
  }

  private onSetCurrentDeviceFinished(type: TRTCDeviceType, result: number): void {
    const key = `setCurrentDevice-${type}`;
    this.removePromise(key, result);
  }

  private onGetCurrentDeviceFinished(type: TRTCDeviceType, deviceInfo: TRTCDeviceInfo): void {
    const key = `getCurrentDevice-${type}`;
    this.removePromise(key, deviceInfo);
  }

  private onSetCurrentDeviceVolumeFinished(type: TRTCDeviceType, result: number): void {
    const key = `setCurrentDeviceVolume-${type}`;
    this.removePromise(key, result);
  }

  private onGetCurrentDeviceVolumeFinished(type: TRTCDeviceType, volume: number): void {
    const key = `getCurrentDeviceVolume-${type}`;
    this.removePromise(key, volume);
  }

  private onSetCurrentDeviceMuteFinished(type: TRTCDeviceType, result: number): void {
    const key = `setCurrentDeviceMute-${type}`;
    this.removePromise(key, result);
  }

  private onGetCurrentDeviceMuteFinished(type: TRTCDeviceType, muted: number): void {
    const key = `getCurrentDeviceMute-${type}`;
    this.removePromise(key, muted);
  }

  private onEnableFollowingDefaultAudioDeviceFinished(type: TRTCDeviceType, result: number):void {
    const key = `enableFollowingDefaultAudioDevice-${type}`;
    this.removePromise(key, result);
  }

  private onStartCameraDeviceTestFinished(result:number): void {
    const key = `startCameraDeviceTest`;
    this.removePromise(key, result);
  }

  private onStopCameraDeviceTestFinished(result:number): void {
    const key = `stopCameraDeviceTest`;
    this.removePromise(key, result);
  }

  private onStartMicDeviceTestFinished(result: number): void {
    const key = `startMicDeviceTest`;
    this.removePromise(key, result);
  }

  private onStopMicDeviceTestFinished(result: number): void {
    const key = `stopMicDeviceTest`;
    this.removePromise(key, result);
  }

  private onStartSpeakerDeviceTestFinished(result: number): void {
    const key = `startSpeakerDeviceTest`;
    this.removePromise(key, result);
  }

  private onStopSpeakerDeviceTestFinished(result: number): void {
    const key = `stopSpeakerDeviceTest`;
    this.removePromise(key, result);
  }

  private onSetApplicationPlayVolumeFinished(result: number): void {
    const key = `setApplicationPlayVolume`;
    this.removePromise(key, result);
  }

  private onGetApplicationPlayVolumeFinished(volume: number): void {
    const key = `getApplicationPlayVolume`;
    this.removePromise(key, volume);
  }

  private onSetApplicationMuteStateFinished(result: number): void {
    const key = `setApplicationMuteState`;
    this.removePromise(key, result);
  }

  private onGetApplicationMuteStateFinished(muted: boolean): void {
    const key = `getApplicationMuteState`;
    this.removePromise(key, muted);
  }

  // ******   这一部分接口暴露不合理，暂时通过 TRTCMediaMixingManager 暴露给用户   **************/
  // public startCameraDeviceTest(windowID: number | Uint8Array, rect?: Rect): Promise<number> {
  //   logger.debug(`${this.logPrefix}startCameraDeviceTest`, windowID, rect);
  //   let newWindowID = 0;
  //   if (windowID instanceof Uint8Array) {
  //     for (let i = windowID.length - 1; i >= 0; i--) {
  //       newWindowID = (newWindowID * 256) + windowID[i];
  //     }
  //   } else {
  //     newWindowID = windowID;
  //   }
  //   return new Promise((resolve, reject) =>{
  //     const key = `startCameraDeviceTest`;
  //     this.addPromise(key, resolve, reject);
  //     this.nodeDeviceManager.startCameraDeviceTest(newWindowID, rect);
  //   });
  // }

  // public stopCameraDeviceTest(): Promise<number> {
  //   logger.debug(`${this.logPrefix}stopCameraDeviceTest`);
  //   return new Promise((resolve, reject) =>{
  //     const key = `stopCameraDeviceTest`;
  //     this.addPromise(key, resolve, reject);
  //     this.nodeDeviceManager.stopCameraDeviceTest();
  //   });
  // }

  // public setCameraTestRenderMirror(mirror: boolean): void {
  //   logger.debug(`${this.logPrefix}setCameraTestRenderMirror`, mirror);
  //   this.nodeDeviceManager.setCameraTestRenderMirror(mirror);
  // }

  // public setCameraTestDeviceId(cameraId: string): void {
  //   logger.debug(`${this.logPrefix}setCameraTestDeviceId`, cameraId);
  //   this.nodeDeviceManager.setCameraTestDeviceId(cameraId);
  // }

  // public setCameraTestResolution(width: number, height: number): void {
  //   logger.debug(`${this.logPrefix}setCameraTestResolution`, width, height);
  //   this.nodeDeviceManager.setCameraTestResolution(width, height);
  // }

  // public setCameraTestVideoPluginPath(path: string): void {
  //   logger.debug(`${this.logPrefix}setCameraTestVideoPluginPath`, path);
  //   this.nodeDeviceManager.setCameraTestVideoPluginPath(path);
  // }

  // public setCameraTestVideoPluginParameter(params: string): void {
  //   logger.debug(`${this.logPrefix}setCameraTestVideoPluginParameter`, params);
  //   this.nodeDeviceManager.setCameraTestVideoPluginParameter(params);
  // }
  // ******   这一部分接口暴露不合理，暂时通过 TRTCMediaMixingManager 暴露给用户   **************/
}

export default TRTCDeviceManager;
