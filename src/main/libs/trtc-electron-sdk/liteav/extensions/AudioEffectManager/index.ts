import { TRTCVoiceReverbType, TRTCVoiceChangerType, TRTCAudioMusicParam, TRTCMusicPlayObserver, TRTCMusicPreloadObserver } from '../../trtc_define';
import logger from '../../logger';

const NodeTRTCEngine = require('./trtc_electron_sdk.node');

/**
 * 音效管理器
 */
export class TRTCAudioEffectManager {
  private logPrefix = "[TRTCAudioEffectManager]";
  private isIPCMode: boolean;
  private nodeAudioEffectManager: typeof NodeTRTCEngine.NodeRemoteAudioEffectManager | typeof NodeTRTCEngine.TRTCCloud;
  private promiseStore: Map<string, Array<any>> | undefined;

  constructor(options: {
    isIPCMode: boolean;
    nodeTRTCCloud: typeof NodeTRTCEngine.TRTCCloud | typeof NodeTRTCEngine.RemoteTRTCCloud;
  }) {
    this.promiseStore = new Map();
    this.eventHandler = this.eventHandler.bind(this);

    this.isIPCMode = options.isIPCMode;
    if (this.isIPCMode) {
      this.nodeAudioEffectManager = new NodeTRTCEngine.NodeRemoteAudioEffectManager();
      this.nodeAudioEffectManager.setRemoteAudioEffectManagerCallback(this.eventHandler);
    } else {
      this.nodeAudioEffectManager = options.nodeTRTCCloud;
    }
  }

  destroy():void {
    this.nodeAudioEffectManager = null;
    this.promiseStore?.forEach((value: Array<any>) => {
      value.forEach(({reject}) => {
        reject();
      })
    });
    this.promiseStore?.clear();
    this.promiseStore = undefined;
  }

  /////////////////////////////////////////////////////////////////////////////////
  //
  //                    人声相关的特效接口
  //
  /////////////////////////////////////////////////////////////////////////////////

  /**
   * 开启耳返
   *
   * 主播开启耳返后，可以在耳机里听到麦克风采集到的自己发出的声音，该特效适用于主播唱歌的应用场景中。
   * 需要您注意的是，由于蓝牙耳机的硬件延迟非常高，所以在主播佩戴蓝牙耳机时无法开启此特效，请尽量在用户界面上提示主播佩戴有线耳机。
   * 同时也需要注意，并非所有的手机开启此特效后都能达到优秀的耳返效果，我们已经对部分耳返效果不佳的手机屏蔽了该特效。
   * 
   * 注意：仅在主播佩戴耳机时才能开启此特效，同时请您提示主播佩戴有线耳机。
   * 
   * @param {Boolean} enable - true：开启；false：关闭。
   * @returns {Promise<void>}
   */
  public enableVoiceEarMonitor(enable: boolean): Promise<void> {
    logger.debug(`${this.logPrefix}enableVoiceEarMonitor:${enable}`);
    this.nodeAudioEffectManager.enableVoiceEarMonitor(enable);
    return Promise.resolve();
  }

  /**
   * 设置耳返音量
   *
   * 通过该接口您可以设置耳返特效中声音的音量大小。
   * 注意：如果将 volume 设置成 100 之后感觉音量还是太小，可以将 volume 最大设置成 150，但超过 100 的 volume 会有爆音的风险，请谨慎操作。
   * 
   * @param {Number} volume - 音量大小，取值范围为 0 - 100，默认值：100。
   * @returns {Promise<void>}
   */
  public setVoiceEarMonitorVolume(volume: number): Promise<void> {
    logger.debug(`${this.logPrefix}setVoiceEarMonitorVolume:${volume}`);
    this.nodeAudioEffectManager.setVoiceEarMonitorVolume(volume);
    return Promise.resolve();
  }

  /**
   * 设置人声的混响效果
   *
   * 通过该接口您可以设置人声的混响效果，具体特效请参见枚举定义 {@link TRTCVoiceReverbType}。
   * 注意：设置的效果在退出房间后会自动失效，如果下次进房还需要对应特效，需要调用此接口再次进行设置。
   * 
   * @param {TRTCVoiceReverbType} type - 混响类型
   * @returns {Promise<void>}
   */
  public setVoiceReverbType(type: TRTCVoiceReverbType): Promise<void> {
    logger.debug(`${this.logPrefix}setVoiceReverbType: ${type}`);
    this.nodeAudioEffectManager.setVoiceReverbType(type);
    return Promise.resolve();
  }

  /**
   * 设置人声的变声特效
   *
   * 通过该接口您可以设置人声的变声特效，具体特效请参见枚举定义 {@link TRTCVoiceChangerType}。
   * 注意：设置的效果在退出房间后会自动失效，如果下次进房还需要对应特效，需要调用此接口再次进行设置。
   * 
   * @param {TRTCVoiceChangerType} type - 变声类型
   * @returns {Promise<void>}
   */
  public setVoiceChangerType(type: TRTCVoiceChangerType): Promise<void> {
    logger.debug(`${this.logPrefix}setVoiceChangerType: ${type}`);
    this.nodeAudioEffectManager.setVoiceChangerType(type);
    return Promise.resolve();
  }

  /**
   * 设置语音音量
   *
   * 该接口可以设置语音音量的大小，一般配合音乐音量的设置接口 {@link setAllMusicVolume} 协同使用，用于调谐语音和音乐在混音前各自的音量占比。
   * 注意：如果将 volume 设置成 100 之后感觉音量还是太小，可以将 volume 最大设置成 150，但超过 100 的 volume 会有爆音的风险，请谨慎操作。
   * 
   * @param {Number} volume - 音量大小，取值范围为0 - 100，默认值：100。
   * @returns {Promise<void>}
   */
  public setVoiceCaptureVolume(volume: number): Promise<void> {
    logger.debug(`${this.logPrefix}setVoiceCaptureVolume: ${volume}`);
    this.nodeAudioEffectManager.setVoiceCaptureVolume(volume);
    return Promise.resolve();
  }

  /**
   * 设置语音音调
   *
   * 该接口可以设置语音音调，用于实现变调不变速的目的。
   * @param {Number} pitch - 音调，取值范围为-1.0f~1.0f，默认值：0.0f。
   * @returns {Promise<void>}
   */
  public setVoicePitch(pitch: number): Promise<void> {
    logger.debug(`${this.logPrefix}setVoicePitch: ${pitch}`);
    this.nodeAudioEffectManager.setVoicePitch(pitch);
    return Promise.resolve();
  }

  /////////////////////////////////////////////////////////////////////////////////
  //
  //                    背景音乐的相关接口
  //
  /////////////////////////////////////////////////////////////////////////////////

  /**
   * 设置背景音乐的事件回调监听
   * 
   * 请在播放背景音乐之前使用该接口设置播放事件回调，以便感知背景音乐的播放进度。
   * 
   * @param {TRTCMusicPlayObserver} observer - 背景音乐播放事件回调
   * @returns {Promise<void>}
   */
  public setMusicObserver(observer: TRTCMusicPlayObserver): Promise<void> {
    logger.debug(`${this.logPrefix}setMusicObserver:`, observer);
    this.nodeAudioEffectManager.setMusicObserver(observer.onStart, observer.onPlayProgress, observer.onComplete);
    return Promise.resolve();
  }

  /**
   * 开始播放背景音乐
   *
   * @param {TRTCAudioMusicParam} musicParam - 背景音乐参数
   * @returns {Promise<void>}
   */
  public startPlayMusic(param: TRTCAudioMusicParam): Promise<void> {
    logger.debug(`${this.logPrefix}startPlayMusic:`, param);
    this.nodeAudioEffectManager.startPlayMusic(param);
    return Promise.resolve();
  }

  /**
   * 停止播放背景音乐
   *
   * @param {Number} id - 音乐 ID
   * @returns {Promise<void>}
   */
  public stopPlayMusic(id: number): Promise<void> {
    logger.debug(`${this.logPrefix}stopPlayMusic:${id}`);
    this.nodeAudioEffectManager.stopPlayMusic(id);
    return Promise.resolve();
  }

  /**
   * 暂停播放背景音乐
   *
   * @param {Number} id 音乐 ID
   * @returns {Promise<void>}
   */
  public pausePlayMusic(id: number): Promise<void> {
    logger.debug(`${this.logPrefix}pausePlayMusic:${id}`);
    this.nodeAudioEffectManager.pausePlayMusic(id);
    return Promise.resolve();
  }

  /**
   * 恢复播放背景音乐
   *
   * @param {Number} id 音乐 ID
   * @returns {Promise<void>}
   */
  public resumePlayMusic(id: number): Promise<void> {
    logger.debug(`${this.logPrefix}resumePlayMusic:${id}`);
    this.nodeAudioEffectManager.resumePlayMusic(id);
    return Promise.resolve();
  }

  /**
   * 设置所有背景音乐的本地音量和远端音量的大小
   *
   * 该接口可以设置所有背景音乐的本地音量和远端音量。
   *  - 本地音量：即主播本地可以听到的背景音乐的音量大小。
   *  - 远端音量：即观众端可以听到的背景音乐的音量大小。
   *
   * 注意：如果将 volume 设置成 100 之后感觉音量还是太小，可以将 volume 最大设置成 150，但超过 100 的 volume 会有爆音的风险，请谨慎操作。
   *
   * @param {Number} volume - 音量大小，100为正常音量，取值范围为0 - 200。
   * @returns {Promise<void>}
   */
  public setAllMusicVolume(volume: number): Promise<void> {
    logger.debug(`${this.logPrefix}setAllMusicVolume:${volume}`);
    this.nodeAudioEffectManager.setAllMusicVolume(volume);
    return Promise.resolve();
  }

  /**
   * 设置背景音乐远端播放音量的大小
   *
   * 播放背景音乐混音时使用，用来控制背景音乐在远端播放时的音量大小。
   *
   * @param {Number} id - 音乐 ID
   * @param {Number} volume - 音量大小，100为正常音量，取值范围为0 - 100；默认值：100
   * @returns {Promise<void>}
   */
  public setMusicPublishVolume(id: number, volume: number): Promise<void> {
    logger.debug(`${this.logPrefix}setMusicPublishVolume:${id} ${volume}`);
    this.nodeAudioEffectManager.setMusicPublishVolume(id, volume);
    return Promise.resolve();
  }

  /**
   * 设置背景音乐本地播放音量的大小
   *
   * 播放背景音乐混音时使用，用来控制背景音乐在本地播放时的音量大小。
   *
   * @param {Number} id - 音乐 ID
   * @param {Number} volume - 音量大小，100为正常音量，取值范围为0 - 100；默认值：100
   * @returns {Promise<void>}
   */
  public setMusicPlayoutVolume(id: number, volume: number): Promise<void> {
    logger.debug(`${this.logPrefix}setMusicPlayoutVolume:${id} ${volume}`);
    this.nodeAudioEffectManager.setMusicPlayoutVolume(id, volume);
    return Promise.resolve();
  }

  /**
   * 调整背景音乐的音调高低
   *
   * @param {Number} id - 音乐 ID。
   * @param {Number} pitch - 音调，默认值是0.0f，范围是：[-1 ~ 1] 之间的浮点数。
   * @returns {Promise<void>}
   */
  public setMusicPitch(id: number, pitch: number): Promise<void> {
    logger.debug(`${this.logPrefix}setMusicPitch:${id} ${pitch}`);
    this.nodeAudioEffectManager.setMusicPitch(id, pitch);
    return Promise.resolve();
  }

  /**
   * 调整背景音乐的变速效果
   *
   * @param {Number} id  -  音乐 ID。
   * @param {Number} speedRate - 速度，默认值是1.0f，范围是：[0.5 ~ 2] 之间的浮点数。
   * @returns {Promise<void>}
   */
  public setMusicSpeedRate(id: number, speedRate: number): Promise<void> {
    logger.debug(`${this.logPrefix}setMusicSpeedRate:${id} ${speedRate}`);
    this.nodeAudioEffectManager.setMusicSpeedRate(id, speedRate);
    return Promise.resolve();
  }

  /**
   * 获取背景音乐的播放进度（单位：毫秒）
   *
   * @param {Number} id - 音乐 ID。
   * @return {Promise<Number>|Number} 成功返回当前播放时间，单位：毫秒，失败返回 -1。
   */
  public getMusicCurrentPosInMS(id: number): Promise<number>|number {
    logger.debug(`${this.logPrefix}getMusicCurrentPosInMS: ${id}`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `onGetMusicCurrentPosInMS-${id}`;
        this.addPromise(key, resolve, reject);
        this.nodeAudioEffectManager.getMusicCurrentPosInMS(id);
      });
    } else {
      return this.nodeAudioEffectManager.getMusicCurrentPosInMS(id);
    }
  }

  /**
   * 获取背景音乐的总时长（单位：毫秒）
   *
   * @param {String} path - 音乐文件路径。
   * @return {Promise<number>|Number} 成功返回时长，失败返回 -1。
   */
  public getMusicDurationInMS(path: string): Promise<number>|number {
    logger.debug(`${this.logPrefix}getMusicDurationInMS: ${path}`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `onGetMusicDurationInMS-${path}`;
        this.addPromise(key, resolve, reject);
        this.nodeAudioEffectManager.getMusicDurationInMS(path);
      });
    } else {
      return this.nodeAudioEffectManager.getMusicDurationInMS(path);
    }
  }

  /**
   * 设置背景音乐的播放进度（单位：毫秒）
   *
   * 注意：请尽量避免过度频繁地调用该接口，因为该接口可能会再次读写音乐文件，耗时稍高。
   *  因此，当用户拖拽音乐的播放进度条时，请在用户完成拖拽操作后再调用本接口。
   *  因为 UI 上的进度条控件往往会以很高的频率反馈用户的拖拽进度，如不做频率限制，会导致较差的用户体验。
   * @param {Number} id - 音乐 ID
   * @param {Number} pts - 单位: 毫秒
   * @returns {Promise<void>}
   */
  public seekMusicToPosInTime(id: number, pts: number): Promise<void> {
    logger.debug(`${this.logPrefix}seekMusicToPosInTime:${id} ${pts}`);
    this.nodeAudioEffectManager.seekMusicToPosInTime(id, pts);
    return Promise.resolve();
  }

  /**
   * 调整搓碟的变速效果
   *
   * @param {Number} id - 音乐 ID。
   * @param {Number} scratchSpeedRate - 搓碟速度，默认值是1.0f，范围是：[-12.0 ~ 12.0] 之间的浮点数, 速度值正/负表示方向正/反，绝对值大小表示速度快慢。
   * 注意：前置条件 preloadMusic 成功。
   * @returns {Promise<void>}
   */
  public setMusicScratchSpeedRate(id: number, speedRate: number): Promise<void> {
    logger.debug(`${this.logPrefix}seekMusicToPosInTime:${id} ${speedRate}`);
    this.nodeAudioEffectManager.setMusicScratchSpeedRate(id, speedRate);
    return Promise.resolve();
  }

  /**
   * 设置预加载事件回调
   *
   * 请在预加载背景音乐之前使用该接口设置回调，以便感知背景音乐的预加载进度。
   * @param {TRTCMusicPreloadObserver} observer - 音乐加载监听
   * @returns {Promise<void>}
   */
  public setPreloadObserver(observer: TRTCMusicPreloadObserver): Promise<void> {
    logger.debug(`${this.logPrefix}setPreloadObserver:`, observer);
    this.nodeAudioEffectManager.setPreloadObserver(observer.onLoadProgress, observer.onLoadError);
    return Promise.resolve();
  }

  /**
   * 预加载背景音乐
   *
   * 每个音乐都需要您指定具体的 ID，您可以通过该 ID 对音乐的开始、停止、音量等进行设置。
   * 注意：
   * 1. 预先加载最多同时支持2个不同 ID 的预加载，且预加载时长不超过10分钟，使用完需 stopPlayMusic，否则内存不释放。
   * 2. 若该ID对应的音乐正在播放中，预加载会失败，需先调用 stopPlayMusic。
   * 3. 当 musicParam 和传入 startPlayMusic 的 musicParam 完全相同时，预加载有效。
   * 
   * @param {TRTCAudioMusicParam} preloadParam - 预加载音乐参数。
   * @returns {Promise<void>}
   */
  public preloadMusic(param: TRTCAudioMusicParam): Promise<void> {
    logger.debug(`${this.logPrefix}preloadMusic:`, param);
    this.nodeAudioEffectManager.preloadMusic(param);
    return Promise.resolve();
  }

  /**
   * 获取背景音乐的音轨数量
   *
   * @param {Number} id - 音乐 ID。
   * @returns {Promise<Number>|Number}
   */
  public getMusicTrackCount(id: number): Promise<number>|number {
    logger.debug(`${this.logPrefix}getMusicTrackCount: ${id}`);
    if (this.isIPCMode) {
      return new Promise((resolve, reject) => {
        const key = `onGetMusicTrackCount-${id}`;
        this.addPromise(key, resolve, reject);
        this.nodeAudioEffectManager.getMusicTrackCount(id);
      });
    } else {
      return this.nodeAudioEffectManager.getMusicTrackCount(id);
    }
  }

  /**
   * 指定背景音乐的播放音轨
   *
   * 注意：音轨总数量可通过 getMusicTrackCount 接口获取。
   * 
   * @param {Number} id - 音乐 ID。
   * @param {Number} index - 默认播放第一个音轨。取值范围[0, 音轨总数)。
   * @returns {Promise<void>}
   */
  public setMusicTrack(id: number, trackIndex: number): Promise<void> {
    logger.debug(`${this.logPrefix}getMusicTrackCount:${id} ${trackIndex}`);
    this.nodeAudioEffectManager.setMusicTrack(id, trackIndex);
    return Promise.resolve();
  }

  private eventHandler(args: Array<string | { [key: string]: never }>): void {
    logger.debug(`${this.logPrefix} event:`, args);
    const key = args[0] as string;
    const data = args[1] as { [key: string]: any };
    logger.debug(`${this.logPrefix} event key: ${key} data:`, data);

    switch (key) {
      case "onGetMusicCurrentPosInMS":
        this.removePromise(`${key}-${data.id}`, data.currentPos);
        break;
      case 'onGetMusicDurationInMS':
        this.removePromise(`${key}-${data.path}`, data.durationInMS);
        break;
      case 'onGetMusicTrackCount':
        this.removePromise(`${key}-${data.id}`, data.trackCount);
        break;
      default:
        logger.warn(`${this.logPrefix}eventHandler un-supported event:`, key);
    }
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
      storedPromises.forEach(({ resolve, reject }) => {
        resolve(value);
      });
      this.promiseStore?.delete(key);
    }
  }
}

export default TRTCAudioEffectManager;
