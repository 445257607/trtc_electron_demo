"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const events = require("events");
const icon = path.join(__dirname, "../../resources/icon.png");
var TRTCLogLevel = /* @__PURE__ */ ((TRTCLogLevel2) => {
  TRTCLogLevel2[TRTCLogLevel2["TRTCLogLevelVerbose"] = 0] = "TRTCLogLevelVerbose";
  TRTCLogLevel2[TRTCLogLevel2["TRTCLogLevelDebug"] = 1] = "TRTCLogLevelDebug";
  TRTCLogLevel2[TRTCLogLevel2["TRTCLogLevelInfo"] = 2] = "TRTCLogLevelInfo";
  TRTCLogLevel2[TRTCLogLevel2["TRTCLogLevelWarn"] = 3] = "TRTCLogLevelWarn";
  TRTCLogLevel2[TRTCLogLevel2["TRTCLogLevelError"] = 4] = "TRTCLogLevelError";
  TRTCLogLevel2[TRTCLogLevel2["TRTCLogLevelFatal"] = 5] = "TRTCLogLevelFatal";
  TRTCLogLevel2[TRTCLogLevel2["TRTCLogLevelNone"] = 6] = "TRTCLogLevelNone";
  return TRTCLogLevel2;
})(TRTCLogLevel || {});
class TRTCParams {
  sdkAppId;
  userId;
  userSig;
  roomId;
  strRoomId;
  role;
  privateMapKey;
  businessInfo;
  streamId;
  userDefineRecordId;
  constructor(sdkAppId, userId, userSig, roomId, strRoomId, role, privateMapKey, businessInfo, streamId, userDefineRecordId) {
    this.sdkAppId = sdkAppId || 0;
    this.userId = userId || "";
    this.userSig = userSig || "";
    this.roomId = roomId || 0;
    this.strRoomId = strRoomId || "";
    this.role = role !== void 0 ? role : 20;
    this.privateMapKey = privateMapKey || null;
    this.businessInfo = businessInfo || null;
    this.streamId = streamId || null;
    this.userDefineRecordId = userDefineRecordId || null;
  }
}
const NodeTRTCEngine = require("./chunks/trtc_electron_sdk-BOHqlMxf.node");
function padMs(ms) {
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
  prefix;
  logLevel;
  constructor(prefix = "TRTC") {
    this.prefix = `[${prefix}]`;
    this.logLevel = TRTCLogLevel.TRTCLogLevelInfo;
  }
  info(...args) {
    let _a;
    if (this.logLevel <= TRTCLogLevel.TRTCLogLevelInfo) {
      const param = Array.from(args);
      (_a = console.info) === null || _a === void 0 ? void 0 : _a.apply(console, [this.getTime(), this.prefix, ...param]);
    }
  }
  log(...args) {
    let _a;
    if (this.logLevel <= TRTCLogLevel.TRTCLogLevelInfo) {
      const param = Array.from(args);
      (_a = console.log) === null || _a === void 0 ? void 0 : _a.apply(console, [this.getTime(), this.prefix, ...param]);
    }
  }
  warn(...args) {
    let _a;
    if (this.logLevel <= TRTCLogLevel.TRTCLogLevelWarn) {
      const param = Array.from(args);
      (_a = console.warn) === null || _a === void 0 ? void 0 : _a.apply(console, [this.getTime(), this.prefix, ...param]);
    }
  }
  error(...args) {
    let _a;
    if (this.logLevel <= TRTCLogLevel.TRTCLogLevelError) {
      const param = Array.from(args);
      (_a = console.error) === null || _a === void 0 ? void 0 : _a.apply(console, [this.getTime(), this.prefix, ...param]);
    }
  }
  debug(...args) {
    let _a;
    if (this.logLevel <= TRTCLogLevel.TRTCLogLevelDebug) {
      const param = Array.from(args);
      (_a = console.debug) === null || _a === void 0 ? void 0 : _a.apply(console, [this.getTime(), this.prefix, ...param]);
    }
  }
  setLogLevel(logLevel) {
    if (logLevel === TRTCLogLevel.TRTCLogLevelNone) {
      this.logLevel = TRTCLogLevel.TRTCLogLevelError;
    } else {
      this.logLevel = logLevel || TRTCLogLevel.TRTCLogLevelInfo;
    }
  }
  getTime() {
    const date = /* @__PURE__ */ new Date();
    return `${date.toLocaleTimeString("en-US", {
      hourCycle: "h23"
    })}.${padMs(date.getMilliseconds())}`;
  }
}
new Logger("TRTC");
const pkg = { version: "12.6.705" };
const SDK_LOG_LEVEL = 2;
function formatLogParams(params) {
  let logParamsStr = "";
  const paramsKeyList = Object.keys(params);
  for (let i = 0; i < paramsKeyList.length; i++) {
    const paramKey = paramsKeyList[i];
    logParamsStr += `${paramKey}:${params[paramKey]}`;
    if (i !== paramsKeyList.length - 1) {
      logParamsStr += ",";
    }
  }
  return logParamsStr;
}
class TRTCCloud extends events.EventEmitter {
  logger;
  id;
  static isIPCMode;
  static sharedTRTCCloudInstance;
  static subInstances;
  // private stateStore;
  rtcCloud;
  // private videoRendererMap;
  // private localFillMode;
  // private remoteFillModeMap;
  // private imageData;
  // private localVideoCallback;
  // private remoteVideoCallback;
  // private isExternalRenderEnabled;
  // private pixelFormat;
  // private pixelLength;
  // private enableRenderFrame;
  // private screenCaptureStreamType;
  // private isScreenCapturing;
  // private vodPlayers;
  // private localMediaTranscoder;
  // private isCaptureLocalVideoEnabled;
  // private videoProcessBufferType;
  // private videoProcessPixelFormat;
  // private videoRenderFPS;
  // private localVideoRenderController;
  // private deviceManager;
  // private audioEffectManager;
  // private pluginManager;
  // private mediaMixingManager;
  // private localRotation;
  // private localMirrorType;
  // private remoteMainStreamFillMode;
  // private remoteMainStreamRotation;
  // private remoteMainStreamMirrorType;
  // private remoteSubStreamFillMode;
  // private remoteSubStreamRotation;
  // private remoteSubStreamMirrorType;
  // private priorRemoteVideoStreamType;
  // private audioQuality;
  // private bgmId;
  // private playAudioEffectIdList;
  // private remoteVideoBufferMap;
  // private localVideoBufferMap;
  /**
   * @param {TRTCInitConfig} [config] - 初始化参数，可选
   * @param {Record<string, any>} [config.networkProxy]  - 网络代理参数，可选。为空时，默认不开启网络代理。
   * @param {Boolean} [config.isIPCMode]  - 是否跨进程模式，跨进程模式支持本地混流且混流视频采用原生窗口渲染。默认：false，不开启。
   */
  constructor(config) {
    let _a;
    super();
    this.id = !TRTCCloud.sharedTRTCCloudInstance ? 1 : 2 + (((_a = TRTCCloud.subInstances) === null || _a === void 0 ? void 0 : _a.length) || 0);
    this.logger = new Logger(`TRTC_${this.id}`);
    if (!TRTCCloud.isIPCMode) {
      this.rtcCloud = new NodeTRTCEngine.NodeTRTCCloud(config);
    } else {
      this.rtcCloud = new NodeTRTCEngine.NodeRemoteTRTCCloud(config);
    }
    this.initEventHandler();
    if (!TRTCCloud.sharedTRTCCloudInstance) {
      TRTCCloud.sharedTRTCCloudInstance = this;
    } else {
      if (!TRTCCloud.subInstances) {
        TRTCCloud.subInstances = [];
      }
      TRTCCloud.subInstances.push(this);
    }
  }
  /**
   * 创建 TRTCCloud 主实例对象（单例模式）
   *
   * @param {TRTCInitConfig} [config] - 初始化参数，可选
   * @param {Record<string, any>} [config.networkProxy]  - 网络代理参数，可选。为空时，默认不开启网络代理。
   * @param {Boolean} [config.isIPCMode]  - 是否跨进程模式，跨进程模式支持本地混流且混流视频采用原生窗口渲染。默认：false，不开启。
   *
   * @returns {TRTCCloud}
   */
  static getTRTCShareInstance(config) {
    if (!TRTCCloud.sharedTRTCCloudInstance) {
      TRTCCloud.sharedTRTCCloudInstance = new TRTCCloud(config);
    }
    return TRTCCloud.sharedTRTCCloudInstance;
  }
  /**
   * 销毁 TRTCCloud 主实例对象（单例模式）
   *
   * 注释：会同时销毁所有子实例
   */
  static destroyTRTCShareInstance() {
    if (TRTCCloud.sharedTRTCCloudInstance) {
      TRTCCloud.sharedTRTCCloudInstance.destroy();
      TRTCCloud.sharedTRTCCloudInstance = null;
    }
  }
  /**
   * 创建子实例
   *
   * 注意：只有主实例才能创建子实例，子实例不能创建子实例
   *
   * @example
   * import TRTCCloud from 'trtc-electron-sdk';
   *
   * const rtcCloud = TRTCCloud.getTRTCShareInstance();
   * rtcCloud.startLocalAudio(); // 主实例开启麦克风采集
   *
   * const childRtcCloud = rtcCloud.createSubCloud();
   * childRtcCloud.startSystemAudioLoopback(); // 子实例开启系统音采集
   *
   * @returns {TRTCCloud}
   */
  createSubCloud(config) {
    if (this !== TRTCCloud.sharedTRTCCloudInstance) {
      throw new Error("createSubCloud() can only be called on the main instance created by getTRTCShareInstance().");
    }
    if (TRTCCloud.isIPCMode) {
      throw new Error("createSubCloud() is not supported when `isIPCMode` is true.");
    }
    return new TRTCCloud(config);
  }
  /**
   * 销毁当前实例，释放资源
   */
  destroy() {
    if (this === TRTCCloud.sharedTRTCCloudInstance) {
      if (TRTCCloud.subInstances) {
        TRTCCloud.subInstances.forEach((sub) => {
          this.logger.log("destroy sub cloud");
          sub.destroy();
        });
        TRTCCloud.subInstances = [];
      }
    } else {
      TRTCCloud.subInstances = TRTCCloud.subInstances.filter((item) => {
        return item != this;
      });
    }
    this.rtcCloud.destroy();
    this.rtcCloud = null;
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                       设置 TRTCCallback 回调
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * 设置 TRTCCloud 回调
   *
   * @example
   * // 创建/使用/销毁 TRTCCloud 对象的示例代码：
   * import TRTCCloud from 'trtc-electron-sdk';
   * this.rtcCloud = TRTCCloud.getTRTCShareInstance();
   *
   * // 注册回调的方法，事件关键字详见下方"通用事件回调"
   * subscribeEvents = (rtcCloud) => {
   *  rtcCloud.on('onError', (errcode, errmsg) => {
   *      console.info('trtc_demo: onError :' + errcode + " msg" + errmsg);
   *  });
   * };
   *
   * @namespace TRTCCallback
   */
  initEventHandler() {
    this.rtcCloud.setTRTCCloudCallback((args) => {
      const key = args[0];
      const data = args[1];
      switch (key) {
        case "onError":
          this.handleOnError(data.errCode, data.errMsg);
          break;
        case "onWarning":
          this.handleOnWarning(
            data.warningCode,
            data.warningMsg,
            data.extraInfo
          );
          break;
        case "onEnterRoom":
          this.handleOnEnterRoom(data.result);
          break;
        case "onExitRoom":
          this.handleOnExitRoom(data.reason);
          break;
        case "onSwitchRoom":
          this.handleOnSwitchRoom(data.errCode, data.errMsg);
          break;
        case "onSwitchRole":
          this.handleOnSwitchRole(data.errCode, data.errMsg);
          break;
        case "onConnectOtherRoom":
          this.handleOnConnectOtherRoom(data.userId, data.errCode, data.errMsg);
          break;
        case "onDisconnectOtherRoom":
          this.handleOnDisconnectOtherRoom(data.errCode, data.errMsg);
          break;
        case "onRemoteUserEnterRoom":
          this.handleOnRemoteUserEnterRoom(data.userId);
          break;
        case "onRemoteUserLeaveRoom":
          this.handleOnRemoteUserLeaveRoom(data.userId, data.reason);
          break;
        // case "onUserVideoAvailable":
        //   this.handleOnUserVideoAvailable(
        //     data.userId,
        //     data.available === true ? 1 : 0,
        //   );
        //   break;
        // case "onUserSubStreamAvailable":
        //   this.handleOnUserSubStreamAvailable(
        //     data.userId,
        //     data.available === true ? 1 : 0,
        //   );
        //   break;
        case "onUserAudioAvailable":
          this.handleOnUserAudioAvailable(
            data.userId,
            data.available === true ? 1 : 0
          );
          break;
        // case "onFirstVideoFrame":
        //   this.handleOnFirstVideoFrame(
        //     data.userId,
        //     data.streamType,
        //     data.width,
        //     data.height,
        //   );
        //   break;
        case "onFirstAudioFrame":
          this.handleOnFirstAudioFrame(data.userId);
          break;
        // case "onSendFirstLocalVideoFrame":
        //   this.handleOnSendFirstLocalVideoFrame(data.streamType);
        //   break;
        case "onSendFirstLocalAudioFrame":
          this.handleOnSendFirstLocalAudioFrame();
          break;
        case "onUserEnter":
          this.handleOnUserEnter(data.userId);
          break;
        case "onUserExit":
          this.handleOnUserExit(data.userId, data.reason);
          break;
        case "onConnectionLost":
          this.handleOnConnectionLost();
          break;
        case "onTryToReconnect":
          this.handleOnTryToReconnect();
          break;
        case "onConnectionRecovery":
          this.handleOnConnectionRecovery();
          break;
        case "onCameraDidReady":
          this.handleOnCameraDidReady();
          break;
        case "onMicDidReady":
          this.handleOnMicDidReady();
          break;
        case "onDeviceChange":
          this.handleOnDeviceChange(data.deviceId, data.type, data.state);
          break;
        case "onTestMicVolume":
          this.handleOnTestMicVolume(data.volume);
          break;
        case "onTestSpeakerVolume":
          this.handleOnTestSpeakerVolume(data.volume);
          break;
        case "onStartPublishing":
          this.handleOnStartPublishing(data.err, data.errMsg);
          break;
        case "onStopPublishing":
          this.handleOnStopPublishing(data.err, data.errMsg);
          break;
        case "onStartPublishCDNStream":
          this.handleOnStartPublishCDNStream(data.errCode, data.errMsg);
          break;
        case "onStopPublishCDNStream":
          this.handleOnStopPublishCDNStream(data.errCode, data.errMsg);
          break;
        case "onSetMixTranscodingConfig":
          this.handleOnSetMixTranscodingConfig(data.err, data.errMsg);
          break;
        case "onAudioEffectFinished":
          this.handleOnAudioEffectFinished(data.effectId, data.code);
          break;
        case "onStartPublishMediaStream":
          this.handleOnStartPublishMediaStream(
            data.taskId,
            data.code,
            data.message
          );
          break;
        case "onUpdatePublishMediaStream":
          this.handleOnUpdatePublishMediaStream(
            data.taskId,
            data.code,
            data.message
          );
          break;
        case "onStopPublishMediaStream":
          this.handleOnStopPublishMediaStream(
            data.taskId,
            data.code,
            data.message
          );
          break;
        case "onCdnStreamStateChanged":
          this.handleOnCdnStreamStateChanged(
            data.cdnUrl,
            data.status,
            data.code,
            data.msg
          );
          break;
        // case "onScreenCaptureCovered":
        //   this.handleOnScreenCaptureCovered();
        //   break;
        // case "onScreenCaptureStarted":
        //   this.handleOnScreenCaptureStarted();
        //   break;
        // case "onScreenCapturePaused":
        //   this.handleOnScreenCapturePaused(data.reason);
        //   break;
        // case "onScreenCaptureResumed":
        //   this.handleOnScreenCaptureResumed(data.reason);
        //   break;
        // case "onScreenCaptureStoped":
        //   this.handleOnScreenCaptureStopped(data.reason);
        //   break;
        // case "onSnapshotComplete":
        //   this.handleOnSnapshotComplete(
        //     data.userId,
        //     data.type,
        //     data.data,
        //     data.width,
        //     data.height,
        //   );
        //   break;
        case "onAudioDeviceCaptureVolumeChanged":
          this.handleOnAudioDeviceCaptureVolumeChanged(data.volume, data.muted);
          break;
        case "onAudioDevicePlayoutVolumeChanged":
          this.handleOnAudioDevicePlayoutVolumeChanged(data.volume, data.muted);
          break;
        // case "onSystemAudioLoopbackError":
        //   this.handleOnSystemAudioLoopbackError(data.errCode);
        //   break;
        case "onLocalRecordBegin":
          this.handleOnLocalRecordBegin(data.errCode, data.storagePath);
          break;
        case "onLocalRecording":
          this.handleOnLocalRecording(data.duration, data.storagePath);
          break;
        case "onLocalRecordComplete":
          this.handleOnLocalRecordComplete(data.errCode, data.storagePath);
          break;
        case "onNetworkQuality":
          this.handleOnNetworkQuality(data.localQuality, data.remoteQuality);
          break;
        case "onStatistics":
          this.handleOnStatistics(data.statistics);
          break;
        case "onUserVoiceVolume":
          this.handleOnUserVoiceVolume(
            data.userVolumes,
            data.userVolumesCount,
            data.totalVolume
          );
          break;
        case "onRecvCustomCmdMsg":
          this.handleOnRecvCustomCmdMsg(
            data.userId,
            data.cmdID,
            data.seq,
            data.message
          );
          break;
        case "onMissCustomCmdMsg":
          this.handleOnMissCustomCmdMsg(
            data.userId,
            data.cmdID,
            data.errCode,
            data.missed
          );
          break;
        case "onRecvSEIMsg":
          this.handleOnRecvSEIMsg(data.userId, data.message);
          break;
        case "onSpeedTestResult":
          this.handleOnSpeedTestResult(data.result);
          break;
      }
    });
    this.bindOnSpeedTest();
  }
  fire(event, ...args) {
    setImmediate(() => {
      this.emit(event, ...args);
    });
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                      （一）错误事件和警告事件
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * 错误回调：SDK 不可恢复的错误，一定要监听，并分情况给用户适当的界面提示。
   *
   * @event TRTCCallback#onError
   * @param {Number} errCode - 错误码
   * @param {String} errMsg  - 错误信息
   */
  handleOnError(errCode, errMsg) {
    this.fire("onError", errCode, errMsg);
  }
  /**
   * 警告回调：用于告知您一些非严重性问题，例如出现了卡顿或者可恢复的解码失败。
   *
   * @event TRTCCallback#onWarning
   * @param {Number} warningCode - 警告码
   * @param {String} warningMsg  - 警告信息
   * @param {Any} extra - 补充信息
   */
  handleOnWarning(warningCode, warningMsg, extra) {
    this.fire("onWarning", warningCode, warningMsg, extra);
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                      （二）房间事件回调
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * 已加入房间的回调
   *
   * 调用 TRTCCloud 中的 [enterRoom()]{@link TRTCCloud#enterRoom} 接口执行进房操作后，会收到来自 SDK 的 onEnterRoom(result) 回调：
   * 如果加入成功，result 会是一个正数（result > 0），代表加入房间的时间消耗，单位是毫秒（ms）。
   * 如果加入失败，result 会是一个负数（result < 0），代表进房失败的错误码。
   * 进房失败的错误码含义请参见 [错误码](https://cloud.tencent.com/document/product/647/32257)。
   *
   * 注意：
   * - 在 Ver6.6 之前的版本，只有进房成功会抛出 onEnterRoom(result) 回调，进房失败由 onError() 回调抛出。
   * - 在 Ver6.6 及之后改为：进房成功返回正的 result，进房失败返回负的 result，同时进房失败也会有 onError() 回调抛出。
   *
   * @event TRTCCallback#onEnterRoom
   * @param {Number} result - result > 0 时为进房耗时（ms），result < 0 时为进房错误码。
   */
  handleOnEnterRoom(result) {
    this.fire("onEnterRoom", result);
    const params = {
      js_version: pkg.version,
      electron_version: process && process.versions && process.versions.electron || "",
      arch: process && process.arch || "",
      ua: window.navigator.userAgent
    };
    this.rtcCloud.callExperimentalAPI(
      JSON.stringify({
        api: "reportOnlineLog",
        params: {
          level: SDK_LOG_LEVEL,
          msg: "[trtc-electron-sdk] trtcstats",
          more_msg: formatLogParams(params)
        }
      })
    );
  }
  /**
   * 退出房间的事件回调
   *
   * 调用 TRTCCloud 中的 [exitRoom()]{@link TRTCCloud#exitRoom} 接口会执行退出房间的相关逻辑，例如释放音视频设备资源和编解码器资源等。
   * 待资源释放完毕，SDK 会通过 onExitRoom() 回调通知到您。
   *
   * 如果您要再次调用 enterRoom() 或者切换到其他的音视频 SDK，请等待 onExitRoom() 回调到来后再执行相关操作。
   * 否则可能会遇到例如摄像头、麦克风设备被强占等各种异常问题。
   *
   * @event TRTCCallback#onExitRoom
   * @param {Number} reason - 离开房间原因，0：主动调用 exitRoom 退房；1：被服务器踢出当前房间；2：当前房间整个被解散。
   */
  handleOnExitRoom(reason) {
    this.fire("onExitRoom", reason);
  }
  /**
   * 切换房间的事件回调
   *
   * @event TRTCCallback#onSwitchRoom
   * @param {Number} errCode - 错误码，ERR_NULL 代表切换成功，其他请参见[错误码](https://cloud.tencent.com/document/product/647/32257)。
   * @param {String} errMsg  - 错误信息。
   */
  handleOnSwitchRoom(errCode, errMsg) {
    this.fire("onSwitchRoom", errCode, errMsg);
  }
  /**
   * 切换角色的事件回调
   *
   * 调用 TRTCCloud 中的 [switchRole()]{@link TRTCCloud#switchRole} 接口会切换主播和观众的角色，该操作会伴随一个线路切换的过程，
   * 待 SDK 切换完成后，会抛出 onSwitchRole() 事件回调。
   *
   * @event TRTCCallback#onSwitchRole
   * @param {Number} errCode - 错误码，ERR_NULL 代表切换成功，其他请参见[错误码](https://cloud.tencent.com/document/product/647/32257)。
   * @param {String} errMsg  - 错误信息。
   */
  handleOnSwitchRole(errCode, errMsg) {
    this.logger.warn(`onSwitchRole errCode:${errCode} errMsg:${errMsg}`);
    this.fire("onSwitchRole", errCode, errMsg);
  }
  /**
   * 请求跨房连麦（主播跨房 PK）的结果回调
   *
   * 调用 TRTCCloud 中的 [connectOtherRoom()]{@link TRTCCloud#connectOtherRoom} 接口会将两个不同房间中的主播拉通视频通话，也就是所谓的“主播PK”功能。
   * 调用者会收到 onConnectOtherRoom() 回调来获知跨房通话是否成功，
   * 如果成功，两个房间中的所有用户都会收到 PK 主播的 onUserVideoAvailable() 回调。
   *
   * @event TRTCCallback#onConnectOtherRoom
   * @param {String} userId  - 要 PK 的目标主播 userId。
   * @param {Number} errCode - 错误码，ERR_NULL 代表切换成功，其他请参见[错误码](https://cloud.tencent.com/document/product/647/32257)。
   * @param {String} errMsg  - 错误信息。
   */
  handleOnConnectOtherRoom(userId, errCode, errMsg) {
    this.fire("onConnectOtherRoom", userId, errCode, errMsg);
  }
  /**
   * 关闭跨房连麦（主播跨房 PK）的结果回调
   *
   * @event TRTCCallback#onDisconnectOtherRoom
   * @param {Number} errCode - 错误码，ERR_NULL 代表切换成功，其他请参见 [错误码](https://cloud.tencent.com/document/product/647/32257)。
   * @param {String} errMsg  - 错误信息。
   */
  handleOnDisconnectOtherRoom(errCode, errMsg) {
    this.fire("onDisconnectOtherRoom", errCode, errMsg);
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                      （三）成员事件回调
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * 有用户加入当前房间
   *
   * 出于性能方面的考虑，在两种不同的应用场景下，该通知的行为会有差别：
   * - 通话场景（TRTCAppSceneVideoCall 和 TRTCAppSceneAudioCall）：该场景下用户没有角色的区别，任何用户进入房间都会触发该通知。
   * - 直播场景（TRTCAppSceneLIVE 和 TRTCAppSceneVoiceChatRoom）：该场景不限制观众的数量，如果任何用户进出都抛出回调会引起很大的性能损耗，所以该场景下只有主播进入房间时才会触发该通知，观众进入房间不会触发该通知。
   *
   * 注意：onRemoteUserEnterRoom 和 onRemoteUserLeaveRoom 只适用于维护当前房间里的“成员列表”，如果需要显示远程画面，建议使用监听 onUserVideoAvailable() 事件回调。
   *
   * @event TRTCCallback#onRemoteUserEnterRoom
   * @param {String} userId - 用户标识
   */
  handleOnRemoteUserEnterRoom(userId) {
    this.fire("onRemoteUserEnterRoom", userId);
  }
  /**
   * 有用户离开当前房间
   *
   * 与 onRemoteUserEnterRoom 相对应，在两种不同的应用场景下，该通知的行为会有差别：
   * - 通话场景（TRTCAppSceneVideoCall 和 TRTCAppSceneAudioCall）：该场景下用户没有角色的区别，任何用户的离开都会触发该通知。
   * - 直播场景（TRTCAppSceneLIVE 和 TRTCAppSceneVoiceChatRoom）：只有主播离开房间时才会触发该通知，观众离开房间不会触发该通知。
   *
   * @event TRTCCallback#onRemoteUserLeaveRoom
   * @param {String} userId - 用户标识
   * @param {Number} reason - 离开原因，0表示用户主动退出房间，1表示用户超时退出，2表示被踢出房间。
   */
  handleOnRemoteUserLeaveRoom(userId, reason) {
    this.fire("onRemoteUserLeaveRoom", userId, reason);
  }
  /**
   * 用户是否开启音频上行
   *
   * @event TRTCCallback#onUserAudioAvailable
   * @param {String}  userId    - 用户标识
   * @param {Number} available - 声音是否开启
   */
  handleOnUserAudioAvailable(userId, available) {
    this.logger.log(
      `onUserAudioAvailable userId:${userId} available:${available}`
    );
    this.fire("onUserAudioAvailable", userId, available);
  }
  /**
   * 开始播放远程用户的首帧音频（本地声音暂不通知）
   *
   * @event TRTCCallback#onFirstAudioFrame
   * @param {String} userId - 远程用户 ID。
   */
  handleOnFirstAudioFrame(userId) {
    this.logger.log(`onFirstAudioFrame userId:${userId}`);
    this.fire("onFirstAudioFrame", userId);
  }
  /**
   * 首帧本地音频数据已经被送出
   *
   * SDK 会在 enterRoom() 并 startLocalAudio() 成功后开始麦克风采集，并将采集到的声音进行编码。
   * 当 SDK 成功向云端送出第一帧音频数据后，会抛出这个回调事件。
   *
   * @event TRTCCallback#onSendFirstLocalAudioFrame
   */
  handleOnSendFirstLocalAudioFrame() {
    this.logger.log(`onSendFirstLocalAudioFrame`);
    this.fire("onSendFirstLocalAudioFrame");
  }
  /**
   * 废弃事件：有主播加入当前房间
   *
   * 该回调接口可以被看作是 onRemoteUserEnterRoom 的废弃版本，不推荐使用。请使用 onUserVideoAvailable 或 onRemoteUserEnterRoom 进行替代。
   *
   * @deprecated 从 TRTCSDK6.8 后该接口已被废弃，不推荐使用
   * @event TRTCCallback#onUserEnter
   * @param {String} userId - 用户标识
   */
  handleOnUserEnter(userId) {
    this.fire("onUserEnter", userId);
  }
  /**
   * 废弃事件：有主播离开当前房间
   *
   * 该回调接口可以被看作是 onRemoteUserLeaveRoom 的废弃版本，不推荐使用。请使用 onUserVideoAvailable 或 onRemoteUserEnterRoom 进行替代。
   *
   * @deprecated 从 TRTCSDK6.8 后该接口已被废弃，不推荐使用
   * @event TRTCCallback#onUserExit
   * @param {String} userId - 用户标识
   * @param {Number} reason - 离开原因代码，区分用户是正常离开，还是由于网络断线等原因离开。
   */
  handleOnUserExit(userId, reason) {
    this.fire("onUserExit", userId, reason);
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                      （四）统计和质量回调
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * 网络质量：该回调每2秒触发一次，统计当前网络的上行和下行质量
   *
   * 注意：userId == '' 代表自己当前的视频质量
   *
   * @event TRTCCallback#onNetworkQuality
   * @param {TRTCQualityInfo} localQuality  - 上行网络质量
   * @param {TRTCQualityInfo[]} remoteQuality - 下行网络质量
   */
  handleOnNetworkQuality(localQuality, remoteQuality) {
    this.fire("onNetworkQuality", localQuality, remoteQuality);
  }
  /**
   * 技术指标统计回调
   *
   * 如果您是熟悉音视频领域相关术语，可以通过这个回调获取 SDK 的所有技术指标。
   * 如果您是首次开发音视频相关项目，可以只关注 onNetworkQuality 回调。
   *
   * 注意：每2秒回调一次
   *
   * @event TRTCCallback#onStatistics
   * @param {TRTCStatistics} statis - 统计数据，包括本地和远程的
   */
  handleOnStatistics(statis) {
    this.fire("onStatistics", statis);
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                      （五）服务器事件回调
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * SDK 跟服务器的连接断开
   *
   * @event TRTCCallback#onConnectionLost
   */
  handleOnConnectionLost() {
    this.fire("onConnectionLost");
  }
  /**
   * SDK 尝试重新连接到服务器
   *
   * @event TRTCCallback#onTryToReconnect
   */
  handleOnTryToReconnect() {
    this.fire("onTryToReconnect");
  }
  /**
   * SDK 跟服务器的连接恢复
   *
   * @event TRTCCallback#onConnectionRecovery
   */
  handleOnConnectionRecovery() {
    this.fire("onConnectionRecovery");
  }
  /**
   * 废弃事件：服务器测速的回调，SDK 对多个服务器 IP 做测速，每个 IP 的测速结果通过这个回调通知
   *
   * @deprecated 从 TRTCSDK 9.3 后该接口已被废弃，不会抛出该事件, 请采用 onSpeedTestResult 事件代替
   *
   * @event TRTCCallback#onSpeedTest
   * @param {TRTCSpeedTestResult} currentResult - 当前完成的测速结果
   * @param {Number} finishedCount - 已完成测速的服务器数量
   * @param {Number} totalCount    - 需要测速的服务器总数量
   */
  bindOnSpeedTest() {
  }
  /**
   * 网速测试的结果回调
   *
   * 该统计回调由 startSpeedTest 触发。
   *
   * @event TRTCCallback#onSpeedTestResult
   * @param {TRTCSpeedTestResult} result 网速测试数据数据，包括丢包、往返延迟、上下行的带宽速率。
   */
  handleOnSpeedTestResult(result) {
    this.fire("onSpeedTestResult", result);
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                      （六）硬件设备事件回调
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * 摄像头准备就绪
   *
   * @event TRTCCallback#onCameraDidReady
   */
  handleOnCameraDidReady() {
    this.fire("onCameraDidReady");
  }
  /**
   * 麦克风准备就绪
   *
   * @event TRTCCallback#onMicDidReady
   */
  handleOnMicDidReady() {
    this.fire("onMicDidReady");
  }
  /**
   * userId 对应的成员语音音量
   *
   * 您可以通过调用 TRTCCloud 中的 [enableAudioVolumeEvaluation()]{@link TRTCCloud#enableAudioVolumeEvaluation} 接口来开关这个回调或者设置它的触发间隔。
   * 需要注意的是，调用 enableAudioVolumeEvaluation 开启音量回调后，无论频道内是否有人说话，都会按设置的时间间隔调用这个回调，
   * 如果没有人说话，则 totalVolume 为0。
   *
   * @event TRTCCallback#onUserVoiceVolume
   * @param {TRTCVolumeInfo} userVolumes      - 每位发言者的语音音量，取值范围0 - 100
   * @param {Number} userVolumesCount - 发言者的人数，即 userVolumes 数组的大小
   * @param {Number} totalVolume      - 总的语音音量, 取值范围0 - 100
   */
  handleOnUserVoiceVolume(userVolumes, userVolumesCount, totalVolume) {
    this.fire("onUserVoiceVolume", userVolumes, userVolumesCount, totalVolume);
  }
  /**
   * 本地设备通断回调
   *
   * @event TRTCCallback#onDeviceChange
   * @param {String} deviceId - Windows 端返回设备名，Mac 端返回设备 ID
   * @param {TRTCDeviceType} type     - 设备类型
   * @param {TRTCDeviceState} state    - 事件类型
   */
  handleOnDeviceChange(deviceId, type, state) {
    this.fire("onDeviceChange", deviceId, type, state);
  }
  /**
   * 麦克风测试音量回调
   *
   * 麦克风测试接口 [startMicDeviceTest()]{@link TRTCCloud#startMicDeviceTest} 会触发这个回调
   *
   * @event TRTCCallback#onTestMicVolume
   * @param {Number} volume - 音量值，取值范围0 - 100
   */
  handleOnTestMicVolume(volume) {
    this.fire("onTestMicVolume", volume);
  }
  /**
   * 扬声器测试音量回调
   *
   * 扬声器测试接口 [startSpeakerDeviceTest()]{@link TRTCCloud#startSpeakerDeviceTest} 会触发这个回调
   *
   * @event TRTCCallback#onTestSpeakerVolume
   * @param {Number} volume - 音量值，取值范围0 - 100
   */
  handleOnTestSpeakerVolume(volume) {
    this.fire("onTestSpeakerVolume", volume);
  }
  /**
   * 当前音频采集设备音量变化回调
   *
   * 使用 [enableAudioVolumeEvaluation]{@link TRTCCloud#enableAudioVolumeEvaluation}（interval>0）开启，（interval==0）关闭
   *
   * @event TRTCCallback#onAudioDeviceCaptureVolumeChanged
   * @param {Number} volume - 音量值，取值范围0 - 100
   * @param {Boolean} muted - 当前采集音频设备是否被静音
   */
  handleOnAudioDeviceCaptureVolumeChanged(volume, muted) {
    this.fire("onAudioDeviceCaptureVolumeChanged", volume, muted);
  }
  /**
   * 当前音频播放设备音量变化回调
   *
   *  使用 [enableAudioVolumeEvaluation]{@link TRTCCloud#enableAudioVolumeEvaluation}（interval>0）开启，（interval==0）关闭
   *
   * @event TRTCCallback#onAudioDevicePlayoutVolumeChanged
   * @param {Number} volume - 音量值，取值范围0 - 100
   * @param {Boolean} muted - 当前音频播放设备是否被静音
   */
  handleOnAudioDevicePlayoutVolumeChanged(volume, muted) {
    this.fire("onAudioDevicePlayoutVolumeChanged", volume, muted);
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                      （七）自定义消息的接收回调
  //
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * 收到自定义消息回调
   *
   * 当房间中的某个用户使用 [sendCustomCmdMsg()]{@link TRTCCloud#sendCustomCmdMsg} 发送自定义消息时，房间中的其它用户可以通过 onRecvCustomCmdMsg 接口接收消息
   *
   * @event TRTCCallback#onRecvCustomCmdMsg
   * @param {String} userId - 用户标识
   * @param {Number} cmdId  - 命令 ID
   * @param {Number} seq    - 消息序号
   * @param {String} msg    - 消息数据
   */
  handleOnRecvCustomCmdMsg(userId, cmdId, seq, msg) {
    this.fire("onRecvCustomCmdMsg", userId, cmdId, seq, msg);
  }
  /**
   * 自定义消息丢失回调
   *
   * 实时音视频使用 UDP 通道，即使设置了可靠传输（reliable）也无法确保100%不丢失，只是丢消息概率极低，能满足常规可靠性要求。
   * 在发送端设置了可靠传输（reliable）后，SDK 都会通过此回调通知过去时间段内（通常为5s）传输途中丢失的自定义消息数量统计信息。
   *
   * 注意：只有在发送端设置了可靠传输(reliable)，接收方才能收到消息的丢失回调
   *
   * @event TRTCCallback#onMissCustomCmdMsg
   * @param {String} userId  - 用户标识
   * @param {Number} cmdId   - 命令 ID
   * @param {Number} errCode - 错误码
   * @param {Number} missed  - 丢失的消息数量
   */
  handleOnMissCustomCmdMsg(userId, cmdId, errCode, missed) {
    this.fire("onMissCustomCmdMsg", userId, cmdId, errCode, missed);
  }
  /**
   * 收到 SEI 消息的回调
   *
   * 当房间中的某个用户使用 [sendSEIMsg()]{@link TRTCCloud#sendSEIMsg} 发送数据时，房间中的其它用户可以通过 onRecvSEIMsg 接口接收数据。
   *
   * @event TRTCCallback#onRecvSEIMsg
   * @param {String} userId  - 用户标识
   * @param {String} message - 数据
   */
  handleOnRecvSEIMsg(userId, message) {
    this.fire("onRecvSEIMsg", userId, message);
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                      （八）CDN 旁路转推回调
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * 开始向腾讯云的直播 CDN 推流的回调，对应于 TRTCCloud 中的 [startPublishing()]{@link TRTCCloud#startPublishing} 接口
   *
   * @event TRTCCallback#onStartPublishing
   * @param {Number} errCode - 0 表示成功，其余值表示失败
   * @param {String} errMsg  - 具体错误原因
   * @deprecated
   */
  handleOnStartPublishing(errCode, errMsg) {
    this.fire("onStartPublishing", errCode, errMsg);
  }
  /**
   * 停止向腾讯云的直播 CDN 推流的回调，对应于 TRTCCloud 中的 [stopPublishing()]{@link TRTCCloud#stopPublishing} 接口
   *
   * @event TRTCCallback#onStopPublishing
   * @param {Number} errCode - 0 表示成功，其余值表示失败
   * @param {String} errMsg  - 具体错误原因
   * @deprecated
   */
  handleOnStopPublishing(errCode, errMsg) {
    this.fire("onStopPublishing", errCode, errMsg);
  }
  /**
   * 旁路推流到 CDN 的回调
   *
   * 对应于 TRTCCloud 的 [startPublishCDNStream()]{@link TRTCCloud#startPublishCDNStream} 接口
   *
   * 注意：Start 回调如果成功，只能说明转推请求已经成功告知给腾讯云，如果目标 CDN 有异常，还是有可能会转推失败。
   *
   * @event TRTCCallback#onStartPublishCDNStream
   * @param {Number} errCode - 错误码
   * @param {String} errMsg  - 错误详细信息
   * @deprecated
   */
  handleOnStartPublishCDNStream(errCode, errMsg) {
    this.fire("onStartPublishCDNStream", errCode, errMsg);
  }
  /**
   * 停止旁路推流到 CDN 的回调
   *
   * 对应于 TRTCCloud 中的 [stopPublishCDNStream()]{@link TRTCCloud#stopPublishCDNStream} 接口
   *
   * @event TRTCCallback#onStopPublishCDNStream
   * @param {Number} errCode - 错误码
   * @param {String} errMsg  - 错误详细信息
   * @deprecated
   */
  handleOnStopPublishCDNStream(errCode, errMsg) {
    this.fire("onStopPublishCDNStream", errCode, errMsg);
  }
  /**
   * 设置云端的混流转码参数的回调
   *
   * 对应于 TRTCCloud 中的 [setMixTranscodingConfig()]{@link TRTCCloud#setMixTranscodingConfig} 接口
   *
   * @event TRTCCallback#onSetMixTranscodingConfig
   * @param {Number} errCode - 错误码
   * @param {String} errMsg  - 错误详细信息
   * @deprecated
   */
  handleOnSetMixTranscodingConfig(errCode, errMsg) {
    this.fire("onSetMixTranscodingConfig", errCode, errMsg);
  }
  /**
   * 开始发布媒体流的事件回调
   *
   * 当您调用 [startPublishMediaStream]{@link TRTCCloud#startPublishMediaStream} 开始向 TRTC 后台服务发布媒体流时，SDK 会立刻将这一指令同步给云端服务器，随后 SDK 会收到来自云端服务器的处理结果，并将指令的执行结果通过本事件回调通知给您。
   *
   * @event TRTCCallback#onStartPublishMediaStream
   * @param taskId {String} - 当请求成功时，TRTC 后台会在回调中提供给您这项任务的 taskId，后续您可以通过该 taskId 结合 [updatePublishMediaStream]{@link TRTCCloud#updatePublishMediaStream} 和 [stopPublishMediaStream]{@link TRTCCloud#stopPublishMediaStream} 进行更新和停止。
   * @param code {Number} - 回调结果，0 表示成功，其余值表示失败。
   * @param message {String} - 具体回调信息。
   */
  handleOnStartPublishMediaStream(taskId, code, message) {
    this.fire("onStartPublishMediaStream", taskId, code, message);
  }
  /**
   * 更新媒体流的事件回调
   *
   * 当您调用媒体流发布接口 ([updatePublishMediaStream]{@link TRTCCloud#updatePublishMediaStream}) 开始向 TRTC 后台服务更新媒体流时，SDK 会立刻将这一指令同步给云端服务器，随后 SDK 会收到来自云端服务器的处理结果，并将指令的执行结果通过本事件回调通知给您。
   * @event TRTCCallback#onUpdatePublishMediaStream
   * @param taskId {String} - 您调用媒体流发布接口 ([updatePublishMediaStream]{@link TRTCCloud#updatePublishMediaStream}) 时传入的 taskId，会通过此回调再带回给您，用于标识该回调属于哪一次更新请求。
   * @param code {Number} - 回调结果，0 表示成功，其余值表示失败。
   * @param message {String} - 具体回调信息。
   */
  handleOnUpdatePublishMediaStream(taskId, code, message) {
    this.fire("onUpdatePublishMediaStream", taskId, code, message);
  }
  /**
   * 停止媒体流的事件回调
   *
   * 当您调用停止发布媒体流 ([stopPublishMediaStream]{@link TRTCCloud#stopPublishMediaStream}) 开始向 TRTC 后台服务停止媒体流时，SDK 会立刻将这一指令同步给云端服务器，随后 SDK 会收到来自云端服务器的处理结果，并将指令的执行结果通过本事件回调通知给您。
   * @event TRTCCallback#onStopPublishMediaStream
   * @param taskId {String} - 您调用停止发布媒体流 ([stopPublishMediaStream]{@link TRTCCloud#stopPublishMediaStream}) 时传入的 taskId，会通过此回调再带回给您，用于标识该回调属于哪一次停止请求。
   * @param code {Number} - 回调结果，0 表示成功，其余值表示失败。
   * @param message {String} - 具体回调信息。
   */
  handleOnStopPublishMediaStream(taskId, code, message) {
    this.fire("onStopPublishMediaStream", taskId, code, message);
  }
  /**
   * RTMP/RTMPS 推流状态发生改变回调
   *
   * 当您调用 [startPublishMediaStream]{@link TRTCCloud#startPublishMediaStream} 开始向 TRTC 后台服务发布媒体流时，SDK 会立刻将这一指令同步给云端服务。
   * 若您在目标推流配置 ([TRTCPublishTarget]{@link TRTCPublishTarget}) 设置了向腾讯或者第三方 CDN 上发布音视频流的 URL 配置，则具体 RTMP 或者 RTMPS 推流状态将通过此回调同步给您。
   *
   * @event TRTCCallback#onCdnStreamStateChanged
   * @param cdnUrl {String} - 您调用 [startPublishMediaStream]{@link TRTCCloud#startPublishMediaStream} 时通过目标推流配置 ([TRTCPublishTarget]{@link TRTCPublishTarget}) 传入的 url，在推流状态变更时，会通过此回调同步给您。
   * @param status {Number} - 推流状态。
   * - 0：推流未开始或者已结束。在您调用 [stopPublishMediaStream]{@link TRTCCloud#stopPublishMediaStream} 时会返回该状态。
   * - 1：正在连接 TRTC 服务器和 CDN 服务器。若无法立刻成功，TRTC 后台服务会多次重试尝试推流，并返回该状态（5s回调一次）。如成功进行推流，则进入状态 2；如服务器出错或 60 秒内未成功推流，则进入状态 4。
   * - 2：CDN 推流正在进行。在成功推流后，会返回该状态。
   * - 3：TRTC 服务器和 CDN 服务器推流中断，正在恢复。当 CDN 出现异常，或推流短暂中断时，TRTC 后台服务会自动尝试恢复推流，并返回该状态（5s回调一次）。如成功恢复推流，则进入状态 2；如服务器出错或 60 秒内未成功恢复，则进入状态 4。
   * - 4：TRTC 服务器和 CDN 服务器推流中断，且恢复或连接超时。即此时推流失败，你可以再次调用 [updatePublishMediaStream]{@link TRTCCloud#updatePublishMediaStream} 尝试推流。
   * - 5：正在断开 TRTC 服务器和 CDN 服务器。在您调用 [stopPublishMediaStream]{@link TRTCCloud#stopPublishMediaStream} 时，TRTC 后台服务会依次同步状态 5 和状态 0。
   * @param code {Number} - 回调结果，0 表示成功，其余值表示失败。
   * @param msg {String} - 具体回调信息。
   */
  handleOnCdnStreamStateChanged(cdnUrl, status, code, msg) {
    this.fire("onCdnStreamStateChanged", cdnUrl, status, code, msg);
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                      （九）音效回调
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * 废弃事件： 播放音效结束回调
   *
   * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，不推荐使用
   *
   * @event TRTCCallback#onAudioEffectFinished
   * @param {Number} effectId - 音效 ID
   * @param {Number} code     - 0表示播放正常结束；其他表示异常结束
   */
  handleOnAudioEffectFinished(effectId, code) {
    this.fire("onAudioEffectFinished", effectId, code);
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                      （十二）背景混音事件回调
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * 本地录制任务开始的事件回调
   *
   * 当您调用 [startLocalRecording]{@link TRTCCloud#startLocalRecording} 启动本地媒体录制任务时，SDK 会抛出该事件回调，用于通知您录制任务是否已经顺利启动。
   *
   * @event TRTCCallback#onLocalRecordBegin
   * @param {number} errCode - 错误码 0：初始化录制成功；-1：初始化录制失败；-2: 文件后缀名有误。
   * @param {string} storagePath - 录制文件存储路径
   */
  handleOnLocalRecordBegin(errCode, storagePath) {
    this.fire("onLocalRecordBegin", errCode, storagePath);
  }
  /**
   *  本地录制任务正在进行中的事件回调
   *
   * 当您调用 [startLocalRecording]{@link TRTCCloud#startLocalRecording} 成功启动本地媒体录制任务后，SDK 变会定时地抛出本事件回调。 您可通过捕获该事件回调来获知录制任务的健康状况。 您可以在 [startLocalRecording]{@link TRTCCloud#startLocalRecording} 时设定本事件回调的抛出间隔。
   *
   * @event TRTCCallback#onLocalRecording
   * @param {number} duration - 已经录制的累计时长，单位毫秒。
   * @param {string} storagePath - 录制文件存储路径
   */
  handleOnLocalRecording(duration, storagePath) {
    let newDuration = 0;
    try {
      newDuration = Number(duration);
    } catch (err) {
      this.logger.error("onLocalRecording duration convert error.", err);
      newDuration = 0;
    }
    this.fire("onLocalRecording", newDuration, storagePath);
  }
  /**
   * 本地录制任务结束的事件回调
   *
   * 当您调用 [stopLocalRecording]{@link TRTCCloud#stopLocalRecording} 停止本地媒体录制任务时，SDK 会抛出该事件回调，用于通知您录制任务的最终结果。
   *
   * @event TRTCCallback#onLocalRecordComplete
   * @param {number} errCode - 错误码
   *   - 0：录制成功；
   *   - -1：录制失败；
   *   - -2：切换分辨率或横竖屏导致录制结束；
   *   - -3：录制时间太短，或未采集到任何视频或音频数据，请检查录制时长，或是否已开启音、视频采集。
   * @param {string} storagePath - 录制文件存储路径
   */
  handleOnLocalRecordComplete(errCode, storagePath) {
    this.fire("onLocalRecordComplete", errCode, storagePath);
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                      （一）房间相关接口函数
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * 进入房间
   *
   * 调用接口后，您会收到来自 TRTCCallback 中的 [onEnterRoom(result)]{@link TRTCCallback#onEnterRoom} 回调:
   * - 如果加入成功，result 会是一个正数（result > 0），表示加入房间的时间消耗，单位是毫秒（ms）。
   * - 如果加入失败，result 会是一个负数（result < 0），表示进房失败的错误码。
   *
   * 进房失败的错误码含义请参见[错误码](https://cloud.tencent.com/document/product/647/32257)。
   *
   * 参数 scene 的枚举值如下：
   * - {@link TRTCAppSceneVideoCall}：<br>
   *          视频通话场景，支持720P、1080P高清画质，单个房间最多支持300人同时在线，最高支持50人同时发言。<br>
   *          适合：[1对1视频通话]、[300人视频会议]、[在线问诊]、[视频聊天]、[远程面试]等。<br>
   * - {@link TRTCAppSceneAudioCall}：<br>
   *          语音通话场景，支持 48kHz，支持双声道。单个房间最多支持300人同时在线，最高支持50人同时发言。<br>
   *          适合：[1对1语音通话]、[300人语音会议]、[语音聊天]、[语音会议]、[在线狼人杀]等。<br>
   * - {@link TRTCAppSceneLIVE}：<br>
   *          视频互动直播，支持平滑上下麦，切换过程无需等待，主播延时小于300ms；支持十万级别观众同时播放，播放延时低至1000ms。<br>
   *          适合：[视频低延时直播]、[十万人互动课堂]、[视频直播 PK]、[视频相亲房]、[互动课堂]、[远程培训]、[超大型会议]等。<br>
   * - {@link TRTCAppSceneVoiceChatRoom}：<br>
   *          语音互动直播，支持平滑上下麦，切换过程无需等待，主播延时小于300ms；支持十万级别观众同时播放，播放延时低至1000ms。<br>
   *          适合：[语音低延时直播]、[语音直播连麦]、[语聊房]、[K 歌房]、[FM 电台]等。<br>
   *
   * 注意：<br>
   * 1. 当 scene 选择为 TRTCAppSceneLIVE 或 TRTCAppSceneVoiceChatRoom 时，您必须通过 TRTCParams 中的 role 字段指定当前用户的角色。<br>
   * 2. 不管进房是否成功，enterRoom 都必须与 exitRoom 配对使用，在调用 exitRoom 前再次调用 enterRoom 函数会导致不可预期的错误问题。
   *
   * @param {TRTCParams} params - 进房参数
   * @param {Number} params.sdkAppId      - 应用标识（必填）
   * @param {String} params.userId        - 用户标识（必填）
   * @param {String} params.userSig       - 用户签名（必填）
   * @param {Number} params.roomId        - 房间号码, roomId 和 strRoomId 必须填一个, 若您选用 strRoomId，则 roomId 需要填写为0。
   * @param {String} params.strRoomId        - 字符串房间号码 [选填]，在同一个房间内的用户可以看到彼此并进行视频通话, roomId 和 strRoomId 必须填一个。若两者都填，则优先选择 roomId。
   * @param {TRTCRoleType} params.role    - 直播场景下的角色，默认值：主播
   * - TRTCRoleAnchor: 主播，可以上行视频和音频，一个房间里最多支持50个主播同时上行音视频。
   * - TRTCRoleAudience: 观众，只能观看，不能上行视频和音频，一个房间里的观众人数没有上限。
   * @param {String} params.privateMapKey - 房间签名（非必填）
   * @param {String} params.businessInfo  - 业务数据（非必填）
   * @param {String} params.streamId      - 自定义 CDN 播放地址（非必填）
   * @param {String} params.userDefineRecordId - 设置云端录制完成后的回调消息中的 "userdefinerecordid"  字段内容，便于您更方便的识别录制回调。
   * @param {TRTCAppScene} scene - 应用场景，目前支持视频通话（VideoCall）、在线直播（Live）、语音通话（AudioCall）、语音聊天室（VoiceChatRoom）四种场景。
   */
  enterRoom(params, scene) {
    if (params instanceof TRTCParams) {
      this.rtcCloud.enterRoom(params, scene);
    } else {
      this.logger.error("trtc:enterRoom, params is not instanceof TRTCParams!");
    }
  }
  /**
   * 退出房间
   *
   * 调用 exitRoom() 接口会执行退出房间的相关逻辑，例如释放音视频设备资源和编解码器资源。
   * 待资源释放完毕，SDK 会通过 TRTCCallback 中的 onExitRoom() 回调通知您。
   *
   * 如果您要再次调用 enterRoom() 或者切换到其它的音视频 SDK，请等待 onExitRoom() 回调到来后再执行相关操作，
   * 否则可能会遇到如摄像头、麦克风设备被强占等各种异常问题。
   */
  exitRoom() {
    this.rtcCloud.exitRoom();
  }
  /**
   * 切换房间
   *
   * 调用该接口后，用户会先退出原来的房间并快速进入 TRTCSwitchRoomParam 中指定的新房间:
   * 相比于直接调用 exitRoom + enterRoom 的方式，switchRoom 接口对主播更加友好，因为 switchRoom
   * 不会停止主播端视频的采集和预览。
   *
   * @param {TRTCSwitchRoomParam} params 房间切换参数，请参考 {@link TRTCSwitchRoomParam}
   *
   * 接口调用结果会通过 onSwitchRoom(errCode, errMsg) 事件回调通知给您。
   */
  switchRoom(params) {
    this.rtcCloud.switchRoom(
      params.roomId,
      params.strRoomId,
      params.userSig,
      params.privateMapKey
    );
  }
  /**
   * 切换角色，仅适用于直播场景（TRTCAppSceneLIVE 和 TRTCAppSceneVoiceChatRoom）
   *
   * 在直播场景下，一个用户可能需要在“观众”和“主播”之间来回切换。
   * 您可以在进房前通过 TRTCParams 中的 role 字段确定角色，也可以通过 switchRole 在进房后切换角色。
   *
   * @param {TRTCRoleType} role - 目标角色，默认为主播
   * - TRTCRoleAnchor: 主播，可以上行视频和音频，一个房间里最多支持50个主播同时上行音视频。
   * - TRTCRoleAudience: 观众，只能观看，不能上行视频和音频，一个房间里的观众人数没有上限。
   */
  switchRole(role) {
    this.rtcCloud.switchRole(role);
  }
  /**
   * 请求跨房连麦（主播跨房 PK）
   *
   * TRTC 中两个不同音视频房间中的主播，可以通过“跨房连麦”功能拉通连麦通话功能。使用此功能时，
   * 两个主播无需退出各自原来的直播间即可进行“连麦 PK”。
   *
   * 例如：当房间“001”中的主播 A 通过 connectOtherRoom() 跟房间“002”中的主播 B 拉通跨房连麦后，
   * 房间“001”中的用户都会收到主播 B 的 onUserEnter(B) 回调和 onUserVideoAvailable(B,true) 回调。
   * 房间“002”中的用户都会收到主播 A 的 onUserEnter(A) 回调和 onUserVideoAvailable(A,true) 回调。
   *
   * 简言之，跨房连麦的本质，就是把两个不同房间中的主播相互分享，让每个房间里的观众都能看到两个主播。
   *
   * <pre>
   *                 房间 001                     房间 002
   *               -------------               ------------
   *  跨房连麦前：  | 主播 A      |             | 主播 B     |
   *              | 观众 U V W  |             | 观众 X Y Z |
   *               -------------               ------------
   *
   *                 房间 001                     房间 002
   *               -------------               ------------
   *  跨房连麦后：  | 主播 A B    |             | 主播 B A   |
   *              | 观众 U V W  |             | 观众 X Y Z |
   *               -------------               ------------
   * </pre>
   *
   * 考虑到后续扩展字段的兼容性问题，跨房连麦的参数暂时采用了 JSON 格式的字符串，要求至少包含两个字段：
   * - roomId：房间“001”中的主播 A 要跟房间“002”中的主播 B 连麦，主播 A 调用 connectOtherRoom() 时 roomId 应指定为“002”。
   * - userId：房间“001”中的主播 A 要跟房间“002”中的主播 B 连麦，主播 A 调用 connectOtherRoom() 时 userId 应指定为 B 的 userId。
   *
   * 跨房连麦的请求结果会通过 TRTCCallback 中的 onConnectOtherRoom 回调通知给您。
   *
   * @example
   * let json = JSON.stringify({roomId: 2, userId: "userB"});
   * rtcCloud.connectOtherRoom(json);
   *
   * @param {String} params - JSON 字符串连麦参数，roomId 代表目标房间号，userId 代表目标用户 ID。
   *
   */
  connectOtherRoom(params) {
    this.rtcCloud.connectOtherRoom(params);
  }
  /**
   * 关闭跨房连麦（主播跨房 PK）
   *
   * 跨房连麦的退出结果会通过 TRTCCallback 中的 onDisconnectOtherRoom 回调通知给您。
   */
  disconnectOtherRoom() {
    this.rtcCloud.disconnectOtherRoom();
  }
  /**
   * 设置音视频数据接收模式（需要在进房前设置才能生效）
   *
   * 为实现进房秒开的绝佳体验，SDK 默认进房后自动接收音视频。即在您进房成功的同时，您将立刻收到远端所有用户的音视频数据。
   * 若您没有调用 startRemoteView，视频数据将自动超时取消。
   * 若您主要用于语音聊天等没有自动接收视频数据需求的场景，您可以根据实际需求选择接收模式。
   *
   * 注意：需要在进房前设置才能生效。
   *
   * @param {Boolean} autoRecvAudio - true：自动接收音频数据；false：需要调用 [muteRemoteAudio]{@link TRTCCloud#muteRemoteAudio} 进行请求或取消。默认值：true
   * @param {Boolean} autoRecvVideo - true：自动接收视频数据；false：需要调用 [startRemoteView]{@link TRTCCloud#startRemoteView}/[stopRemoteView]{@link TRTCCloud#stopRemoteView} 进行请求或取消。默认值：true
   *
   */
  setDefaultStreamRecvMode(autoRecvAudio, autoRecvVideo) {
    this.rtcCloud.setDefaultStreamRecvMode(autoRecvAudio, autoRecvVideo);
  }
  /////////////////////////////////////////////////////////////////////////////////
  //
  //                      （十四）LOG 相关接口函数
  //
  /////////////////////////////////////////////////////////////////////////////////
  /**
   * 获取 SDK 版本信息
   *
   * @return {String} UTF-8 编码的版本号。
   */
  getSDKVersion() {
    return this.rtcCloud.getSDKVersion();
  }
}
console.info("TRTCCloud", TRTCCloud);
const trtc = TRTCCloud.getTRTCShareInstance();
console.info("trtc.getSDKVersion()", trtc.getSDKVersion());
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window2) => {
    utils.optimizer.watchWindowShortcuts(window2);
  });
  electron.ipcMain.on("ping", () => console.log("pong"));
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
