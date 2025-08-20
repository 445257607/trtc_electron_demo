import { EventEmitter } from 'events';
//import { IRenderer, createRenderer, RenderType, RendererOptions } from './Renderer';
//import { TRTCConfig, config as renderUtilConfig, allocBuffer, generateUniqueId } from './Renderer/util';
//import YUVBuffer from './Renderer/yuv-buffer';
//import { VodPlayer } from './vod_player';
// @ts-ignore
//import YCbCr from 'yuv-canvas/src/YCbCr';
// import TRTCLocalMediaTranscoder from './LocalMediaTranscoder';
import {
    AudioMusicParam,
    //Rect,
    TRTCAppScene,
    TRTCAudioEffectParam,
    TRTCAudioQuality,
    //TRTCBeautyStyle,
    TRTCDeviceState,
    TRTCDeviceType,
    TRTCLogLevel,
    TRTCNetworkQosParam,
    TRTCParams,
    TRTCPublishCDNParam,
    //TRTCRenderParams,
    TRTCRoleType,
    TRTCSpeedTestResult,
    TRTCStatistics,
    TRTCSwitchRoomParam,
    //TRTCTranscodingConfig,
    //TRTCTranscodingConfigMode,
    //TRTCVideoBufferType,
    //TRTCVideoEncParam,
    //TRTCVideoFillMode,
    //TRTCVideoFrame,
    //TRTCAudioFrame,
    //TRTCVideoMirrorType,
    //TRTCVideoPixelFormat,
    //TRTCVideoRotation,
    TRTCVideoStreamType,
    TRTCVolumeInfo,
    //TRTCWaterMarkSrcType,
    TRTCQualityInfo,
    //TRTCPluginType,
    //TRTCPluginInfo,
    //TRTCVideoProcessPluginOptions,
    //TRTCMediaEncryptDecryptPluginOptions,
    TRTCAudioRecordingParams,
    //TRTCScreenCaptureSourceInfo,
    //TRTCScreenCaptureProperty,
    TRTCSpeedTestParams,
    //VideoBufferInfo,
    TRTCRecordType,
    TRTCDeviceInfo,
    //TRTCCameraCaptureParams,
    //TRTCImageBuffer,
    TRTCInitConfig,
    TRTCAudioParallelParams,
    TRTCVoiceReverbType,
    TRTCVoiceChangerType,
    TRTCMusicPlayObserver,
    TRTCAudioFrameCallback,
    TRTCAudioProcessPluginOptions,
    TRTCPublishTarget,
    TRTCStreamEncoderParam,
    TRTCStreamMixingConfig,
} from './trtc_define';
import { isNumber } from './validate-util';
import logger, { Logger } from "./logger";
//import LocalVideoRenderController from './VideoRenderControl/LocalVideoRenderController';
//import{ videoRenderFPSMonitor } from './VideoRenderControl/VideoRenderFPSMonitor';
import TRTCDeviceManager from './extensions/DeviceManager';
import TRTCAudioEffectManager from './extensions/AudioEffectManager';
//import TRTCMediaMixingManager from './extensions/MediaMixingManager';
//import TRTCPluginManager from './extensions/PluginManager';

const NodeTRTCEngine = require('./trtc_electron_sdk.node');
const Version = "12.2.703";

// 监听该事件，返回自定义视频渲染数据 ( bgra 格式)
// const CUSTOM_VIDEO_DATA = 'onVideoData';
// const LOCAL_VIDEO_DATA = 'onLocalVideoData';
// const CAMERA_DEVICE_TEST_VIEW = 'camera_device_test_view';
// const CAMERA_DEVICE_TEST_ID = 'camera_device_test';
// const LOCAL_USER_VIDEO_ID = 'local_video';

// const DEFAULT_VIDEO_WIDTH = 640;
// const DEFAULT_VIDEO_HEIGHT = 360;
const SDK_LOG_LEVEL = 2;

const genSecFunc = function (instance: any, key: string): any {
    return function () {
        let param = Array.from(arguments);
        let result = undefined;
        try {
            result = instance[key].apply(instance, param);
            if (result) return result;
        } catch (err: any) {
            logger.warn(err);
        }
    }
};

const copyMethods = function (instance: any): void {
    for (let key in instance) {
        if (typeof instance[key] != 'function' || key === 'constructor' || key.slice(0, 1) === '_' || typeof instance[key] != 'undefined') {
            continue;
        }
        instance[key] = genSecFunc(key, instance);
    }
};

let copyPropMethods = function (instance: any) {
    const disList = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(instance));
    for (let key in disList) {
        if (typeof instance[key] != 'function' || key === 'constructor' || key.slice(0, 1) === '_' || typeof instance[key] != 'undefined') {
            continue;
        }
        instance[key] = genSecFunc(key, instance);
    }
};

const secMethods = function (instance: any): void {
    copyMethods(instance);
    copyPropMethods(instance);
};

const formatLogParams = function (params: { [key: string]: string; }): string {
    let logParamsStr = '';
    const paramsKeyList = Object.keys(params);
    for (let i = 0; i < paramsKeyList.length; i++) {
        const paramKey = paramsKeyList[i];
        logParamsStr += `${paramKey}:${params[paramKey]}`;
        if (i !== paramsKeyList.length - 1) {
            logParamsStr += ',';
        }
    }
    return logParamsStr;
};

/**
 * 腾讯云视频通话功能的主要接口类
 *
 *
 * @example
 * // 创建/使用/销毁 TRTCCloud 对象的示例代码：
 * import TRTCCloud from 'trtc-electron-sdk';
 * const rtcCloud = TRTCCloud.getTRTCShareInstance();
 * // 获取 SDK 版本号
 * const version = rtcCloud.getSDKVersion();
 *
 */
class TRTCCloud extends EventEmitter {
    private logger: Logger;
    private id: number;
    private static isIPCMode: boolean = false;
    private static sharedTRTCCloudInstance: TRTCCloud | null;             // 全局共享实例
    private static subInstances: TRTCCloud[];                             // 子实例列表
    private stateStore: Map<string, any>;
    // C++层实例
    private rtcCloud: typeof NodeTRTCEngine.NodeTRTCCloud | typeof NodeTRTCEngine.NodeRemoteTRTCCloud;                
    //private videoRendererMap: Map<string, Map<HTMLElement, IRenderer>>    // 视频流的渲染器 Map<userId_stream, Map<HTML, IRenderer>>
    //private localFillMode: TRTCVideoFillMode;                             // 本地视频渲染模式
    //private remoteFillModeMap: Map<string, TRTCVideoFillMode>;            // 远端视频渲染模式 Map<userId, Map<stream key, TRTCVideoFillMode>
    //private imageData: null | ImageData;                                  // YUV（I420）转 RGB 格式时，用来记录中间数据和转换结果数据
    //private localVideoCallback: null | VideoRenderCallback;               // 本地视频自定义渲染回调函数
    //private remoteVideoCallback: Map<any, any>;                           // 远端视频自定义渲染回调函数
    //private isExternalRenderEnabled: boolean;                             // 是否开启外部渲染。如果开启，视频格式只支持 RGBA32 格式。
    //private pixelFormat: TRTCVideoPixelFormat;                            // 视频像素格式，支持：I420, BGRA32, RGBA32
    //private pixelLength: number;                                          // 视频像素的大小，单位：byte。I420: 1.5, BGRA32: 4, RGBA32: 4
    //private enableRenderFrame: boolean;                                   // 是否开启视频渲染
    //private screenCaptureStreamType: TRTCVideoStreamType;                 // 当前用户开启屏幕分享所使用的流类型：主流 or 辅流
    //private isScreenCapturing: boolean;                                   // 是否当前用户开启屏幕分享
    //private vodPlayers: { [key: string]: VodPlayer; };                    // Map，记录创建的 VodPlayer 实例
    // private localMediaTranscoder: TRTCLocalMediaTranscoder | null; // 本地合图实例
    //private isCaptureLocalVideoEnabled: boolean;
    //private videoProcessBufferType: TRTCVideoBufferType;                  // 视频预处理的缓存类型
    //private videoProcessPixelFormat: TRTCVideoPixelFormat;                // 视频预处理的编码类型
    //private videoRenderFPS: number;                                       // 视频渲染帧率
    //private localVideoRenderController: LocalVideoRenderController;       // 本地视频渲染控制器
    private deviceManager: TRTCDeviceManager;
    private audioEffectManager: TRTCAudioEffectManager;
    //private pluginManager: TRTCPluginManager;
    //private mediaMixingManager: TRTCMediaMixingManager | null;

    // 兼容 8.0 以下版本, 记录内部状态变量 --start
    //private localRotation: TRTCVideoRotation;
    //private localMirrorType: TRTCVideoMirrorType;
    //private remoteMainStreamFillMode: TRTCVideoFillMode;
    //private remoteMainStreamRotation: TRTCVideoRotation;
    //private remoteMainStreamMirrorType: TRTCVideoMirrorType;
    //private remoteSubStreamFillMode: TRTCVideoFillMode;
    //private remoteSubStreamRotation: TRTCVideoRotation;
    //private remoteSubStreamMirrorType: TRTCVideoMirrorType;
    //private priorRemoteVideoStreamType: TRTCVideoStreamType;
    private audioQuality: TRTCAudioQuality;
    private bgmId: number;
    private playAudioEffectIdList: number[];
    // 兼容 8.0 以下版本, 记录内部状态变量 --end

    // 视频渲染共享buffer
    // private remoteVideoBufferMap: Map<string, {
    //     big?: VideoBufferInfo;
    //     small?: VideoBufferInfo;
    //     sub?: VideoBufferInfo;
    // }>;
    // private localVideoBufferMap: {
    //     big: VideoBufferInfo;
    //     sub: VideoBufferInfo;
    //     cameraTest: VideoBufferInfo;
    // };

    /**
     * @param {TRTCInitConfig} [config] - 初始化参数，可选
     * @param {Record<string, any>} [config.networkProxy]  - 网络代理参数，可选。为空时，默认不开启网络代理。
     * @param {Boolean} [config.isIPCMode]  - 是否跨进程模式，跨进程模式支持本地混流且混流视频采用原生窗口渲染。默认：false，不开启。
     */
    constructor(config?: TRTCInitConfig) {
        super();
        this.id = !TRTCCloud.sharedTRTCCloudInstance ? 1 : (2 + (TRTCCloud.subInstances?.length || 0));
        this.logger = new Logger(`TRTC_${this.id}`);
        const componentNO = "";
        if (TRTCCloud.isIPCMode === null || TRTCCloud.isIPCMode === undefined) {
            TRTCCloud.isIPCMode  = config?.isIPCMode || false;
            if (TRTCCloud.isIPCMode) {
                NodeTRTCEngine.setRemoteTrtcWithAcrossProcessMode(TRTCCloud.isIPCMode);
            }
            logger.log(`TRTC use mode:${TRTCCloud.isIPCMode}`);
        }
        const newConfig = {
            jsVersion:Version,
            componentNO,
            ...config
        }
        if (!TRTCCloud.isIPCMode) {
            this.rtcCloud = new NodeTRTCEngine.NodeTRTCCloud(newConfig);
        } else {
            this.rtcCloud = new NodeTRTCEngine.NodeRemoteTRTCCloud(newConfig);
        }
        
        this.stateStore = new Map();
        // this.videoRendererMap = new Map();
        // this.pixelFormat = TRTCVideoPixelFormat.TRTCVideoPixelFormat_I420;
        // this.pixelLength = 1.5;
        // this.isExternalRenderEnabled = false;
        // this.localFillMode = TRTCVideoFillMode.TRTCVideoFillMode_Fit;
        // this.remoteFillModeMap = new Map();
        // this.localRotation = TRTCVideoRotation.TRTCVideoRotation0;
        // this.localMirrorType = TRTCVideoMirrorType.TRTCVideoMirrorType_Disable;
        // this.remoteMainStreamFillMode = TRTCVideoFillMode.TRTCVideoFillMode_Fit;
        // this.remoteMainStreamRotation = TRTCVideoRotation.TRTCVideoRotation0;
        // this.remoteMainStreamMirrorType = TRTCVideoMirrorType.TRTCVideoMirrorType_Disable;
        // this.remoteSubStreamFillMode = TRTCVideoFillMode.TRTCVideoFillMode_Fit;
        // this.remoteSubStreamRotation = TRTCVideoRotation.TRTCVideoRotation0;
        // this.remoteSubStreamMirrorType = TRTCVideoMirrorType.TRTCVideoMirrorType_Disable;
        // this.priorRemoteVideoStreamType = TRTCVideoStreamType.TRTCVideoStreamTypeBig;
        this.audioQuality = TRTCAudioQuality.TRTCAudioQualityDefault;
        // 生成一个足够大, 不会与用户输入重复的 id
        this.bgmId = 1 << 29;
        this.playAudioEffectIdList = [];
        // this.enableRenderFrame = true;
        // this.screenCaptureStreamType = TRTCVideoStreamType.TRTCVideoStreamTypeSub;
        // this.isScreenCapturing = false;
        // this.isCaptureLocalVideoEnabled = false;
        // this.videoProcessBufferType = TRTCVideoBufferType.TRTCVideoBufferType_Buffer;
        // this.videoProcessPixelFormat = TRTCVideoPixelFormat.TRTCVideoPixelFormat_I420;

        this.initEventHandler();
        this.logger.log('constructor sdk version:' + Version +
            '|native sdk version:' + this.rtcCloud.getSDKVersion());

        //视频数据回调
        //this.imageData = null;

        //VideoCallback 本地和远程
        //this.localVideoCallback = null;
        //this.remoteVideoCallback = new Map();
        //this.vodPlayers = {};
        secMethods(this);

        // 视频渲染共享buffer
        // this.remoteVideoBufferMap = new Map();
        // this.localVideoBufferMap = {
        //     big: new VideoBufferInfo(),
        //     sub: new VideoBufferInfo(),
        //     cameraTest: new VideoBufferInfo(),
        // }

        // 本地合图插件
        // this.localMediaTranscoder = null;

        // this.videoRenderFPS = 60;
        // this.onFPSChanged = this.onFPSChanged.bind(this);
        // videoRenderFPSMonitor.on('videoRenderFPS', this.onFPSChanged);

        this.callExperimentalAPI("{\"api\":\"setCurrentEnvironment\",\"params\" :{\"electron\":true}}");

        // this._localVideoRenderCallback = this._localVideoRenderCallback.bind(this);
        // this._remoteVideoRenderCallback = this._remoteVideoRenderCallback.bind(this);
        // this.localVideoRenderController = new LocalVideoRenderController(this);

        this.deviceManager = new TRTCDeviceManager({
            isIPCMode: TRTCCloud.isIPCMode,
            nodeTRTCCloud: this.rtcCloud,
        });
        this.audioEffectManager = new TRTCAudioEffectManager({
            isIPCMode: TRTCCloud.isIPCMode,
            nodeTRTCCloud: this.rtcCloud,
        });
        // this.pluginManager = new TRTCPluginManager({
        //     isIPCMode: TRTCCloud.isIPCMode,
        //     nodeTRTCCloud: this.rtcCloud,
        // });
        // if (TRTCCloud.isIPCMode) {
        //     this.mediaMixingManager = new TRTCMediaMixingManager({
        //         deviceManager: this.deviceManager,
        //         nodeTRTCCloud: this.rtcCloud,
        //     });
        // } else {
        //    this.mediaMixingManager = null;
        //}

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
    static getTRTCShareInstance(config?: TRTCInitConfig): TRTCCloud {
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
    static destroyTRTCShareInstance(): void {
        if (TRTCCloud.sharedTRTCCloudInstance) {
            TRTCCloud.sharedTRTCCloudInstance.destroy();
            TRTCCloud.sharedTRTCCloudInstance = null;
        }
    }

    // private onFPSChanged(options: {pageFPS: number; videoFPS: number}): void {
    //     this.videoRenderFPS = options.videoFPS !== -1 ? options.videoFPS : 60;
    //     if (!TRTCCloud.isIPCMode) {
    //         this.rtcCloud.setVideoRenderFPS(this.videoRenderFPS);
    //     }
    // }

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
    createSubCloud(config?: TRTCInitConfig): TRTCCloud {
        if (this !== TRTCCloud.sharedTRTCCloudInstance) {
            throw new Error("createSubCloud() can only be called on the main instance created by getTRTCShareInstance().");
        }
        if (TRTCCloud.isIPCMode) {
            throw new Error("createSubCloud() is not supported when `isIPCMode` is true.");
        }
        return new TRTCCloud(config);
    }

    /**
     * 获取 TRTC 配置对象
     *
     * 可以通过 TRTC 配置对象 {@link TRTCConfig} 打开 debug 模式
     *
     * @example
     * // Enable 'debug' mode
     * import TRTCCloud from 'trtc-electron-sdk';
     * const rtcCloud = TRTCCloud.getTRTCShareInstance();
     * rtcCloud.getConfigObject().setDebugMode(true);
     *
     * @returns {TRTCConfig}
     */
    // getConfigObject(): TRTCConfig {
    //     return renderUtilConfig;
    // }

    // setExternalRenderEnabled(enabled: boolean): void {
    //     this.isExternalRenderEnabled = enabled;
    //     this.localVideoRenderController.setExternalRenderEnabled(enabled);
    //     if (this.isExternalRenderEnabled) {
    //         this.pixelFormat = TRTCVideoPixelFormat.TRTCVideoPixelFormat_RGBA32;
    //         this.pixelLength = 4;
    //     } else {
    //         this.pixelFormat = TRTCVideoPixelFormat.TRTCVideoPixelFormat_I420;
    //         this.pixelLength = 1.5;
    //     }
    // }

    // setCaptureLocalVideoEnabled(enabled: boolean): void {
    //     this.isCaptureLocalVideoEnabled = enabled;
    // }

    /**
     * 销毁当前实例，释放资源
     */
    destroy(): void {
        if (this === TRTCCloud.sharedTRTCCloudInstance) {
            if (TRTCCloud.subInstances) {
                TRTCCloud.subInstances.forEach(sub => {
                    this.logger.log('destroy sub cloud');
                    sub.destroy();
                });
                TRTCCloud.subInstances = [];
            }
        } else {
            TRTCCloud.subInstances = TRTCCloud.subInstances.filter((item) => { return item != this });
        }
        //videoRenderFPSMonitor.off('videoRenderFPS', this.onFPSChanged);
        this.playAudioEffectIdList = [];
        //this.remoteFillModeMap.clear();
        // this.destroyLocalMediaTranscoder();
        this.rtcCloud.destroy();
        this.rtcCloud = null;

        this.deviceManager.destroy();
        this.audioEffectManager.destroy();
        //this.pluginManager.destroy();
        //this.mediaMixingManager?.destroy();
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
    initEventHandler(): void {
        this.rtcCloud.setTRTCCloudCallback((args: Array<string | { [key: string]: never }>) => {
            const key = args[0] as string;
            const data = args[1] as { [key: string]: never };
            switch (key) {
                case 'onError':
                    this.handleOnError(data.errCode, data.errMsg);
                    break;
                case 'onWarning':
                    this.handleOnWarning(data.warningCode, data.warningMsg, data.extraInfo);
                    break;
                case 'onEnterRoom':
                    this.handleOnEnterRoom(data.result);
                    break;
                case 'onExitRoom':
                    this.handleOnExitRoom(data.reason);
                    break;
                case 'onSwitchRoom':
                    this.handleOnSwitchRoom(data.errCode, data.errMsg);
                    break;
                case 'onSwitchRole':
                    this.handleOnSwitchRole(data.errCode, data.errMsg);
                    break;
                case 'onConnectOtherRoom':
                    this.handleOnConnectOtherRoom(data.userId, data.errCode, data.errMsg);
                    break;
                case 'onDisconnectOtherRoom':
                    this.handleOnDisconnectOtherRoom(data.errCode, data.errMsg);
                    break;
                case 'onRemoteUserEnterRoom':
                    this.handleOnRemoteUserEnterRoom(data.userId);
                    break;
                case 'onRemoteUserLeaveRoom':
                    this.handleOnRemoteUserLeaveRoom(data.userId, data.reason);
                    break;
                // case 'onUserVideoAvailable':
                //     this.handleOnUserVideoAvailable(data.userId, data.available === true ? 1 : 0);
                //     break;
                // case 'onUserSubStreamAvailable':
                //     this.handleOnUserSubStreamAvailable(data.userId, data.available === true ? 1 : 0);
                    break;
                case 'onUserAudioAvailable':
                    this.handleOnUserAudioAvailable(data.userId, data.available === true ? 1 : 0);
                    break;
                // case 'onFirstVideoFrame':
                //     this.handleOnFirstVideoFrame(data.userId, data.streamType, data.width, data.height);
                    break;
                case 'onFirstAudioFrame':
                    this.handleOnFirstAudioFrame(data.userId);
                    break;
                // case 'onSendFirstLocalVideoFrame':
                //     this.handleOnSendFirstLocalVideoFrame(data.streamType);
                    break;
                case 'onSendFirstLocalAudioFrame':
                    this.handleOnSendFirstLocalAudioFrame();
                    break;
                case 'onUserEnter':
                    this.handleOnUserEnter(data.userId);
                    break;
                case 'onUserExit':
                    this.handleOnUserExit(data.userId, data.reason);
                    break;
                case 'onConnectionLost':
                    this.handleOnConnectionLost();
                    break;
                case 'onTryToReconnect':
                    this.handleOnTryToReconnect();
                    break;
                case 'onConnectionRecovery':
                    this.handleOnConnectionRecovery();
                    break;
                // case 'onCameraDidReady':
                //     this.handleOnCameraDidReady();
                    break;
                case 'onMicDidReady':
                    this.handleOnMicDidReady();
                    break;
                case 'onDeviceChange':
                    this.handleOnDeviceChange(data.deviceId, data.type, data.state);
                    break;
                case 'onTestMicVolume':
                    this.handleOnTestMicVolume(data.volume);
                    break;
                case 'onTestSpeakerVolume':
                    this.handleOnTestSpeakerVolume(data.volume);
                    break;
                case 'onStartPublishing':
                    this.handleOnStartPublishing(data.err, data.errMsg);
                    break;
                case 'onStopPublishing':
                    this.handleOnStopPublishing(data.err, data.errMsg);
                    break;
                case 'onStartPublishCDNStream':
                    this.handleOnStartPublishCDNStream(data.errCode, data.errMsg);
                    break;
                case 'onStopPublishCDNStream':
                    this.handleOnStopPublishCDNStream(data.errCode, data.errMsg);
                    break;
                case 'onSetMixTranscodingConfig':
                    this.handleOnSetMixTranscodingConfig(data.err, data.errMsg);
                    break;
                case 'onAudioEffectFinished':
                    this.handleOnAudioEffectFinished(data.effectId, data.code);
                    break;
                case 'onStartPublishMediaStream':
                    this.handleOnStartPublishMediaStream(data.taskId, data.code, data.message);
                    break;
                case 'onUpdatePublishMediaStream':
                    this.handleOnUpdatePublishMediaStream(data.taskId, data.code, data.message);
                    break;
                case 'onStopPublishMediaStream':
                    this.handleOnStopPublishMediaStream(data.taskId, data.code, data.message);
                    break;
                case 'onCdnStreamStateChanged':
                    this.handleOnCdnStreamStateChanged(data.cdnUrl, data.status, data.code, data.msg);
                    break;
                // case 'onScreenCaptureCovered':
                //     this.handleOnScreenCaptureCovered();
                //     break;
                // case 'onScreenCaptureStarted':
                //     this.handleOnScreenCaptureStarted();
                //     break;
                // case 'onScreenCapturePaused':
                //     this.handleOnScreenCapturePaused(data.reason);
                //     break;
                // case 'onScreenCaptureResumed':
                //     this.handleOnScreenCaptureResumed(data.reason);
                //     break;
                // case 'onScreenCaptureStoped':
                //     this.handleOnScreenCaptureStopped(data.reason);
                //     break;
                // case 'onSnapshotComplete':
                //     this.handleOnSnapshotComplete(data.userId, data.type, data.data, data.width, data.height);
                //     break;
                case 'onAudioDeviceCaptureVolumeChanged':
                    this.handleOnAudioDeviceCaptureVolumeChanged(data.volume, data.muted);
                    break;
                case 'onAudioDevicePlayoutVolumeChanged':
                    this.handleOnAudioDevicePlayoutVolumeChanged(data.volume, data.muted);
                    break;
                case 'onSystemAudioLoopbackError':
                    this.handleOnSystemAudioLoopbackError(data.errCode);
                    break;
                case 'onLocalRecordBegin':
                    this.handleOnLocalRecordBegin(data.errCode, data.storagePath);
                    break;
                case 'onLocalRecording':
                    this.handleOnLocalRecording(data.duration, data.storagePath);
                    break;
                case 'onLocalRecordComplete':
                    this.handleOnLocalRecordComplete(data.errCode, data.storagePath);
                    break;
                case 'onNetworkQuality':
                    this.handleOnNetworkQuality(data.localQuality, data.remoteQuality);
                    break;
                case 'onStatistics':
                    this.handleOnStatistics(data.statistics);
                    break;
                case 'onUserVoiceVolume':
                    this.handleOnUserVoiceVolume(data.userVolumes, data.userVolumesCount, data.totalVolume);
                    break;
                case 'onRecvCustomCmdMsg':
                    this.handleOnRecvCustomCmdMsg(data.userId, data.cmdID, data.seq, data.message);
                    break;
                case 'onMissCustomCmdMsg':
                    this.handleOnMissCustomCmdMsg(data.userId, data.cmdID, data.errCode, data.missed);
                    break;
                // case 'onRecvSEIMsg':
                //     this.handleOnRecvSEIMsg(data.userId, data.message)
                //     break;
                case 'onSpeedTestResult':
                    this.handleOnSpeedTestResult(data.result);
                    break;
                default:
                    break;
            }
        });

        this.bindOnSpeedTest();
    }

    fire(event: string, ...args: any): void {
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
    handleOnError(errCode: number, errMsg: string) {
        this.fire('onError', errCode, errMsg);
    }

    /**
     * 警告回调：用于告知您一些非严重性问题，例如出现了卡顿或者可恢复的解码失败。
     *
     * @event TRTCCallback#onWarning
     * @param {Number} warningCode - 警告码
     * @param {String} warningMsg  - 警告信息
     * @param {Any} extra - 补充信息
     */
    handleOnWarning(warningCode: number, warningMsg: string, extra: any) {
        this.fire('onWarning', warningCode, warningMsg, extra);
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
    handleOnEnterRoom(result: number) {
        this.fire('onEnterRoom', result);
        const params = {
            js_version: Version,
            electron_version: process && process.versions && process.versions.electron || '',
            arch: process && process.arch || '',
            ua: window.navigator.userAgent
        };
        this.rtcCloud.callExperimentalAPI(JSON.stringify({
            api: 'reportOnlineLog',
            params: {
                level: SDK_LOG_LEVEL,
                msg: '[trtc-electron-sdk] trtcstats',
                more_msg: formatLogParams(params)
            }
        }));
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
    handleOnExitRoom(reason: number): void {
        this.fire('onExitRoom', reason);
    }

    /**
     * 切换房间的事件回调
     *
     * @event TRTCCallback#onSwitchRoom
     * @param {Number} errCode - 错误码，ERR_NULL 代表切换成功，其他请参见[错误码](https://cloud.tencent.com/document/product/647/32257)。
     * @param {String} errMsg  - 错误信息。
     */
    handleOnSwitchRoom(errCode: number, errMsg: string) {
        this.fire('onSwitchRoom', errCode, errMsg);
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
    handleOnSwitchRole(errCode: number, errMsg: string): void {
        this.logger.warn(`onSwitchRole errCode:${errCode} errMsg:${errMsg}`)
        this.fire('onSwitchRole', errCode, errMsg);
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
    handleOnConnectOtherRoom(userId: string, errCode: number, errMsg: string) {
        this.fire('onConnectOtherRoom', userId, errCode, errMsg);
    }

    /**
     * 关闭跨房连麦（主播跨房 PK）的结果回调
     *
     * @event TRTCCallback#onDisconnectOtherRoom
     * @param {Number} errCode - 错误码，ERR_NULL 代表切换成功，其他请参见 [错误码](https://cloud.tencent.com/document/product/647/32257)。
     * @param {String} errMsg  - 错误信息。
     */
    handleOnDisconnectOtherRoom(errCode: number, errMsg: string) {
        this.fire('onDisconnectOtherRoom', errCode, errMsg);
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
    handleOnRemoteUserEnterRoom(userId: string): void {
        this.fire('onRemoteUserEnterRoom', userId);
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
    handleOnRemoteUserLeaveRoom(userId: string, reason: number): void {
        this.fire('onRemoteUserLeaveRoom', userId, reason);
    }

    /**
     * 用户是否开启摄像头视频
     *
     * 当您收到 onUserVideoAvailable(userId, 1) 通知时，代表该路画面已经有可用的视频数据帧到达。
     * 之后，您需要调用 [startRemoteView()]{@link TRTCCloud#startRemoteView} 接口加载该用户的远程画面。
     * 再之后，您还会收到名为 onFirstVideoFrame(userId) 的首帧画面渲染回调。
     *
     * 当您收到了 onUserVideoAvailable(userId, 0) 通知时，代表该路远程画面已经被关闭，这可能是
     * 由于该用户调用了 [muteLocalVideo()]{@link TRTCCloud#muteLocalVideo} 或 [stopLocalPreview()]{@link TRTCCloud#stopLocalPreview} 所致。
     *
     * @event TRTCCallback#onUserVideoAvailable
     * @param {String}  userId    - 用户标识
     * @param {Number} available - 画面是否开启
     */
    // handleOnUserVideoAvailable(userId: string, available: number): void {
    //     this.logger.log(`onUserVideoAvailable userId:${userId} available:${available}`);
    //     if (available === 0) {
    //         const remoteUserVideoBuffers = this.remoteVideoBufferMap.get(userId);
    //         if (remoteUserVideoBuffers) {
    //             if (remoteUserVideoBuffers.big) {
    //                 this.rtcCloud.setRemoteVideoBuffer(
    //                     userId, remoteUserVideoBuffers.big.buffer, remoteUserVideoBuffers.big.streamType,
    //                     0, 0, remoteUserVideoBuffers.big.pixelFormat, remoteUserVideoBuffers.big.id
    //                 );
    //                 remoteUserVideoBuffers.big.buffer = null;
    //                 remoteUserVideoBuffers.big = undefined;
    //             }
    //             if (remoteUserVideoBuffers.small) {
    //                 this.rtcCloud.setRemoteVideoBuffer(
    //                     userId, remoteUserVideoBuffers.small.buffer, remoteUserVideoBuffers.small.streamType,
    //                     0, 0, remoteUserVideoBuffers.small.pixelFormat, remoteUserVideoBuffers.small.id
    //                 );
    //                 remoteUserVideoBuffers.small.buffer = null;
    //                 remoteUserVideoBuffers.small = undefined;
    //             }
    //             if (!remoteUserVideoBuffers.sub) {
    //                 this.remoteVideoBufferMap.delete(userId);
    //             }
    //         }
    //     }
    //     this.fire('onUserVideoAvailable', userId, available);
    // }

    /**
     * 用户是否开启了辅路画面（TRTCVideoStreamTypeSub，一般用于屏幕分享）
     *
     * 注意：显示辅路画面使用的函数是[startRemoteView()]{@link TRTCCloud#startRemoteView},  从 8.0 版本开始已不再推荐使用 [startRemoteSubStreamView()]{@link TRTCCloud#startRemoteSubStreamView}。
     *
     * @event TRTCCallback#onUserSubStreamAvailable
     * @param {String}  userId    - 用户标识
     * @param {Number} available - 辅路画面是否开启
     */
    // handleOnUserSubStreamAvailable(userId: string, available: number): void {
    //     this.logger.log(`onUserSubStreamAvailable userId:${userId} available:${available}`);
    //     if (available === 0) {
    //         const remoteVideoBuffers = this.remoteVideoBufferMap.get(userId);
    //         if (remoteVideoBuffers && remoteVideoBuffers.sub) {
    //             const targetVideoBuffer = remoteVideoBuffers.sub;
    //             if (targetVideoBuffer && targetVideoBuffer.buffer) {
    //                 this.rtcCloud.setRemoteVideoBuffer(
    //                     userId, targetVideoBuffer.buffer, targetVideoBuffer.streamType,
    //                     0, 0, targetVideoBuffer.pixelFormat, targetVideoBuffer.id
    //                 );
    //                 targetVideoBuffer.buffer = null;
    //             }
    //             remoteVideoBuffers.sub = undefined;
    //             if (!remoteVideoBuffers.big && !remoteVideoBuffers.small) {
    //                 this.remoteVideoBufferMap.delete(userId);
    //             }
    //         }
    //     }
    //     this.fire('onUserSubStreamAvailable', userId, available);
    // }

    /**
     * 用户是否开启音频上行
     *
     * @event TRTCCallback#onUserAudioAvailable
     * @param {String}  userId    - 用户标识
     * @param {Number} available - 声音是否开启
     */
    handleOnUserAudioAvailable(userId: string, available: number): void {
        this.logger.log(`onUserAudioAvailable userId:${userId} available:${available}`);
        this.fire('onUserAudioAvailable', userId, available);
    }

    /**
     * 开始渲染本地或远程用户的首帧画面
     *
     * 如果 userId 为 null，表示开始渲染本地采集的摄像头画面，需要您先调用 [startLocalPreview()]{@link TRTCCloud#startLocalPreview} 触发。
     * 如果 userId 不为 null，表示开始渲染远程用户的首帧画面，需要您先调用 [startRemoteView()]{@link TRTCCloud#startRemoteView} 触发。
     *
     * 注意：只有当您调用 startLocalPreview() 或 startRemoteView() 之后，才会触发该回调。
     *
     * @event TRTCCallback#onFirstVideoFrame
     * @param {String} userId     - 本地或远程用户 ID，如果 userId == '' 代表本地，userId != '' 代表远程。
     * @param {Number} streamType - 视频流类型，TRTCVideoStreamTypeBig：主路画面，一般用于摄像头；TRTCVideoStreamTypeSub：辅路画面，一般用于屏幕分享。
     * @param {Number} width      - 画面宽度
     * @param {Number} height     - 画面高度
     */
    // handleOnFirstVideoFrame(userId: string, streamType: number, width: number, height: number): void {
    //     this.logger.log(`onFirstVideoFrame userId:${userId} streamType:${streamType} width:${width} height:${height}`);
    //     if (userId) {
    //         this._setRemoteVideoBuffer(userId, streamType);
    //     }
    //     this.fire('onFirstVideoFrame', userId, streamType, width, height);
    // }

    /**
     * 开始播放远程用户的首帧音频（本地声音暂不通知）
     *
     * @event TRTCCallback#onFirstAudioFrame
     * @param {String} userId - 远程用户 ID。
     */
    handleOnFirstAudioFrame(userId: string): void {
        this.logger.log(`onFirstAudioFrame userId:${userId}`);
        this.fire('onFirstAudioFrame', userId);
    }

    /**
     * 首帧本地视频数据已经被送出
     *
     * SDK 会在 enterRoom() 并 startLocalPreview() 成功后开始摄像头采集，并将采集到的画面进行编码。
     * 当 SDK 成功向云端送出第一帧视频数据后，会抛出这个回调事件。
     *
     * @event TRTCCallback#onSendFirstLocalVideoFrame
     * @param {Number} streamType - - 视频流类型，TRTCVideoStreamTypeBig：主路画面，一般用于摄像头；TRTCVideoStreamTypeSub：辅路画面，一般用于屏幕分享。
     */
    // handleOnSendFirstLocalVideoFrame(streamType: number): void {
    //     this.logger.log(`onSendFirstLocalVideoFrame streamType:${streamType}`);
    //     this.fire('onSendFirstLocalVideoFrame', streamType);
    // }

    /**
     * 首帧本地音频数据已经被送出
     *
     * SDK 会在 enterRoom() 并 startLocalAudio() 成功后开始麦克风采集，并将采集到的声音进行编码。
     * 当 SDK 成功向云端送出第一帧音频数据后，会抛出这个回调事件。
     *
     * @event TRTCCallback#onSendFirstLocalAudioFrame
     */
    handleOnSendFirstLocalAudioFrame(): void {
        this.logger.log(`onSendFirstLocalAudioFrame`);
        this.fire('onSendFirstLocalAudioFrame');
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
    handleOnUserEnter(userId: string) {
        this.fire('onUserEnter', userId);
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
    handleOnUserExit(userId: string, reason: number) {
        this.fire('onUserExit', userId, reason);
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
    handleOnNetworkQuality(localQuality: TRTCQualityInfo, remoteQuality: Array<TRTCQualityInfo>) {
        this.fire('onNetworkQuality', localQuality, remoteQuality);
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
    handleOnStatistics(statis: TRTCStatistics) {
        this.fire('onStatistics', statis);
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
        this.fire('onConnectionLost');
    }

    /**
     * SDK 尝试重新连接到服务器
     *
     * @event TRTCCallback#onTryToReconnect
     */
    handleOnTryToReconnect() {
        this.fire('onTryToReconnect');
    }

    /**
     * SDK 跟服务器的连接恢复
     *
     * @event TRTCCallback#onConnectionRecovery
     */
    handleOnConnectionRecovery() {
        this.fire('onConnectionRecovery');
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
        // this.rtcCloud.onEvent('onSpeedTest', (
        //     currentResult: TRTCSpeedTestResult,
        //     finishedCount: number, totalCount: number
        // ) => {
        //     this.fire('onSpeedTest', currentResult, finishedCount, totalCount);
        // });
    }

    /**
     * 网速测试的结果回调
     *
     * 该统计回调由 startSpeedTest 触发。
     *
     * @event TRTCCallback#onSpeedTestResult
     * @param {TRTCSpeedTestResult} result 网速测试数据数据，包括丢包、往返延迟、上下行的带宽速率。
     */
    handleOnSpeedTestResult(result: TRTCSpeedTestResult) {
        this.fire('onSpeedTestResult', result);
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
    // handleOnCameraDidReady() {
    //     this.fire('onCameraDidReady');
    // }

    /**
     * 麦克风准备就绪
     *
     * @event TRTCCallback#onMicDidReady
     */
    handleOnMicDidReady() {
        this.fire('onMicDidReady');
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
    handleOnUserVoiceVolume(userVolumes: Array<TRTCVolumeInfo>, userVolumesCount: number, totalVolume: number) {
        this.fire('onUserVoiceVolume', userVolumes, userVolumesCount, totalVolume);
    }

    /**
     * 本地设备通断回调
     *
     * @event TRTCCallback#onDeviceChange
     * @param {String} deviceId - Windows 端返回设备名，Mac 端返回设备 ID
     * @param {TRTCDeviceType} type     - 设备类型
     * @param {TRTCDeviceState} state    - 事件类型
     */
    handleOnDeviceChange(
        deviceId: string,
        type: TRTCDeviceType,
        state: TRTCDeviceState
    ) {
        this.fire('onDeviceChange', deviceId, type, state);
    }

    /**
     * 麦克风测试音量回调
     *
     * 麦克风测试接口 [startMicDeviceTest()]{@link TRTCCloud#startMicDeviceTest} 会触发这个回调
     *
     * @event TRTCCallback#onTestMicVolume
     * @param {Number} volume - 音量值，取值范围0 - 100
     */
    handleOnTestMicVolume(volume: number) {
        this.fire('onTestMicVolume', volume);
    }

    /**
     * 扬声器测试音量回调
     *
     * 扬声器测试接口 [startSpeakerDeviceTest()]{@link TRTCCloud#startSpeakerDeviceTest} 会触发这个回调
     *
     * @event TRTCCallback#onTestSpeakerVolume
     * @param {Number} volume - 音量值，取值范围0 - 100
     */
    handleOnTestSpeakerVolume(volume: number) {
        this.fire('onTestSpeakerVolume', volume);
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
    handleOnAudioDeviceCaptureVolumeChanged(volume: number, muted: number) {
        this.fire('onAudioDeviceCaptureVolumeChanged', volume, muted);
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
    handleOnAudioDevicePlayoutVolumeChanged(volume: number, muted: number) {
        this.fire('onAudioDevicePlayoutVolumeChanged', volume, muted);
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
    handleOnRecvCustomCmdMsg(userId: string, cmdId: number, seq: number, msg: string) {
        this.fire('onRecvCustomCmdMsg', userId, cmdId, seq, msg);
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
    handleOnMissCustomCmdMsg(userId: string, cmdId: number, errCode: number, missed: number) {
        this.fire('onMissCustomCmdMsg', userId, cmdId, errCode, missed);
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
    // handleOnRecvSEIMsg(userId: string, message: string) {
    //     this.fire('onRecvSEIMsg', userId, message);
    // }

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
    handleOnStartPublishing(errCode: number, errMsg: string) {
        this.fire('onStartPublishing', errCode, errMsg);
    }

    /**
     * 停止向腾讯云的直播 CDN 推流的回调，对应于 TRTCCloud 中的 [stopPublishing()]{@link TRTCCloud#stopPublishing} 接口
     *
     * @event TRTCCallback#onStopPublishing
     * @param {Number} errCode - 0 表示成功，其余值表示失败
     * @param {String} errMsg  - 具体错误原因
     * @deprecated
     */
    handleOnStopPublishing(errCode: number, errMsg: string) {
        this.fire('onStopPublishing', errCode, errMsg);
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
    handleOnStartPublishCDNStream(errCode: number, errMsg: string) {
        this.fire('onStartPublishCDNStream', errCode, errMsg);
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
    handleOnStopPublishCDNStream(errCode: number, errMsg: string) {
        this.fire('onStopPublishCDNStream', errCode, errMsg);
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
    handleOnSetMixTranscodingConfig(errCode: number, errMsg: string) {
        this.fire('onSetMixTranscodingConfig', errCode, errMsg);
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
    private handleOnStartPublishMediaStream(taskId: string, code: number, message: string): void {
        this.fire('onStartPublishMediaStream', taskId, code, message);
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
    private handleOnUpdatePublishMediaStream(taskId: string, code: number, message: string): void {
        this.fire('onUpdatePublishMediaStream', taskId, code, message);
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
    private handleOnStopPublishMediaStream(taskId: string, code: number, message: string): void {
        this.fire('onStopPublishMediaStream', taskId, code, message);
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
    private handleOnCdnStreamStateChanged(cdnUrl: string, status: number, code: number, msg: string): void {
        this.fire('onCdnStreamStateChanged', cdnUrl, status, code, msg);
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
    handleOnAudioEffectFinished(effectId: number, code: number) {
        this.fire('onAudioEffectFinished', effectId, code);
    }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （十）屏幕分享回调
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 当屏幕分享窗口被遮挡无法正常捕获时，SDK 会通过此回调通知，可在此回调里通知用户移开遮挡窗口
     *
     * @event TRTCCallback#onScreenCaptureCovered
     */
    // handleOnScreenCaptureCovered() {
    //     this.fire('onScreenCaptureCovered');
    // }

    /**
     * 当屏幕分享开始时，SDK 会通过此回调通知
     *
     * @event TRTCCallback#onScreenCaptureStarted
     */
    // handleOnScreenCaptureStarted(): void {
    //     this.isScreenCapturing = true;
    //     // 只有在 Buffer 为 null 时才新建，否则只能在 handleVideoSizeChange 事件中重新申请 Buffer
    //     const currentUserId = '';
    //     const targetVideoBuffer = this.localVideoBufferMap.sub;
    //     if (targetVideoBuffer && !targetVideoBuffer.buffer) {
    //         targetVideoBuffer.userId = currentUserId;
    //         targetVideoBuffer.streamType = this.screenCaptureStreamType;
    //         targetVideoBuffer.buffer = allocBuffer(DEFAULT_VIDEO_WIDTH * DEFAULT_VIDEO_HEIGHT * this.pixelLength);
    //         targetVideoBuffer.id = generateUniqueId();
    //         targetVideoBuffer.pixelFormat = this.pixelFormat;
    //         targetVideoBuffer.width = DEFAULT_VIDEO_WIDTH;
    //         targetVideoBuffer.height = DEFAULT_VIDEO_HEIGHT;
    //         this.rtcCloud.setLocalVideoBuffer(
    //             targetVideoBuffer.userId, targetVideoBuffer.buffer, targetVideoBuffer.streamType, targetVideoBuffer.width,
    //             targetVideoBuffer.height, targetVideoBuffer.pixelFormat, targetVideoBuffer.id
    //         );
    //     }

    //     this.fire('onScreenCaptureStarted');
    // }

    /**
     * 当屏幕分享暂停时，SDK 会通过此回调通知
     *
     * @event TRTCCallback#onScreenCapturePaused
     * @param {Number} reason - 停止原因，0：表示用户主动暂停；1：注意此字段的含义在 MAC 和 Windows 平台有稍微差异。屏幕窗口不可见暂停（Mac）。表示设置屏幕分享参数导致的暂停（Windows）；2：表示屏幕分享窗口被最小化导致的暂停（仅 Windows）；3：表示屏幕分享窗口被隐藏导致的暂停（仅 Windows）
     */
    // handleOnScreenCapturePaused(reason: number) {
    //     this.fire('onScreenCapturePaused', reason);
    // }

    /**
     * 当屏幕分享恢复时，SDK 会通过此回调通知
     *
     * @event TRTCCallback#onScreenCaptureResumed
     * @param {Number} reason - 停止原因，0：表示用户主动恢复，1：表示屏幕分享参数设置完毕后自动恢复；2：表示屏幕分享窗口从最小化被恢复；3：表示屏幕分享窗口从隐藏被恢复
     */
    // handleOnScreenCaptureResumed(reason: number) {
    //     this.fire('onScreenCaptureResumed', reason);
    // }

    /**
     * 当屏幕分享停止时，SDK 会通过此回调通知
     *
     * @event TRTCCallback#onScreenCaptureStopped
     * @param {Number} reason - 停止原因，0：表示用户主动停止；1：表示屏幕分享窗口被关闭
     */
    // handleOnScreenCaptureStopped(reason: number) {
    //     if (this.isScreenCapturing) {
    //         const targetVideoBuffer = this.localVideoBufferMap.sub;
    //         if (targetVideoBuffer) {
    //             if (targetVideoBuffer.buffer) {
    //                 this.rtcCloud.setLocalVideoBuffer(
    //                     targetVideoBuffer.userId, targetVideoBuffer.buffer, targetVideoBuffer.streamType,
    //                     0, 0, targetVideoBuffer.pixelFormat, targetVideoBuffer.id
    //                 );
    //                 targetVideoBuffer.buffer = null;
    //             }
    //         }
    //         this.isScreenCapturing = false;
    //     }

    //     this.fire('onScreenCaptureStoped', reason);
    //     // 兼容旧版的单词拼写错误，避免旧版用户升级后无法触发回调
    //     this.fire('onScreenCaptureStopped', reason);
    // }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （十一）截图回调
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 截图完成时回调
     *
     * @event TRTCCallback#onSnapshotComplete
     *
     * @param {String} userId - 用户 ID，空字符串表示截取本地画面
     * @param {TRTCVideoStreamType} type - 视频流类型
     * @param {String} data  - 截图数据, base64 string
     * @param {Number} width  - 截图画面的宽度
     * @param {Number} height - 截图画面的高度
     */
    // handleOnSnapshotComplete(userId: string, type: TRTCVideoStreamType, buffer: ArrayBuffer, width: number, height: number) {
    //     const rgbData = this._BGRA2RGBA(buffer, width, height);
    //     const canvas = document.createElement('canvas');
    //     canvas.width = width;
    //     canvas.height = height;
    //     const ctx = canvas.getContext('2d');
    //     const tmpImage = new ImageData(rgbData, width, height);
    //     ctx && ctx.putImageData(tmpImage, 0, 0);
    //     const data = canvas.toDataURL();
    //     this.fire('onSnapshotComplete', userId, type, data, width, height);
    // }

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
    handleOnLocalRecordBegin(errCode: number, storagePath: string) {
        this.fire('onLocalRecordBegin', errCode, storagePath);
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
    handleOnLocalRecording(duration: BigInt, storagePath: string) {
        let newDuration = 0;
        try {
            newDuration = Number(duration);
        } catch (err) {
            this.logger.error('onLocalRecording duration convert error.', err);
            newDuration = 0;
        }
        this.fire('onLocalRecording', newDuration, storagePath);
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
    handleOnLocalRecordComplete(errCode: number, storagePath: string) {
        this.fire('onLocalRecordComplete', errCode, storagePath);
    }


    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （十三）系统音频分享回调
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 系统音频采集回调，SDK在采集失败时会抛出该事件回调，用于通知错误信息
     *
     * @event TRTCCallback#onSystemAudioLoopbackError
     *
     * @param {Number} errCode - 错误码含义
     * - ERR_AUDIO_PLUGIN_START_FAIL(-1330)  ：开启系统声音录制失败，例如音频驱动插件不可用
     * - ERR_AUDIO_PLUGIN_INSTALL_NOT_AUTHORIZED (-1331) ：未授权安装音频驱动插件
     * - ERR_AUDIO_PLUGIN_INSTALL_FAILED (-1332) ：安装音频驱动插件失败
     */
    handleOnSystemAudioLoopbackError(errCode: number) {
        this.fire('onSystemAudioLoopbackError', errCode);
    }

    // handleVideoSizeChange(userId: string, streamType: number, width: number, height: number) {
    //     this.logger.debug('handleVideoSizeChange', userId, streamType, width, height);
    //     if (userId && userId !== CAMERA_DEVICE_TEST_ID) {
    //         const remoteUserVideoBuffers = this.remoteVideoBufferMap.get(userId);
    //         if (remoteUserVideoBuffers) {
    //             if (streamType === TRTCVideoStreamType.TRTCVideoStreamTypeBig && remoteUserVideoBuffers.big) {
    //                 if (remoteUserVideoBuffers.big.width !== width || remoteUserVideoBuffers.big.height !== height) {
    //                     remoteUserVideoBuffers.big.buffer = allocBuffer(width * height * this.pixelLength);
    //                     remoteUserVideoBuffers.big.id = generateUniqueId();
    //                     remoteUserVideoBuffers.big.width = width;
    //                     remoteUserVideoBuffers.big.height = height;
    //                     remoteUserVideoBuffers.big.pixelFormat = this.pixelFormat;
    //                     this.rtcCloud.setRemoteVideoBuffer(
    //                         userId, remoteUserVideoBuffers.big.buffer, streamType,
    //                         width, height, remoteUserVideoBuffers.big.pixelFormat, remoteUserVideoBuffers.big.id
    //                     );
    //                 }
    //             } else if (streamType === TRTCVideoStreamType.TRTCVideoStreamTypeSmall && remoteUserVideoBuffers.small) {
    //                 if (remoteUserVideoBuffers.small.width !== width || remoteUserVideoBuffers.small.height !== height) {
    //                     remoteUserVideoBuffers.small.buffer = allocBuffer(width * height * this.pixelLength);
    //                     remoteUserVideoBuffers.small.id = generateUniqueId();
    //                     remoteUserVideoBuffers.small.width = width;
    //                     remoteUserVideoBuffers.small.height = height;
    //                     remoteUserVideoBuffers.small.pixelFormat = this.pixelFormat;
    //                     this.rtcCloud.setRemoteVideoBuffer(
    //                         userId, remoteUserVideoBuffers.small.buffer, streamType,
    //                         width, height, remoteUserVideoBuffers.small.pixelFormat, remoteUserVideoBuffers.small.id
    //                     );
    //                 }
    //             } else if (streamType === TRTCVideoStreamType.TRTCVideoStreamTypeSub && remoteUserVideoBuffers.sub) {
    //                 if (remoteUserVideoBuffers.sub.width !== width || remoteUserVideoBuffers.sub.height !== height) {
    //                     remoteUserVideoBuffers.sub.buffer = allocBuffer(width * height * this.pixelLength);
    //                     remoteUserVideoBuffers.sub.id = generateUniqueId();
    //                     remoteUserVideoBuffers.sub.width = width;
    //                     remoteUserVideoBuffers.sub.height = height;
    //                     remoteUserVideoBuffers.sub.pixelFormat = this.pixelFormat;
    //                     this.rtcCloud.setRemoteVideoBuffer(
    //                         userId, remoteUserVideoBuffers.sub.buffer, streamType,
    //                         width, height, remoteUserVideoBuffers.sub.pixelFormat, remoteUserVideoBuffers.sub.id
    //                     );
    //                 }
    //             }
    //         } else {
    //             this.logger.warn(`trtc:handleVideoSizeChange error: ${userId} ${streamType} buffer not exist`);
    //         }
    //     } else {
    //         // 本地用户
    //         if (this.isScreenCapturing && this.screenCaptureStreamType === streamType) {
    //             // 本地屏幕分享
    //             if (this.localVideoBufferMap.sub) {
    //                 if (this.localVideoBufferMap.sub.width !== width || this.localVideoBufferMap.sub.height !== height) {
    //                     this.localVideoBufferMap.sub.buffer = allocBuffer(width * height * this.pixelLength);
    //                     this.localVideoBufferMap.sub.id = generateUniqueId();
    //                     this.localVideoBufferMap.sub.width = width;
    //                     this.localVideoBufferMap.sub.height = height
    //                     this.localVideoBufferMap.sub.pixelFormat = this.pixelFormat;
    //                     this.rtcCloud.setLocalVideoBuffer(
    //                         '', this.localVideoBufferMap.sub.buffer, this.localVideoBufferMap.sub.streamType,
    //                         width, height, this.localVideoBufferMap.sub.pixelFormat, this.localVideoBufferMap.sub.id
    //                     );
    //                 }
    //             } else {
    //                 this.logger.error('trtc: current user screen-share video buffer not exist');
    //             }
    //         } else {
    //             if (userId === CAMERA_DEVICE_TEST_ID) {
    //                 // 摄像头检测
    //                 if (this.localVideoBufferMap.cameraTest.width !== width || this.localVideoBufferMap.cameraTest.height !== height) {
    //                     this.localVideoBufferMap.cameraTest.buffer = allocBuffer(width * height * this.pixelLength);
    //                     this.localVideoBufferMap.cameraTest.id = generateUniqueId();
    //                     this.localVideoBufferMap.cameraTest.width = width;
    //                     this.localVideoBufferMap.cameraTest.height = height;
    //                     this.localVideoBufferMap.cameraTest.pixelFormat = this.pixelFormat;
    //                     this.rtcCloud.setCameraTestVideoBuffer(
    //                         this.localVideoBufferMap.cameraTest.buffer, width, height,
    //                         this.localVideoBufferMap.cameraTest.pixelFormat, this.localVideoBufferMap.cameraTest.id
    //                     );
    //                 }
    //             } else {
    //                 // 本地摄像头
    //                 if (this.localVideoBufferMap.big.width !== width || this.localVideoBufferMap.big.height !== height) {
    //                     this.localVideoBufferMap.big.buffer = allocBuffer(width * height * this.pixelLength);
    //                     this.localVideoBufferMap.big.id = generateUniqueId();
    //                     this.localVideoBufferMap.big.width = width;
    //                     this.localVideoBufferMap.big.height = height;
    //                     this.localVideoBufferMap.big.pixelFormat = this.pixelFormat;
    //                     this.rtcCloud.setLocalVideoBuffer(
    //                         '', this.localVideoBufferMap.big.buffer, TRTCVideoStreamType.TRTCVideoStreamTypeBig,
    //                         width, height, this.localVideoBufferMap.big.pixelFormat, this.localVideoBufferMap.big.id
    //                     );
    //                 }
    //             }
    //         }
    //     }
    // }

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
    enterRoom(params: any, scene: TRTCAppScene) {
        if (params instanceof TRTCParams) {
            // params.streamId = params.streamId === '' ? null : params.streamId;
            this.rtcCloud.enterRoom(params, scene);
        } else {
            this.logger.error('trtc:enterRoom, params is not instanceof TRTCParams!');
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
    exitRoom(): void {
        // this.videoRendererMap.forEach((value, key) => {
        //     this._destroyRenderer(key, null);
        // })

        // this.remoteVideoBufferMap.forEach((value: { big?: VideoBufferInfo; small?: VideoBufferInfo; sub?: VideoBufferInfo }, key: string) => {
        //     if (value.big) {
        //         this.rtcCloud.setRemoteVideoBuffer(key, value.big.buffer, value.big.streamType, 0, 0, value.big.pixelFormat, value.big.id);
        //         value.big.buffer = null;
        //     }
        //     if (value.small) {
        //         this.rtcCloud.setRemoteVideoBuffer(key, value.small.buffer, value.small.streamType, 0, 0, value.small.pixelFormat, value.small.id);
        //         value.small.buffer = null;
        //     }
        //     if (value.sub) {
        //         this.rtcCloud.setRemoteVideoBuffer(key, value.sub.buffer, value.sub.streamType, 0, 0, value.sub.pixelFormat, value.sub.id);
        //         value.sub.buffer = null;
        //     }
        // });
        // this.remoteVideoBufferMap.clear();

        // if (this.localVideoBufferMap.big.buffer) {
        //     this.rtcCloud.setLocalVideoBuffer(
        //         '', this.localVideoBufferMap.big.buffer, this.localVideoBufferMap.big.streamType,
        //         0, 0, this.localVideoBufferMap.big.pixelFormat, this.localVideoBufferMap.big.id
        //     );
        //     this.localVideoBufferMap.big.buffer = null;
        //     this.localVideoBufferMap.big.id = 0;
        // }
        // if (this.localVideoBufferMap.sub.buffer) {
        //     this.rtcCloud.setLocalVideoBuffer(
        //         '', this.localVideoBufferMap.sub.buffer, this.localVideoBufferMap.sub.streamType,
        //         0, 0, this.localVideoBufferMap.sub.pixelFormat, this.localVideoBufferMap.sub.id
        //     );
        //     this.localVideoBufferMap.sub.buffer = null;
        //     this.localVideoBufferMap.sub.id = 0;
        // }

        // if (this.localVideoBufferMap.cameraTest.buffer) {
        //     this.rtcCloud.setCameraTestVideoBuffer(this.localVideoBufferMap.cameraTest.buffer, 0, 0, this.localVideoBufferMap.cameraTest.pixelFormat, this.localVideoBufferMap.cameraTest.id);
        //     this.localVideoBufferMap.cameraTest.buffer = null;
        //     this.localVideoBufferMap.cameraTest.id = 0;
        // }

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
    switchRoom(params: TRTCSwitchRoomParam) {
        this.rtcCloud.switchRoom(
            params.roomId, params.strRoomId, params.userSig, params.privateMapKey
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
    switchRole(role: TRTCRoleType) {
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
    connectOtherRoom(params: string) {
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
    setDefaultStreamRecvMode(autoRecvAudio: boolean, autoRecvVideo: boolean) {
        this.rtcCloud.setDefaultStreamRecvMode(autoRecvAudio, autoRecvVideo);
    }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （二）CDN 相关接口函数
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 开始发布媒体流
     * 
     * 该接口会向 TRTC 服务器发送指令，要求其将当前用户的音视频流转推/转码到直播 CDN 或者回推到 TRTC 房间中，您可以通过 [TRTCPublishTarget]{@link TRTCPublishTarget} 配置中的 [TRTCPublishMode]{@link TRTCPublishMode} 指定具体的发布模式。
     * 
     * 注意：
     * 1. SDK 会通过回调 [onStartPublishMediaStream]{@link TRTCCallback#event:onStartPublishMediaStream} 带给您后台启动的任务标识（即 taskId）。
     * 2. 同一个任务（TRTCPublishMode 与 TRTCPublishCdnUrl 均相同）仅支持启动一次。若您后续需要更新或者停止该项任务，需要记录并使用返回的 taskId，通过 [updatePublishMediaStream]{@link TRTCCloud#updatePublishMediaStream} 或者 [stopPublishMediaStream]{@link TRTCCloud#stopPublishMediaStream} 来操作。
     * 3. target 支持同时配置多个 CDN URL（最多同时 10 个）。若您的同一个转推/转码任务需要发布至多路 CDN，则仅需要在 target 中配置多个 CDN URL 即可。同一个转码任务即使有多个转推地址，对应的转码计费仍只收取一份。
     * 4. 使用时需要注意不要多个任务同时往相同的 URL 地址推送，以免引起异常推流状态。一种推荐的方案是 URL 中使用 “sdkappid_roomid_userid_main” 作为区分标识，这种命名方式容易辨认且不会在您的多个应用中发生冲突。
     * 
     * @example
     * // Publish big stream(camera video) to CDN
     * import TRTCCloud, { TRTCPublishMode } from 'trtc-electron-sdk';
     * const trtcCloud = TRTCCloud.getTRTCShareInstance();
     * 
     * let cdnTaskId = '';
     * trtcCloud.on('onStartPublishMediaStream', (taskId: string, code: number, message: string) => {
     *   if (code === 0) {
     *     cdnTaskId = taskId;
     *   } else {
     *     console.log('startPublishMediaStream error:', code, message);
     *   }
     * });
     * 
     * trtc.startPublishMediaStream({
     *   mode: TRTCPublishMode.TRTCPublishBigStreamToCdn,
     *   cdnUrlList: [{
     *     rtmpUrl: 'rtmp://<Your RTMP URL>',
     *     isInternalLine: true
     *   }],
     *   mixStreamIdentity: null
     * }, null, null);
     * 
     * @example
     * // Publish sub stream(screen sharing video) to CDN
     * import TRTCCloud, { TRTCPublishMode } from 'trtc-electron-sdk';
     * const trtcCloud = TRTCCloud.getTRTCShareInstance();
     * 
     * let cdnTaskId = '';
     * trtcCloud.on('onStartPublishMediaStream', (taskId: string, code: number, message: string) => {
     *   if (code === 0) {
     *     cdnTaskId = taskId;
     *   } else {
     *     console.log('startPublishMediaStream error:', code, message);
     *   }
     * });
     * 
     * trtc.startPublishMediaStream({
     *   mode: TRTCPublishMode.TRTCPublishSubStreamToCdn,
     *   cdnUrlList: [{
     *     rtmpUrl: 'rtmp://<Your RTMP URL>',
     *     isInternalLine: true
     *   }],
     *   mixStreamIdentity: null
     * }, null, null);
     * 
     * @example
     * // Publish and mixing multi-user video and audio to CDN
     * import TRTCCloud, { TRTCPublishMode } from 'trtc-electron-sdk';
     * const trtcCloud = TRTCCloud.getTRTCShareInstance();
     * 
     * let cdnTaskId = '';
     * trtcCloud.on('onStartPublishMediaStream', (taskId: string, code: number, message: string) => {
     *   if (code === 0) {
     *     cdnTaskId = taskId;
     *   } else {
     *     console.log('startPublishMediaStream error:', code, message);
     *   }
     * });
     * 
     * trtc.startPublishMediaStream(
     *   {
     *     mode: TRTCPublishMode.TRTCPublishMixStreamToCdn,
     *     cdnUrlList: [{
     *       rtmpUrl: 'rtmp://<Your RTMP URL>',
     *       isInternalLine: true
     *     }],
     *     mixStreamIdentity: null
     *   },
     *   {
     *     audioEncodedChannelNum: 2,
     *     audioEncodedCodecType: 0,
     *     audioEncodedKbps: 128,
     *     audioEncodedSampleRate: 48000,
     *     videoEncodedCodecType: 0,
     *     videoEncodedFPS: 30,
     *     videoEncodedGOP: 1,
     *     videoEncodedWidth: 1280,
     *     videoEncodedHeight: 720,
     *     videoEncodedKbps: 2000,
     *     videoSeiParams: "",
     *   },
     *   {
     *     "backgroundColor": 14362921,
     *     "backgroundImage": "",
     *     "videoLayoutList": [
     *       {
     *         "rect": { "top": 0, "left": 0, "right": 960, "bottom": 540 },
     *         "zOrder": 1,
     *         "fillMode": 0,
     *         "backgroundColor": 14483711,
     *         "placeHolderImage": "",
     *         "fixedVideoUser": { "userId": "windev", "intRoomId": 5055005, "strRoomId": "" },
     *         "fixedVideoStreamType": 0
     *       },
     *       {
     *         "rect": { "top": 360, "left": 640, "right": 1280, "bottom": 720 },
     *         "zOrder": 2,
     *         "fillMode": 0,
     *         "backgroundColor": 14480000,
     *         "placeHolderImage": "",
     *         "fixedVideoUser": { "userId": "macdev", "intRoomId": 5055005, "strRoomId": "" },
     *         "fixedVideoStreamType": 0
     *       }
     *     ],
     *     "audioMixUserList": [
     *       { "userId": "windev", "intRoomId": 5055005, "strRoomId": "" },
     *       { "userId": "macdev",  "intRoomId": 5055005,  "strRoomId": "" }
     *     ],
     *     "watermarkList": [
     *       {
     *         "watermarkUrl": "https://<Your watermark image URL>",
     *         "rect": { "top": 540, "left": 0, "right": 320, "bottom": 640 },
     *         "zOrder": 3
     *       }
     *     ]
     *   }
     * );
     * 
     * @param target {TRTCPublishTarget} - 媒体流发布的目标地址，支持转推/转码到腾讯或者第三方 CDN，也支持转码回推到 TRTC 房间中。
     * @param params {TRTCStreamEncoderParam|null} - 媒体流编码输出参数，转码和回推到 TRTC 房间中时为必填项，您需要指定您预期的转码输出参数。在转推时，为了更好的转推稳定性和 CDN 兼容性，也建议您进行配置。
     * @param config {TRTCStreamMixingConfig|null} - 媒体流转码配置参数，转码和回推到 TRTC 房间中时为必填项，您需要指定您预期的转码配置参数。转推模式下则无效。
     */
    startPublishMediaStream(
        target: TRTCPublishTarget,
        params: TRTCStreamEncoderParam | null,
        config: TRTCStreamMixingConfig | null
    ): void {
        this.logger.log(`startPublishMediaStream:`, target, params, config);
        this.rtcCloud.startPublishMediaStream(target, params, config);
    }

    /**
     * 更新发布媒体流
     * 
     * 该接口会向 TRTC 服务器发送指令，更新通过 [startPublishMediaStream]{@link TRTCCloud#startPublishMediaStream} 启动的媒体流
     * 
     * 注意：
     * 1. 您可以通过本接口来更新发布的 CDN URL（支持增删，最多同时 10 个），但您使用时需要注意不要多个任务同时往相同的 URL 地址推送，以免引起异常推流状态。
     * 2. 您可以通过 taskId 来更新调整转推/转码任务。例如在 pk 业务中，您可以先通过 [startPublishMediaStream]{@link startPublishMediaStream} 发起转推，接着在主播发起 pk 时，通过 taskId 和本接口将转推更新为转码任务。此时，CDN 播放将连续并且不会发生断流（您需要保持媒体流编码输出参数 `param` 一致）。
     * 3. 同一个任务不支持纯音频、音视频、纯视频之间的切换。
     * 
     * @example
     * // Publish and mixing multi-user video and audio to TRTC Room
     * import TRTCCloud, { TRTCPublishMode } from 'trtc-electron-sdk';
     * const trtcCloud = TRTCCloud.getTRTCShareInstance();
     * 
     * let cdnTaskId = '';
     * trtcCloud.on('onStartPublishMediaStream', (taskId: string, code: number, message: string) => {
     *   if (code === 0) {
     *     cdnTaskId = taskId;
     *   } else {
     *     console.log('startPublishMediaStream error:', code, message);
     *   }
     * });
     * 
     * trtc.updatePublishMediaStream(
     *   cdnTaskId,
     *   {
     *     mode: TRTCPublishMode.TRTCPublishMixStreamToRoom,
     *     cdnUrlList: [],
     *     mixStreamIdentity: { // Publish to TRTC Room
     *       "userId": "__robot__",
     *       "intRoomId": 5055005,
     *       "strRoomId": ""
     *     }
     *   },
     *   {
     *     audioEncodedChannelNum: 2,
     *     audioEncodedCodecType: 0,
     *     audioEncodedKbps: 128,
     *     audioEncodedSampleRate: 48000,
     *     videoEncodedCodecType: 0,
     *     videoEncodedFPS: 30,
     *     videoEncodedGOP: 1,
     *     videoEncodedWidth: 1280,
     *     videoEncodedHeight: 720,
     *     videoEncodedKbps: 2000,
     *     videoSeiParams: "",
     *   },
     *   {
     *     "backgroundColor": 14362921,
     *     "backgroundImage": "",
     *     "videoLayoutList": [
     *       {
     *         "rect": { "top": 0, "left": 0, "right": 960, "bottom": 540 },
     *         "zOrder": 1,
     *         "fillMode": 0,
     *         "backgroundColor": 14483711,
     *         "placeHolderImage": "",
     *         "fixedVideoUser": { "userId": "windev", "intRoomId": 5055005, "strRoomId": "" },
     *         "fixedVideoStreamType": 0
     *       },
     *       {
     *         "rect": { "top": 360, "left": 640, "right": 1280, "bottom": 720 },
     *         "zOrder": 2,
     *         "fillMode": 0,
     *         "backgroundColor": 14480000,
     *         "placeHolderImage": "",
     *         "fixedVideoUser": { "userId": "macdev", "intRoomId": 5055005, "strRoomId": "" },
     *         "fixedVideoStreamType": 0
     *       }
     *     ],
     *     "audioMixUserList": [
     *       { "userId": "windev", "intRoomId": 5055005, "strRoomId": "" },
     *       { "userId": "macdev",  "intRoomId": 5055005,  "strRoomId": "" }
     *     ],
     *     "watermarkList": [
     *       {
     *         "watermarkUrl": "https://<Your watermark image URL>",
     *         "rect": { "top": 540, "left": 0, "right": 320, "bottom": 640 },
     *         "zOrder": 3
     *       }
     *     ]
     *   }
     * );
     * 
     * @param taskId {String} - 通过回调 [onStartPublishMediaStream]{@link TRTCCallback#event:onStartPublishMediaStream} 带给您后台启动的任务标识（即 taskId）
     * @param target {TRTCPublishTarget|null} - 媒体流发布的目标地址，支持转推/转码到腾讯或者第三方 CDN，也支持转码回推到 TRTC 房间中。
     * @param params {TRTCStreamEncoderParam|null} - 媒体流编码输出参数，转码和回推到 TRTC 房间中时为必填项，您需要指定您预期的转码输出参数。在转推时，为了更好的转推稳定性和 CDN 兼容性，也建议您进行配置。
     * @param config {TRTCStreamMixingConfig|null} - 媒体流转码配置参数，转码和回推到 TRTC 房间中时为必填项，您需要指定您预期的转码配置参数。转推模式下则无效。
     */
    updatePublishMediaStream(
        taskId: string,
        target: TRTCPublishTarget | null,
        params: TRTCStreamEncoderParam | null,
        config: TRTCStreamMixingConfig | null
    ): void {
        this.logger.log(`updatePublishMediaStream:${taskId}`, target, params, config);
        this.rtcCloud.updatePublishMediaStream(taskId, target, params, config);
    }

    /**
     * 停止发布媒体流
     * 
     * 该接口会向 TRTC 服务器发送指令，停止通过 [startPublishMediaStream]{@link TRTCCloud#startPublishMediaStream} 启动的媒体流
     * 
     * 注意：
     * 1. 若您的业务后台并没有保存该 taskId，在您的主播异常退房重进后，如果您需要重新获取 taskId，您可以再次调用 [startPublishMediaStream]{@link TRTCCloud#startPublishMediaStream} 启动任务。此时 TRTC 后台会返回任务启动失败，同时带给您上一次启动的 taskId
     * 2. 若 taskId 填空字符串，将会停止该用户所有通过 [startPublishMediaStream]{@link TRTCCloud#startPublishMediaStream} 启动的媒体流，如果您只启动了一个媒体流或者想停止所有通过您启动的媒体流，推荐使用这种方式。
     * 
     * @param taskId {String} - 通过回调 [onStartPublishMediaStream]{@link TRTCCallback#event:onStartPublishMediaStream} 带给您后台启动的任务标识（即 taskId）
     */
    stopPublishMediaStream(taskId: string): void {
        this.logger.log(`stopPublishMediaStream:${taskId}`);
        this.rtcCloud.stopPublishMediaStream(taskId);
    }

    /**
     * 开始向腾讯云的直播 CDN 推流
     *
     * 该接口会指定当前用户的音视频流在腾讯云 CDN 所对应的 StreamId，进而可以指定当前用户的 CDN 播放地址。
     *
     * 例如：如果我们采用如下代码设置当前用户的主画面 StreamId 为 user_stream_001，那么该用户主画面对应的 CDN 播放地址为：
     * “http://yourdomain/live/user_stream_001.flv”，其中 yourdomain 为您自己备案的播放域名，
     * 您可以在直播[控制台](https://console.cloud.tencent.com/live) 配置您的播放域名，腾讯云不提供默认的播放域名。
     *
     * 您也可以在设置 enterRoom 的参数 TRTCParams 时指定 streamId, 而且我们更推荐您采用这种方案。
     *
     * 注意：您需要先在实时音视频 [控制台](https://console.cloud.tencent.com/trtc/) 中的功能配置页开启“启动自动旁路直播”才能生效。
     *
     * @example
     * let trtcCloud = TRTCCloud.getTRTCShareInstance();
     * trtcCloud.enterRoom(params, TRTCAppScene.TRTCAppSceneLIVE);
     * trtcCloud.startLocalPreview(view);
     * trtcCloud.startLocalAudio(TRTCAudioQuality.TRTCAudioQualityDefault);
     * trtcCloud.startPublishing("user_stream_001", TRTCVideoStreamType.TRTCVideoStreamTypeBig);
     *
     *
     * @param {String} streamId - 自定义流 ID。
     * @param {TRTCVideoStreamType} type - 仅支持 TRTCVideoStreamTypeBig 和 TRTCVideoStreamTypeSub。
     * @deprecated
     */
    startPublishing(streamId: string, type: TRTCVideoStreamType): void {
        this.rtcCloud.startPublishing(streamId, type);
    }

    /**
     * 停止向腾讯云的直播 CDN 推流
     * @deprecated
     */
    stopPublishing(): void {
        this.rtcCloud.stopPublishing();
    }

    /**
     * 开始向非腾讯云的直播 CDN 转推
     *
     * 该接口跟 startPublishing() 类似，但 startPublishCDNStream() 支持向非腾讯云的直播 CDN 转推。
     *
     * 注意：
     * - 使用 startPublishing() 绑定腾讯云直播 CDN 不收取额外的费用。
     * - 使用 startPublishCDNStream() 绑定非腾讯云直播 CDN 需要收取转推费用，且需要通过工单联系我们开通。
     *
     * @param {TRTCPublishCDNParam} param - 转推参数
     * @param {Number} param.appId - 腾讯云直播服务的 AppID
     * @param {Number} param.bizId - 腾讯云直播服务的 bizid
     * @param {String} param.url   - 指定该路音视频流在第三方直播服务商的推流地址，推流 URL 必须为 RTMP 格式，必须符合您的目标直播服务商的规范要求，否则目标服务商会拒绝来自 TRTC 后台服务的推流请求。
     * @param {String} param.streamId - 需要转推的 streamId，默认值：空值。如果不填写，则默认转推调用者的旁路流。
     * @deprecated
     */
    startPublishCDNStream(param: any): void {
        const streamId = param.streamId ? param.streamId.trim() : "";
        if (param instanceof TRTCPublishCDNParam) {
            this.rtcCloud.startPublishCDNStream(param);
        } else {
            this.logger.error('startPublishCDNStream, param is not instanceof TRTCPublishCDNParam!');
        }
    }

    /**
     * 停止向非腾讯云的直播 CDN 推流
     * @deprecated
     */
    stopPublishCDNStream(): void {
        this.rtcCloud.stopPublishCDNStream();
    }

    /**
     * 设置云端的混流转码参数
     *
     * 如果您在实时音视频 [控制台](https://console.cloud.tencent.com/trtc/) 中的功能配置页开启了“启动自动旁路直播”功能，
     * 房间里的每一路画面都会有一个默认的直播 [CDN 地址](https://cloud.tencent.com/document/product/647/16826)。
     *
     * 一个直播间中可能有不止一位主播，而且每个主播都有自己的画面和声音，但对于 CDN 观众来说，他们只需要一路直播流，
     * 所以您需要将多路音视频流混成一路标准的直播流，这就需要混流转码。
     *
     * 当您调用 setMixTranscodingConfig() 接口时，SDK 会向腾讯云的转码服务器发送一条指令，目的是将房间里的多路音视频流混合为一路,
     * 您可以通过 mixUsers 参数来调整每一路画面的位置，以及是否只混合声音，也可以通过 videoWidth、videoHeight、videoBitrate 等参数控制混合音视频流的编码参数。
     *
     * <pre>
     * 【画面1】=> 解码 ====> \
     *                         \
     * 【画面2】=> 解码 =>  画面混合 => 编码 => 【混合后的画面】
     *                         /
     * 【画面3】=> 解码 ====> /
     *
     * 【声音1】=> 解码 ====> \
     *                         \
     * 【声音2】=> 解码 =>  声音混合 => 编码 => 【混合后的声音】
     *                         /
     * 【声音3】=> 解码 ====> /
     * </pre>
     *
     * 参考文档：[云端混流转码](https://cloud.tencent.com/document/product/647/16827)。
     *
     * 注意：混流转码为收费功能，调用接口将产生云端混流转码费用，详见 [云端混流转码计费说明](https://cloud.tencent.com/document/product/647/49446)。
     *
     * @note 关于云端混流的注意事项：
     *  - 云端转码会引入一定的 CDN 观看延时，大概会增加1 - 2秒。
     *  - 调用该函数的用户，会将连麦中的多路画面混合到自己当前这路画面中。
     *
     * @param {TRTCTranscodingConfig} config - 请参考 trtc_define.js 中关于 TRTCTranscodingConfig 的介绍, 如果传入 null 取消云端混流转码。
     * @param {TRTCTranscodingConfigMode} config.mode - 转码 config 模式
     * @param {Number} config.appId - 腾讯云直播 AppID
     * @param {Number} config.bizId - 腾讯云直播 bizid
     * @param {Number} config.videoWidth   - 最终转码后的视频分辨率的宽度（px）
     * @param {Number} config.videoHeight  - 最终转码后的视频分辨率的高度（px）
     * @param {Number} config.videoBitrate - 最终转码后的视频分辨率的码率（kbps）
     * @param {Number} config.videoFramerate  - 最终转码后的视频分辨率的帧率（FPS）
     * @param {Number} config.videoGOP        - 最终转码后的视频分辨率的关键帧间隔（也被称为 GOP），单位秒
     * @param {Number} config.audioSampleRate - 最终转码后的音频采样率
     * @param {Number} config.audioBitrate    - 最终转码后的音频码率，单位：kbps
     * @param {Number} config.audioChannels   - 最终转码后的音频声道数
     * @param {Number} config.audioCodec      - 指定云端转码的输出流音频编码类型,默认为0
     * @param {String} config.backgroundColor   - 混合后画面的底色颜色，格式为十六进制数字，比如：“0x61B9F1” 代表 RGB 分别为(97,158,241)
     * @param {String} config.backgroundImage   - 混合后画面的背景图
     * @param {String} config.streamId          - 输出到 CDN 上的直播流 ID
     * @param {String} config.videoSeiParams    - 混流 SEI 参数，默认不填写
     * @param {TRTCMixUser[]} config.mixUsersArray - 每一路子画面的位置信息
     * @param {String}  config.mixUsersArray[].userId      - 参与混流的 userId
     * @param {String}  config.mixUsersArray[].roomId      - 参与混流的 roomId，跨房流传入的实际 roomId。当前房间流，请传入空字符串（roomId = ''）。
     * @param {Rect}  config.mixUsersArray[].rect        - 图层位置坐标以及大小，左上角为坐标原点(0,0) （绝对像素值）
     * @param {Number}  config.mixUsersArray[].rect.left   - 图层位置的左坐标
     * @param {Number}  config.mixUsersArray[].rect.top    - 图层位置的上坐标
     * @param {Number}  config.mixUsersArray[].rect.right  - 图层位置的右坐标
     * @param {Number}  config.mixUsersArray[].rect.bottom - 图层位置的下坐标
     * @param {Number}  config.mixUsersArray[].zOrder      - 图层层次（1 - 15）不可重复
     * @param {Boolean} config.mixUsersArray[].pureAudio   - 是否纯音频
     * @param {TRTCVideoStreamType} config.mixUsersArray[].streamType  - TRTCVideoStreamTypeBig：主路画面，一般用于摄像头；TRTCVideoStreamTypeSub：辅路画面，一般用于屏幕分享。
     * @param {TRTCMixInputType} config.mixUsersArray[].inputType   - 指定该路流的混合内容（只混音频、只混视频、混合音视频、混入水印）。TRTCMixInputTypePureAudio：只混音频；TRTCMixInputTypePureVideo：只混视频； TRTCMixInputTypeAudioVideo：混合音视频；TRTCMixInputTypeWatermark：混入水印。
     * @param {Number}  config.mixUsersArray[].renderMode  - 该画面在输出时的显示模式。视频流默认为0。0为裁剪，1为缩放，2为缩放并显示黑底。
     * @param {Number}  config.mixUsersArray[].soundLevel  - 该路音频参与混音时的音量等级（取值范围：0 - 100）,默认值：100。
     * @param {String}  config.mixUsersArray[].image       - 占位图是指当对应 userId 混流内容为纯音频时，混合后的画面中显示的是占位图片。水印图是指一张贴在混合后画面中的半透明图片，这张图片会一直覆盖于混合后的画面上。当指定 inputType 为 TRTCMixInputTypePureAudio 时，image 为占位图，此时需要您指定 userId。当指定 inputType 为 TRTCMixInputTypeWatermark 时，image 为水印图，此时不需要您指定 userId。
     * @deprecated
     */
    // setMixTranscodingConfig(config: Record<string, any>): void {
    //     if (config === null) {
    //         this.rtcCloud.setMixTranscodingConfig(null);
    //         return;
    //     }

    //     // configModeMap 为了兼容 TRTC_ 下划线用法
    //     const legacyConfigModeList = [
    //         TRTCTranscodingConfigMode.TRTC_TranscodingConfigMode_Unknown,
    //         TRTCTranscodingConfigMode.TRTC_TranscodingConfigMode_Manual,
    //         TRTCTranscodingConfigMode.TRTC_TranscodingConfigMode_Template_PureAudio,
    //         TRTCTranscodingConfigMode.TRTC_TranscodingConfigMode_Template_PresetLayout,
    //         TRTCTranscodingConfigMode.TRTC_TranscodingConfigMode_Template_ScreenSharing
    //     ]
    //     const legacyConfigModeMap: { [key: number]: TRTCTranscodingConfigMode } = {
    //         [TRTCTranscodingConfigMode.TRTC_TranscodingConfigMode_Unknown]: TRTCTranscodingConfigMode.TRTCTranscodingConfigMode_Unknown,
    //         [TRTCTranscodingConfigMode.TRTC_TranscodingConfigMode_Manual]: TRTCTranscodingConfigMode.TRTCTranscodingConfigMode_Manual,
    //         [TRTCTranscodingConfigMode.TRTC_TranscodingConfigMode_Template_PureAudio]: TRTCTranscodingConfigMode.TRTCTranscodingConfigMode_Template_PureAudio,
    //         [TRTCTranscodingConfigMode.TRTC_TranscodingConfigMode_Template_PresetLayout]: TRTCTranscodingConfigMode.TRTCTranscodingConfigMode_Template_PresetLayout,
    //         [TRTCTranscodingConfigMode.TRTC_TranscodingConfigMode_Template_ScreenSharing]: TRTCTranscodingConfigMode.TRTCTranscodingConfigMode_Unknown,
    //     };
    //     let configMode = config.mode;
    //     if (legacyConfigModeList.indexOf(configMode) !== -1) {
    //         configMode = legacyConfigModeMap[configMode];
    //     }

    //     if (config instanceof TRTCTranscodingConfig) {
    //         switch (configMode) {
    //             // 纯音频和屏幕分享模式不需要设置 mixUsersArray。
    //             case TRTCTranscodingConfigMode.TRTCTranscodingConfigMode_Template_PureAudio:
    //             case TRTCTranscodingConfigMode.TRTCTranscodingConfigMode_Template_ScreenSharing:
    //                 config.mixUsersArray = [];
    //                 break;
    //         }
    //         this.rtcCloud.setMixTranscodingConfig(config);
    //     } else {
    //         this.logger.error('setMixTranscodingConfig, config is not instanceof TRTCTranscodingConfig!');
    //     }
    // }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （三）视频相关接口函数
    //
    /////////////////////////////////////////////////////////////////////////////////
    // private _startLocalPreview(views: Array<HTMLElement>): void {
    //     const key = this._getKey(LOCAL_USER_VIDEO_ID, TRTCVideoStreamType.TRTCVideoStreamTypeBig);
    //     this._initRenderer(key, views);

    //     // view 为 null 时，可能启动了自定义渲染，所以 Buffer 还是要创建，否则自定义渲染就拿不到数据；
    //     // view 非 null 时，当然必须创建 Buffer
    //     // 只有在 Buffer 为 null 时才新建，否则只能在 handleVideoSizeChange 事件中重新申请 Buffer
    //     if (!this.localVideoBufferMap.big.buffer) {
    //         this.localVideoBufferMap.big.streamType = TRTCVideoStreamType.TRTCVideoStreamTypeBig;
    //         this.localVideoBufferMap.big.buffer = allocBuffer(DEFAULT_VIDEO_WIDTH * DEFAULT_VIDEO_HEIGHT * this.pixelLength);
    //         this.localVideoBufferMap.big.id = generateUniqueId();
    //         this.localVideoBufferMap.big.pixelFormat = this.pixelFormat;
    //         this.localVideoBufferMap.big.width = DEFAULT_VIDEO_WIDTH;
    //         this.localVideoBufferMap.big.height = DEFAULT_VIDEO_HEIGHT;
    //         this.rtcCloud.setLocalVideoBuffer(
    //             '', this.localVideoBufferMap.big.buffer, TRTCVideoStreamType.TRTCVideoStreamTypeBig,
    //             this.localVideoBufferMap.big.width, this.localVideoBufferMap.big.height, this.localVideoBufferMap.big.pixelFormat, this.localVideoBufferMap.big.id
    //         );
    //     }

    //     this.rtcCloud.startLocalPreview();
    // }

    /**
     * 启动本地摄像头采集和预览
     *
     * 这个接口会启动默认的摄像头，可以通过 [setCurrentCameraDevice()]{@link TRTCCloud#setCurrentCameraDevice} 接口选用其它摄像头
     * 当开始渲染首帧摄像头画面时，您会收到 TRTCCallback 中的 onFirstVideoFrame('') 回调。
     *
     * @param {Array<HTMLElement>|HTMLElement|null} views - 承载预览画面单个的 HTML 块节点或者 HTML 块节点数组
     *  - 如果传入 `null` 则不预览摄像头画面，但不影响摄像头采集
     */
    // startLocalPreview(views: Array<HTMLElement> | HTMLElement | null): void {
    //     this.logger.debug(`startLocalPreview`, views);
    //     if (views !== undefined) {
    //         if (views !== null) {
    //             if (Array.isArray(views)) {
    //                 this._startLocalPreview(views);
    //             } else {
    //                 this._startLocalPreview([views]);
    //             }
    //         } else {
    //             this._startLocalPreview([]);
    //         }
    //         this.localVideoRenderController.startLocalPreview(views);
    //     } else {
    //         this.logger.error('startLocalPreview parameter is undefined, it should be Array<HTMLElement>, HTMLElement or null');
    //     }
    // }

    /**
     * 停止本地摄像头采集和预览
     */
    // stopLocalPreview(): void {
    //     this.logger.debug(`stopLocalPreview`);
    //     const key = this._getKey(LOCAL_USER_VIDEO_ID, TRTCVideoStreamType.TRTCVideoStreamTypeBig);
    //     this._destroyRenderer(key, null);
    //     this.localVideoRenderController.stopLocalPreview();
    //     this.rtcCloud.stopLocalPreview();

    //     if (this.localVideoBufferMap.big.buffer) {
    //         this.rtcCloud.setLocalVideoBuffer(
    //             '', this.localVideoBufferMap.big.buffer, TRTCVideoStreamType.TRTCVideoStreamTypeBig,
    //             0, 0, this.localVideoBufferMap.big.pixelFormat, this.localVideoBufferMap.big.id
    //         );
    //         this.localVideoBufferMap.big.buffer = null;
    //         this.localVideoBufferMap.big.id = 0;
    //     }
    // }

    /**
     * 修改本地摄像头预览的 HTML 元素
     *
     * 本接口用于切换显示区域的交互场景中，修改本地摄像头预览的 HTML 元素。
     *
     * 注意：必须在调用 [startLocalPreview()]{@link TRTCCloud#startLocalPreview} 接口开启本地摄像头采集后，调用本接口才会生效。
     * - 如果用户调用 `startLocalPreview(views)` 接口开启了摄像头采集，则通过此接口可以修改摄像头采集视频渲染的 HTML 元素。
     * - 如果用户调用 `startLocalPreview(null)` 接口开启了摄像头采集，但未开启本地预览，支持调用此接口开启预览。
     *
     * @param {Array<HTMLElement>|HTMLElement|null} views - 承载预览画面单个的 HTML 块节点或者 HTML 块节点数组，传入 `null` 结束本地摄像头采集视频的预览。
     */
    // updateLocalView(views: Array<HTMLElement> | HTMLElement | null): void {
    //     this.logger.debug(`updateLocalView`, views);
    //     const key = this._getKey(LOCAL_USER_VIDEO_ID, TRTCVideoStreamType.TRTCVideoStreamTypeBig);
    //     if (views !== undefined) {
    //         if (views !== null) {
    //             if (Array.isArray(views)) {
    //                 this._initRenderer(key, views);
    //             } else {
    //                 this._initRenderer(key, [views]);
    //             }
    //         } else {
    //             this._destroyRenderer(key, null);
    //         }
    //         this.localVideoRenderController.updateLocalView(views);
    //     } else {
    //         this.logger.error('updateLocalView parameter is undefined, it should be Array<HTMLElement>, HTMLElement or null');
    //     }
    // }

    /**
     * 设置摄像头采集偏好
     *
     * 注意：目前只支持 `Windows` 系统
     *
     * @param {TRTCCameraCaptureParams} params - 摄像头采集参数
     */
    // setCameraCaptureParams(params: TRTCCameraCaptureParams): void {
    //     if (params && isNumber(params.mode) && isNumber(params.width) && isNumber(params.height)) {
    //         this.deviceManager.setCameraCaptureParam(params);
    //     } else {
    //         this.logger.error('setCameraCaptureParams invalid params:', params);
    //     }
    // }

    /**
     * 暂停/恢复发布本地的视频流
     *
     * 该接口可以暂停（或恢复）发布本地的视频画面，暂停之后，同一房间中的其他用户将无法继续看到自己画面。
     * 该接口在指定 TRTCVideoStreamTypeBig 时等效于 start/stopLocalPreview 这两个接口，但具有更好的响应速度。
     * 因为 start/stopLocalPreview 需要打开和关闭摄像头，而打开和关闭摄像头都是硬件设备相关的操作，非常耗时。
     * 相比之下，muteLocalVideo 只需要在软件层面对数据流进行暂停或者放行即可，因此效率更高，也更适合需要频繁打开关闭的场景。
     * 当暂停/恢复发布指定 TRTCVideoStreamTypeBig 后，同一房间中的其他用户将会收到 onUserVideoAvailable 回调通知。
     * 当暂停/恢复发布指定 TRTCVideoStreamTypeSub 后，同一房间中的其他用户将会收到 onUserSubStreamAvailable 回调通知。
     *
     * @param {Boolean}             mute        - true：屏蔽；false：开启，默认值：false
     * @param {TRTCVideoStreamType} streamType  - 要暂停/恢复的视频流类型, 仅支持 TRTCVideoStreamTypeBig 和 TRTCVideoStreamTypeSub
     */
    // muteLocalVideo(mute: boolean, streamType?: TRTCVideoStreamType): void {
    //     let newStreamType = streamType;
    //     if (newStreamType === undefined) {
    //         newStreamType = TRTCVideoStreamType.TRTCVideoStreamTypeBig
    //     }
    //     this.rtcCloud.muteLocalVideo(newStreamType, mute);
    // }

    /**
     * 设置本地画面被暂停期间的替代图片
     *
     * 当您调用 `muteLocalVideo(true)` 暂停本地画面时，您可以通过调用本接口设置一张替代图片，设置后，房间中的其他用户会看到这张替代图片，而不是黑屏画面。
     *
     * @param {TRTCImageBuffer} imageBuffer - 设置替代图片，空值代表在 muteLocalVideo 之后不再发送视频流数据，默认值为空。
     * @param {Number} fps - 设置替代图片帧率，最小值为5，最大值为10，默认5。
     */
    // setVideoMuteImage(imageBuffer: TRTCImageBuffer | null, fps: number): void {
    //     if (typeof fps !== 'number') {
    //         fps = 5;
    //     }
    //     if (fps < 5) {
    //         fps = 5;
    //     }
    //     if (fps > 10) {
    //         fps = 10;
    //     }
    //     this.rtcCloud.setVideoMuteImage(imageBuffer, fps);
    // }

    // private _calcRemoteVideoRendererStreamType(streamType: TRTCVideoStreamType): TRTCVideoStreamType {
    //     let rendererStreamType = streamType;
    //     if (rendererStreamType === TRTCVideoStreamType.TRTCVideoStreamTypeSmall) {
    //         // 如果拉取小流, 绑定 render 时也采用大流， 防止大小流切换后无法找到对应 render 进行渲染
    //         // 这里的逻辑和 _onRenderFrame 里, 获取 render 是不论小流还是大流， 都采用大流取获取 render 有关
    //         rendererStreamType = TRTCVideoStreamType.TRTCVideoStreamTypeBig;
    //     }
    //     return rendererStreamType;
    // }

    // private _startRemoteView(userId: string, views: Array<HTMLElement>, streamType?: TRTCVideoStreamType): void {
    //     if (streamType === undefined) {
    //         streamType = this.priorRemoteVideoStreamType;
    //     }
    //     const rendererStreamType = this._calcRemoteVideoRendererStreamType(streamType);
    //     const key = this._getKey(userId, rendererStreamType);
    //     this._initRenderer(key, views);

    //     // view 为 null 时，可能启动了自定义渲染，所以 Buffer 还是要创建，否则自定义渲染就拿不到数据；
    //     // view 非 null 时，当然必须创建 Buffer
    //     this._setRemoteVideoBuffer(userId, streamType);

    //     this.addRemoteVideoRenderCallback(userId);
    //     this.rtcCloud.startRemoteView(userId, streamType);
    // }

    /**
     * 开始显示远端视频画面
     *
     * 在收到 SDK 的 onUserVideoAvailable(userId, 1) 通知时，可以获知该远程用户开启了视频，
     * 此后调用 startRemoteView(userId, views, streamType) 接口加载该用户的远程画面时，可以用 loading 动画优化加载过程中的等待体验。
     * 待该用户的首帧画面开始显示时，您会收到 onFirstVideoFrame(userId) 事件回调。
     *
     * @param {String}      userId - 对方的用户标识
     * @param {Array<HTMLElement>|HTMLElement|null} views   - 承载预览画面单个的 HTML 块节点或者 HTML 块节点数组
     *  - 如果传入 `null` 则不预览远端用户画面，但不影响拉取远端视频，适合需要自定义渲染的场景
     * @param {TRTCVideoStreamType} streamType   - 视频流类型
     */
    // startRemoteView(userId: string, views: Array<HTMLElement> | HTMLElement | null, streamType?: TRTCVideoStreamType): void {
    //     this.logger.debug(`startRemoteView userId:${userId} streamType:${streamType}`, views);
    //     if (views !== undefined) {
    //         if (views !== null) {
    //             if (Array.isArray(views)) {
    //                 this._startRemoteView(userId, views, streamType);
    //             } else {
    //                 this._startRemoteView(userId, [views], streamType);
    //             }
    //         } else {
    //             this._startRemoteView(userId, [], streamType);
    //         }
    //     } else {
    //         this.logger.error('startRemoteView parameter "views" is undefined, it should be Array<HTMLElement>, HTMLElement or null');
    //     }
    // }

    /**
     * 停止显示远端视频画面，同时不再拉取该远端用户的视频数据流
     *
     * 调用此接口后，SDK 会停止接收该用户的远程视频流，同时会清理相关的视频显示资源。
     *
     * @param {String} userId - 对方的用户标识
     * @param {TRTCVideoStreamType} streamType - 视频流类型
     */
    // stopRemoteView(userId: string, streamType?: TRTCVideoStreamType): void {
    //     this.logger.log(`stopRemoteView userId:${userId} streamType:${streamType}`);
    //     if (streamType === undefined) {
    //         streamType = this.priorRemoteVideoStreamType;
    //     }
    //     const key = this._getKey(userId, streamType);
    //     this._destroyRenderer(key, null);
    //     this.rtcCloud.stopRemoteView(userId, streamType);

    //     const remoteUserVideoBuffers = this.remoteVideoBufferMap.get(userId);
    //     if (remoteUserVideoBuffers) {
    //         if (streamType === TRTCVideoStreamType.TRTCVideoStreamTypeBig && remoteUserVideoBuffers.big) {
    //             this.rtcCloud.setRemoteVideoBuffer(
    //                 userId, remoteUserVideoBuffers.big.buffer, remoteUserVideoBuffers.big.streamType,
    //                 0, 0, remoteUserVideoBuffers.big.pixelFormat, remoteUserVideoBuffers.big.id
    //             );
    //             remoteUserVideoBuffers.big.buffer = null;
    //             remoteUserVideoBuffers.big = undefined;

    //         } else if (streamType === TRTCVideoStreamType.TRTCVideoStreamTypeSmall && remoteUserVideoBuffers.small) {
    //             this.rtcCloud.setRemoteVideoBuffer(
    //                 userId, remoteUserVideoBuffers.small.buffer, remoteUserVideoBuffers.small.streamType,
    //                 0, 0, remoteUserVideoBuffers.small.pixelFormat, remoteUserVideoBuffers.small.id
    //             );
    //             remoteUserVideoBuffers.small.buffer = null;
    //             remoteUserVideoBuffers.small = undefined;
    //         } else if (streamType === TRTCVideoStreamType.TRTCVideoStreamTypeSub && remoteUserVideoBuffers.sub) {
    //             this.rtcCloud.setRemoteVideoBuffer(
    //                 userId, remoteUserVideoBuffers.sub.buffer, remoteUserVideoBuffers.sub.streamType,
    //                 0, 0, remoteUserVideoBuffers.sub.pixelFormat, remoteUserVideoBuffers.sub.id
    //             );
    //             remoteUserVideoBuffers.sub.buffer = null;
    //             remoteUserVideoBuffers.sub = undefined;
    //         }
    //         if (!remoteUserVideoBuffers.big && !remoteUserVideoBuffers.small && !remoteUserVideoBuffers.sub) {
    //             this.remoteVideoBufferMap.delete(userId);
    //         }
    //     } else {
    //         this.logger.warn(`trtc:stopRemoteView(${userId}, ${streamType}) no render buffer need to clear`);
    //     }
    // }

    /**
     * 修改远端视频渲染的 HTML 元素
     * 本接口用于切换显示区域的交互场景中，修改远端视频渲染的 HTML 元素。
     *
     * 注意：必须调用 [startRemoteView()]{@link TRTCCloud#startRemoteView} 订阅了远端视频流之后，调用此接口才会生效。
     *
     * @param {String} userId - 远端视频流的用户 ID
     * @param {Array<HTMLElement>|HTMLElement|null} views - 承载预览画面单个的 HTML 块节点或者 HTML 块节点数组，传入 `null` 结束远端视频的渲染
     * @param {TRTCVideoStreamType} streamType - 视频流类型
     *
     */
    // updateRemoteView(userId: string, views: Array<HTMLElement> | HTMLElement | null, streamType: TRTCVideoStreamType): void {
    //     this.logger.debug(`updateRemoteView userId:${userId} streamType:${streamType}`, views);
    //     const rendererStreamType = this._calcRemoteVideoRendererStreamType(streamType);
    //     const key = this._getKey(userId, rendererStreamType);
    //     if (views !== undefined) {
    //         if (views !== null) {
    //             if (Array.isArray(views)) {
    //                 this._initRenderer(key, views);
    //             } else {
    //                 this._initRenderer(key, [views]);
    //             }
    //         } else {
    //             this._destroyRenderer(key, null);
    //         }
    //     } else {
    //         this.logger.error('updateRemoteView parameter "views" is undefined, it should be Array<HTMLElement>, HTMLElement or null');
    //     }
    // }

    /**
     * 停止显示所有远端视频画面，同时不再拉取该远端用户的视频数据流
     *
     * 注意：如果有屏幕分享的画面在显示，则屏幕分享的画面也会一并被关闭。
     *
     */
    // stopAllRemoteView(): void {
    //     this.videoRendererMap.forEach((value, key) => {
    //         if (key.indexOf('local') !== 0) {
    //             this._destroyRenderer(key, null);
    //         }
    //     })
    //     this.rtcCloud.stopAllRemoteView();

    //     this.remoteVideoBufferMap.forEach((value: { big?: VideoBufferInfo; small?: VideoBufferInfo; sub?: VideoBufferInfo }, key: string) => {
    //         if (value.big) {
    //             this.rtcCloud.setRemoteVideoBuffer(key, value.big.buffer, value.big.streamType, 0, 0, value.big.pixelFormat, value.big.id);
    //             value.big.buffer = null;
    //         }
    //         if (value.small) {
    //             this.rtcCloud.setRemoteVideoBuffer(key, value.small.buffer, value.small.streamType, 0, 0, value.small.pixelFormat, value.small.id);
    //             value.small.buffer = null;
    //         }
    //         if (value.sub) {
    //             this.rtcCloud.setRemoteVideoBuffer(key, value.sub.buffer, value.sub.streamType, 0, 0, value.sub.pixelFormat, value.sub.id);
    //             value.sub.buffer = null;
    //         }
    //     });
    //     this.remoteVideoBufferMap.clear();
    // }

    /**
     * 暂停接收指定的远端视频流
     *
     * 该接口仅停止接收远程用户的视频流，但并不释放显示资源，所以视频画面会冻屏在 mute 前的最后一帧。
     *
     * @param {String}  userId - 对方的用户标识
     * @param {Boolean} mute   - 是否停止接收
     * @param {TRTCVideoStreamType} streamType   - 视频流类型
     */
    // muteRemoteVideoStream(userId: string, mute: boolean, streamType?: TRTCVideoStreamType): void {
    //     let newStreamType = streamType;
    //     if (newStreamType === undefined) {
    //         newStreamType = TRTCVideoStreamType.TRTCVideoStreamTypeBig;
    //     }
    //     this.rtcCloud.muteRemoteVideoStream(userId, newStreamType, mute);
    // }

    /**
     * 停止接收所有远端视频流
     *
     * @param {Boolean} mute - 是否停止接收
     */
    // muteAllRemoteVideoStreams(mute: boolean): void {
    //     this.rtcCloud.muteAllRemoteVideoStreams(mute);
    // }

    /**
     * 设置视频编码器相关参数
     *
     * 该设置决定了远端用户看到的画面质量（同时也是云端录制出的视频文件的画面质量）
     *
     * @param {TRTCVideoEncParam} params - 视频编码参数
     * @param {TRTCVideoResolution} params.videoResolution - 视频分辨率
     * @param {TRTCVideoResolutionMode} params.resMode - 分辨率模式（横屏分辨率 - 竖屏分辨率）
     * - TRTCVideoResolutionModeLandscape: 横屏分辨率
     * - TRTCVideoResolutionModePortrait : 竖屏分辨率
     * @param {Number} params.videoFps     - 视频采集帧率
     * @param {Number} params.videoBitrate - 视频上行码率
     * @param {Number} params.minVideoBitrate - 视频最小码率
     * @param {Boolean} params.enableAdjustRes - 是否允许动态调整分辨率，默认值：关闭。
     */
    // setVideoEncoderParam(params: any): void {
    //     if (params instanceof TRTCVideoEncParam) {
    //         this.rtcCloud.setVideoEncoderParam(params);
    //     } else {
    //         this.logger.error('setVideoEncoderParam, params is not instanceof TRTCVideoEncParam!');
    //     }
    // }

    /**
     * 设置网络流控相关参数
     *
     * 该设置决定了 SDK 在各种网络环境下的调控策略（例如弱网下是“保清晰”还是“保流畅”）
     *
     * @param {TRTCNetworkQosParam} params - 网络流控参数
     * @param {TRTCVideoQosPreference} params.preference - 弱网下是“保清晰”还是“保流畅”
     * - TRTCVideoQosPreferenceSmooth: 弱网下保流畅，在遭遇弱网环境时首先确保声音的流畅和优先发送，画面会变得模糊且会有较多马赛克，但可以保持流畅不卡顿。
     * - TRTCVideoQosPreferenceClear : 弱网下保清晰，在遭遇弱网环境时，画面会尽可能保持清晰，但可能会更容易出现卡顿。
     * @param {TRTCQosControlMode} params.controlMode - 流控模式（云端控制 - 客户端控制）
     * - TRTCQosControlModeClient: 客户端控制（用于 SDK 开发内部调试，客户请勿使用）
     * - TRTCQosControlModeServer: 云端控制 （默认）
     */
    setNetworkQosParam(params: any): void {
        if (params instanceof TRTCNetworkQosParam) {
            this.rtcCloud.setNetworkQosParam(params);
        } else {
            this.logger.error('setNetworkQosParam, params is not instanceof TRTCNetworkQosParam!');
        }
    }

    /**
     * 设置本地图像（主流）的渲染参数
     *
     * @param {TRTCRenderParams} params - 本地图像的参数
     * @param {TRTCVideoRotation} params.rotation - 视频画面旋转方向
     * @param {TRTCVideoFillMode} params.fillMode     - 视频画面填充模式
     * @param {TRTCVideoMirrorType} params.mirrorType - 画面渲染镜像类型
     */
    // setLocalRenderParams(params: TRTCRenderParams): void {
    //     this.localFillMode = params.fillMode;
    //     this.localRotation = params.rotation;
    //     this.localMirrorType = params.mirrorType;

    //     this.setLocalViewFillMode(params.fillMode);
    //     this.rtcCloud.setLocalRenderParams(params);
    // }

    /**
     * 废弃接口： 设置本地图像的渲染模式
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 setLocalRenderParams 接口替代。
     * @param {TRTCVideoFillMode} mode - 填充（画面可能会被拉伸裁剪）或适应（画面可能会有黑边），默认值：TRTCVideoFillMode_Fit
     * - TRTCVideoFillMode_Fill: 图像铺满屏幕，超出显示视窗的视频部分将被截掉，所以画面显示可能不完整。
     * - TRTCVideoFillMode_Fit: 图像长边填满屏幕，短边区域会被填充黑色，但画面的内容肯定是完整的。
     */
    // setLocalViewFillMode(mode: TRTCVideoFillMode): void {
    //     this.localFillMode = mode;
    //     const key = this._getKey(LOCAL_USER_VIDEO_ID, TRTCVideoStreamType.TRTCVideoStreamTypeBig);
    //     const rendererMap = this.videoRendererMap.get(key);
    //     if (rendererMap) {
    //         rendererMap.forEach((value: IRenderer) => {
    //             value.setContentMode(mode);
    //         })
    //     }
    // }

    /**
     * 设置远端画面的渲染模式
     *
     * @param {String} userId - 用户 ID
     * @param {TRTCVideoStreamType} streamType - 视频流类型
     * @param {TRTCRenderParams} params - 本地画面渲染参数
     * @param {TRTCVideoRotation} params.rotation - 视频画面旋转方向
     * @param {TRTCVideoFillMode} params.fillMode     - 视频画面填充模式
     * @param {TRTCVideoMirrorType} params.mirrorType - 画面渲染镜像类型
     */
    // setRemoteRenderParams(userId: string, streamType: TRTCVideoStreamType, params: TRTCRenderParams): void {
    //     if (streamType === TRTCVideoStreamType.TRTCVideoStreamTypeBig) {
    //         this.remoteMainStreamFillMode = params.fillMode;
    //         this.remoteMainStreamRotation = params.rotation;
    //         this.remoteMainStreamMirrorType = params.mirrorType;
    //         this.setRemoteViewFillMode(userId, params.fillMode);
    //     } else if (streamType === TRTCVideoStreamType.TRTCVideoStreamTypeSub) {
    //         this.remoteSubStreamFillMode = params.fillMode;
    //         this.remoteSubStreamRotation = params.rotation;
    //         this.remoteSubStreamMirrorType = params.mirrorType;
    //         this.setRemoteSubStreamViewFillMode(userId, params.fillMode);
    //     }

    //     this.rtcCloud.setRemoteRenderParams(userId, streamType, params);
    // }

    /**
     * 废弃接口： 设置远端图像的渲染模式
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 setRemoteRenderParams 接口替代。
     * @param {String} userId - 用户 ID
     * @param {TRTCVideoFillMode} mode - 填充（画面可能会被拉伸裁剪）或适应（画面可能会有黑边），默认值：TRTCVideoFillMode_Fit
     * - TRTCVideoFillMode_Fill: 图像铺满屏幕，超出显示视窗的视频部分将被截掉，所以画面显示可能不完整。
     * - TRTCVideoFillMode_Fit: 图像长边填满屏幕，短边区域会被填充黑色，但画面的内容肯定是完整的。
     */
    // setRemoteViewFillMode(userId: string, mode: TRTCVideoFillMode): void {
    //     const key = this._getKey(userId, TRTCVideoStreamType.TRTCVideoStreamTypeBig);
    //     this.remoteFillModeMap.set(key, mode);
    //     this.remoteMainStreamFillMode = mode;

    //     const rendererMap = this.videoRendererMap.get(key);
    //     if (rendererMap) {
    //         rendererMap.forEach((value: IRenderer) => {
    //             value.setContentMode(mode);
    //         })
    //     }
    // }

    /**
     * 废弃接口： 设置本地图像的顺时针旋转角度
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 setLocalRenderParams 接口替代。
     * @param {TRTCVideoRotation} rotation - 支持 TRTCVideoRotation90 、 TRTCVideoRotation180 、 TRTCVideoRotation270 旋转角度，默认值：TRTCVideoRotation0
     * - TRTCVideoRotation0  : 顺时针旋转0度
     * - TRTCVideoRotation90 : 顺时针旋转90度
     * - TRTCVideoRotation180: 顺时针旋转180度
     * - TRTCVideoRotation270: 顺时针旋转270度
     */
    // setLocalViewRotation(rotation: TRTCVideoRotation): void {
    //     this.localRotation = rotation;

    //     const params = new TRTCRenderParams();
    //     params.rotation = this.localRotation;
    //     params.fillMode = this.localFillMode;
    //     params.mirrorType = this.localMirrorType;
    //     this.setLocalRenderParams(params);
    // }

    /**
     * 废弃接口： 设置远端图像的顺时针旋转角度
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 setRemoteRenderParams 接口替代。
     * @param {String} userId - 用户 ID
     * @param {TRTCVideoRotation} rotation - 支持 TRTCVideoRotation90 、 TRTCVideoRotation180 、 TRTCVideoRotation270 旋转角度，默认值：TRTCVideoRotation0
     * - TRTCVideoRotation0  : 顺时针旋转0度
     * - TRTCVideoRotation90 : 顺时针旋转90度
     * - TRTCVideoRotation180: 顺时针旋转180度
     * - TRTCVideoRotation270: 顺时针旋转270度
     */
    // setRemoteViewRotation(userId: string, rotation: TRTCVideoRotation): void {
    //     this.remoteMainStreamRotation = rotation;

    //     const streamType = TRTCVideoStreamType.TRTCVideoStreamTypeBig;
    //     const params = new TRTCRenderParams();
    //     params.rotation = this.remoteMainStreamRotation;
    //     params.fillMode = this.remoteMainStreamFillMode;
    //     params.mirrorType = this.remoteMainStreamMirrorType;
    //     this.setRemoteRenderParams(userId, streamType, params);
    // }

    /**
     * 设置视频编码输出的（也就是远端用户观看到的，以及服务器录制下来的）画面方向
     *
     * @param {TRTCVideoRotation} rotation - 目前支持 TRTCVideoRotation0 和 TRTCVideoRotation180 两个旋转角度，默认值：TRTCVideoRotation0
     * - TRTCVideoRotation0  : 顺时针旋转0度
     * - TRTCVideoRotation180: 顺时针旋转180度
     */
    // setVideoEncoderRotation(rotation: TRTCVideoRotation): void {
    //     this.rtcCloud.setVideoEncoderRotation(rotation);
    // }

    /**
     * 废弃接口： 设置本地摄像头预览画面的镜像模式
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 setLocalRenderParams 接口替代。
     * @param {Boolean} mirror - 镜像模式, windows 默认值: false(非镜像模式), mac 默认值: true(镜像模式)
     */
    // setLocalViewMirror(mirror: boolean): void {
    //     this.localMirrorType = mirror ? TRTCVideoMirrorType.TRTCVideoMirrorType_Enable : TRTCVideoMirrorType.TRTCVideoMirrorType_Disable;

    //     const params = new TRTCRenderParams();
    //     params.rotation = this.localRotation;
    //     params.fillMode = this.localFillMode;
    //     params.mirrorType = this.localMirrorType;
    //     this.setLocalRenderParams(params)
    // }

    /**
     * 设置编码器输出的画面镜像模式
     *
     * 该接口不改变本地摄像头的预览画面，但会改变另一端用户看到的（以及服务器录制的）画面效果。
     *
     * @param {Boolean} mirror - 是否开启远端镜像, true：远端画面镜像；false：远端画面非镜像。默认值：false
     */
    // setVideoEncoderMirror(mirror: boolean): void {
    //     this.rtcCloud.setVideoEncoderMirror(mirror);
    // }

    /**
     * 开启大小画面双路编码模式
     *
     * 如果当前用户是房间中的主要角色（例如主播、老师、主持人等），并且使用 PC 或者 Mac 环境，可以开启该模式。
     * 开启该模式后，当前用户会同时输出【高清】和【低清】两路视频流（但只有一路音频流）。
     * 对于开启该模式的当前用户，会占用更多的网络带宽，并且会更加消耗 CPU 计算资源。
     *
     * 对于同一房间的远程观众而言：
     * - 如果用户的下行网络很好，可以选择观看【高清】画面
     * - 如果用户的下行网络较差，可以选择观看【低清】画面
     *
     * @param {Boolean} enable - 是否开启小画面编码，默认值：false
     * @param {TRTCVideoEncParam} params - 小流的视频参数
     * @param {TRTCVideoResolution} params.videoResolution - 视频分辨率
     * @param {TRTCVideoResolutionMode} params.resMode - 分辨率模式（横屏分辨率 - 竖屏分辨率）
     * - TRTCVideoResolutionModeLandscape: 横屏分辨率
     * - TRTCVideoResolutionModePortrait : 竖屏分辨率
     * @param {Number} params.videoFps     - 视频采集帧率
     * @param {Number} params.videoBitrate - 视频上行码率
     * @param {Number} params.minVideoBitrate - 视频最小码率
     */
    // enableSmallVideoStream(enable: boolean, params: any): void {
    //     if (params instanceof TRTCVideoEncParam) {
    //         this.rtcCloud.enableSmallVideoStream(enable, params);
    //     } else {
    //         this.logger.error('enableSmallVideoStream, params is not instanceof TRTCVideoEncParam!');
    //     }
    // }

    /**
     * 选定观看指定 userId 的大画面或小画面
     *
     * 此功能需要该 userId 通过 enableSmallVideoStream 提前开启双路编码模式。
     * 如果该 userId 没有开启双路编码模式，则此操作无效。
     *
     * @param {String} userId - 用户 ID
     * @param {TRTCVideoStreamType} streamType - 视频流类型，即选择看大画面还是小画面，默认为 TRTCVideoStreamTypeBig
     * - TRTCVideoStreamTypeBig  : 大画面视频流
     * - TRTCVideoStreamTypeSmall: 小画面视频流
     */
    // setRemoteVideoStreamType(userId: string, streamType: TRTCVideoStreamType): void {
    //     this._setRemoteVideoBuffer(userId, streamType);
    //     this.rtcCloud.setRemoteVideoStreamType(userId, streamType);
    // }

    /**
     * 视频画面截图
     *
     * 调用截图接口后，您会收到来自 TRTCCallback 中的 [onSnapshotComplete]{@link TRTCCallback#event:onSnapshotComplete} 回调:
     * 截取本地、远程主路和远端辅流的视频画面，并通过 HBITMAP 对象返回给您。
     *
     * @param {String} userId 用户 ID，空字符串表示截取本地视频画面
     * @param {TRTCVideoStreamType} streamType 视频流类型，支持摄像头画面（TRTCVideoStreamTypeBig）和屏幕分享画面（TRTCVideoStreamTypeSub）
     *
     */
    // snapshotVideo(userId: string, type: TRTCVideoStreamType): void {
    //     const snapshotSourceTypeStream = 0;
    //     this.rtcCloud.snapshotVideo(userId, type, snapshotSourceTypeStream);
    // }

    /**
     * 废弃接口： 设定观看方优先选择的视频质量
     *
     * 低端设备推荐优先选择低清晰度的小画面。
     * 如果对方没有开启双路视频模式，则此操作无效。
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 startRemoteView 接口设置视频流类型参数进行替代。
     *
     * @param {TRTCVideoStreamType} type - 默认观看大画面还是小画面，默认为 TRTCVideoStreamTypeBig
     * - TRTCVideoStreamTypeBig  : 大画面视频流
     * - TRTCVideoStreamTypeSmall: 小画面视频流
     */
    // setPriorRemoteVideoStreamType(type: TRTCVideoStreamType): void {
    //     this.priorRemoteVideoStreamType = type;
    // }

    /**
     * 开启本地媒体录制
     *
     * 开启后把直播过程中的音视和视频内容录制到本地的一个文件中。
     *
     * @param {Object} options  - 录制参数
     * @param {string} options.filePath - 录制文件路径。
     *  - 录制的文件地址（必填），请确保路径有读写权限且合法，否则录制文件无法生成。
     *  - 【特别说明】该路径需精确到文件名及格式后缀，格式后缀用于决定录制出的文件格式，目前支持的格式暂时只有 MP4。 例如：假如您指定路径为 "mypath/record/test.mp4"，代表您希望 SDK 生成一个 MP4 格式的本地视频文件。 请您指定一个有读写权限的合法路径，否则录制文件无法生成。
     * @param {TRTCRecordType} options.recordType - 媒体录制类型，默认值：TRTCRecordTypeBoth，即同时录制音频和视频。
     * @param {number} options.interval - 录制进行中事件 [onLocalRecording]{@link TRTCCallback#event:onLocalRecording} 触发频率，单位毫秒，有效范围：1000-10000 和 -1。默认值为-1，表示不触发录制进行中事件。
     */
    startLocalRecording(options: {
        filePath: string;
        recordType: TRTCRecordType;
        interval: number;
    }): void {
        const { filePath, recordType, interval } = options;
        if (filePath === undefined || typeof filePath !== 'string' || filePath.length === 0) {
            throw new Error('filePath should be string and not empty');
        }
        if (recordType === undefined || typeof recordType !== 'number' || !Object.values(TRTCRecordType).includes(options.recordType)) {
            options.recordType = TRTCRecordType.TRTCRecordTypeBoth;
        }
        if (interval === undefined || typeof interval !== 'number' || interval >= 10001 || interval <= 999) {
            options.interval = -1;
        }
        this.rtcCloud.startLocalRecording(options);
    }

    /**
     * 停止本地媒体录制
     *
     * 如果录制任务在退出房间前尚未通过本接口停止，则退出房间后录音任务会自动被停止。
     */
    stopLocalRecording(): void {
        this.rtcCloud.stopLocalRecording();
    }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （四）音频相关接口函数
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 开启本地音频的采集和上行
     *
     * 该函数会启动麦克风采集，并将音频数据传输给房间里的其他用户。
     * SDK 并不会默认开启本地的音频上行，也就说，如果您不调用这个函数，房间里的其他用户就听不到您的声音。
     *
     * 注意：TRTC SDK 并不会默认打开本地的麦克风采集。
     *
     * @param {TRTCAudioQuality} quality - 音频质量
     * - TRTCAudioQualitySpeech: 语音模式：采样率：16k
     * - TRTCAudioQualityDefault: 标准模式（或者默认模式）：采样率：48k
     * - TRTCAudioQualityMusic: 音乐模式：采样率：48k
     */
    startLocalAudio(quality?: TRTCAudioQuality) {
        if (quality === undefined) {
            quality = this.audioQuality;
        }
        this.rtcCloud.startLocalAudio(quality);
    }

    /**
     * 关闭本地音频的采集和上行
     *
     * 当关闭本地音频的采集和上行，房间里的其它成员会收到 onUserAudioAvailable(false) 回调通知。
     */
    stopLocalAudio() {
        this.rtcCloud.stopLocalAudio();
    }

    /**
     * 静音本地的音频
     *
     * 当静音本地音频后，房间里的其它成员会收到 onUserAudioAvailable(false) 回调通知。
     * 与 stopLocalAudio 不同之处在于，muteLocalAudio 并不会停止发送音视频数据，而是会继续发送码率极低的静音包。
     * 在对录制质量要求很高的场景中，选择 muteLocalAudio 是更好的选择，能录制出兼容性更好的 MP4 文件。
     * 这是由于 MP4 等视频文件格式，对于音频的连续性是要求很高的，简单粗暴地 stopLocalAudio 会导致录制出的 MP4 不易播放。
     *
     * @param {Boolean} mute - true：屏蔽；false：开启，默认值：false
     */
    muteLocalAudio(mute: boolean) {
        this.rtcCloud.muteLocalAudio(mute);
    }

    /**
     * 静音掉某一个用户的声音，同时不再拉取该远端用户的音频数据流
     *
     * @param {String}  userId - 用户 ID
     * @param {Boolean} mute   - true：静音；false：非静音
     */
    muteRemoteAudio(userId: string, mute: boolean) {
        this.rtcCloud.muteRemoteAudio(userId, mute);
    }

    /**
     * 静音/取消静音所有远端用户的音频流
     *
     * 当您静音所有用户的远端音频时，SDK 会停止播放所有来自远端的音频流，同时也会停止拉取所有用户的音频数据。
     *
     * 注意：该接口支持您在进入房间（enterRoom）前调用，暂停状态会在退出房间（exitRoom）在之后会被重置。
     *
     * @param {Boolean} mute - true：静音；false：非静音
     */
    muteAllRemoteAudio(mute: boolean) {
        this.rtcCloud.muteAllRemoteAudio(mute);
    }

    /**
     * 设置某个远程用户的播放音量
     *
     * @param {String} userId 远程用户 ID
     * @param {Number} volume 音量大小，100为原始音量，范围是：[0 ~ 100]，默认值为100
     *
     */
    setRemoteAudioVolume(userId: string, volume: number) {
        this.rtcCloud.setRemoteAudioVolume(userId, volume);
    }

    /**
     * 设置 SDK 采集音量
     *
     * @param {Number} volume - 音量大小，取值0 - 100，默认值为100
     */
    setAudioCaptureVolume(volume: number) {
        this.rtcCloud.setAudioCaptureVolume(volume);
    }

    /**
     * 获取 SDK 采集音量
     *
     * @return {Number} SDK 采集音量
     */
    getAudioCaptureVolume() {
        return this.rtcCloud.getAudioCaptureVolume();
    }

    /**
     * 设置 SDK 播放音量
     *
     * 注意：在混合远程用户、Bgm和音效的音频流后，送入系统播放前生效。
     *       会影响本地录制的音量大小。
     *       不会影响耳返的音量。
     *
     * @param {Number} volume - 音量大小，取值0 - 100，默认值为100
     */
    setAudioPlayoutVolume(volume: number) {
        this.rtcCloud.setAudioPlayoutVolume(volume);
    }

    /**
     * 获取 SDK 播放音量
     *
     * @return {Number} SDK 播放音量
     */
    getAudioPlayoutVolume() {
        return this.rtcCloud.getAudioPlayoutVolume();
    }

    /**
     * 启用或关闭音量大小提示
     *
     * 开启此功能后，SDK 会在 onUserVoiceVolume() 中反馈对每一路声音音量大小值的评估。
     * 我们在 Demo 中有一个音量大小的提示条，就是基于这个接口实现的。
     * 如希望打开此功能，请在 startLocalAudio() 之前调用。
     *
     * @param {Number} interval - 设置 onUserVoiceVolume 回调的触发间隔，单位为ms，最小间隔为100ms，如果小于等于0则会关闭回调，建议设置为300ms
     */
    enableAudioVolumeEvaluation(interval: number) {
        if (interval > 0) {
            this.rtcCloud.enableAudioVolumeEvaluation(true, {
                enableSpectrumCalculation: true,
                enableVadDetection: true,
                interval,
            });
        } else {
            this.rtcCloud.enableAudioVolumeEvaluation(false, {
                enableSpectrumCalculation: false,
                enableVadDetection: true,
                interval: 0,
            });
        }
    }

    /**
     * 开始录音
     *
     * 当您调用该接口后， SDK 会将本地和远端的所有音频（包括本地音频，远端音频，背景音乐和音效等）混合并录制到一个本地文件中。
     * 该接口在进入房间前后调用均可生效，如果录制任务在退出房间前尚未通过 stopAudioRecording 停止，则退出房间后录制任务会自动被停止。
     *
     * @param {TRTCAudioRecordingParams} params                            - 录音参数。
     * @param {String} params.filePath                                     - 录音文件的保存路径（必填）。
     *  - 该路径需精确到文件名及格式后缀，格式后缀用于决定录音文件的格式，目前支持的格式有 PCM、WAV 和 AAC。例如：假如您指定路径为 "mypath/record/audio.aac"，代表您希望 SDK 生成一个 AAC 格式的音频录制文件。
     *  - 请您指定一个有读写权限的合法路径，否则录音文件无法生成。
     * @param {TRTCAudioRecordingContent} params.recordingContent          - 音频录制内容类型。
     * @param {Number} params.maxDurationPerFile                           - 录制文件分片时长，单位毫秒，最小值10000。默认值为0，表示不分片。       
     * @return {Number} 0：成功；-1：录音已开始；-2：文件或目录创建失败；-3：后缀指定的音频格式不支持；-4：参数错误。
     *
     * 注意：
     *     - 在 9.3 之前的版本，params 为 string 代表 录音文件路径（必填）, 9.3 以及以后同时支持 string 类型和 TRTCAudioRecordingParams。
     */
    startAudioRecording(params: TRTCAudioRecordingParams | string): number {
        if (params instanceof TRTCAudioRecordingParams && params.filePath?.length) {
            return this.rtcCloud.startAudioRecording(params);
        } else if (typeof params === 'string' && params.length) {
            const path = params;
            const recordParams = new TRTCAudioRecordingParams(path);
            return this.rtcCloud.startAudioRecording(recordParams);
        } else {
            this.logger.error('startAudioRecording, params is not valid');
            return -4;
        }
    }

    /**
     * 停止录音
     *
     * 如果调用 exitRoom 时还在录音，录音会自动停止。
     */
    stopAudioRecording() {
        this.rtcCloud.stopAudioRecording();
    }

    /**
     * 设置远端音频流智能并发播放策略
     * 
     * 设置远端音频流智能并发播放策略，适用于上麦人数比较多的场景。
     *
     * @param {TRTCAudioParallelParams} - 音频并发参数。
     */
    setRemoteAudioParallelParams(param: TRTCAudioParallelParams): void {
        if (param.maxCount < 0) {
            throw new Error("maxCount must be greater or equal 0");
        }
        if (Array.isArray(param.includeUsers) && param.includeUsers.length >= 1) {
            const includeUsersFilterArray = param.includeUsers.filter(item => {
                return typeof item === 'string';
            });
            this.rtcCloud.setRemoteAudioParallelParams({
                maxCount: param.maxCount,
                includeUsers: includeUsersFilterArray
            });
        } else {
            throw new Error('includeUsers must be Array<String> type and not empty');
        }
    }

    /**
     * 设置音频质量
     *
     * @param {TRTCAudioQuality} quality - 音频质量
     * - TRTCAudioQualitySpeech: 语音模式：采样率：16k
     * - TRTCAudioQualityDefault: 标准模式（或者默认模式）：采样率：48k
     * - TRTCAudioQualityMusic: 音乐模式：采样率：48k
     */
    setAudioQuality(quality: TRTCAudioQuality) {
        this.audioQuality = quality;
        this.rtcCloud.setAudioQuality(quality);
    }

    /**
     * 废弃接口：设置麦克风的音量大小
     *
     * @deprecated 从 TRTCSDK6.9 后该接口已被废弃，请使用 setAudioCaptureVolume 接口替代。
     * @param {Number} volume - 音量大小，100为正常音量，取值范围为0 - 200。
     */
    setMicVolumeOnMixing(volume: number) {
        this.setAudioCaptureVolume(volume);
    }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （五）摄像头相关接口函数
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 获取摄像头设备列表
     *
     * @example
     * var cameralist = rtcCloud.getCameraDevicesList();
     * for (i=0;i<cameralist.length;i++) {
     *    var camera = cameralist[i];
     *    console.info("camera deviceName: " + camera.deviceName + " deviceId:" + camera.deviceId);
     * }
     * @return {Array<TRTCDeviceInfo>} 摄像头管理器列表
     */
    // getCameraDevicesList(): Array<TRTCDeviceInfo> {
    //     return this.deviceManager.getDevicesList(TRTCDeviceType.TRTCDeviceTypeCamera);
    // }

    /**
     * 设置要使用的摄像头
     *
     * @param {String} deviceId - 从 getCameraDevicesList 中得到的设备 ID
     */
    // setCurrentCameraDevice(deviceId: string): void {
    //     this.deviceManager.setCurrentDevice(TRTCDeviceType.TRTCDeviceTypeCamera, deviceId);
    // }

    /**
     * 获取当前使用的摄像头
     *
     * @return {TRTCDeviceInfo} 设备信息，能获取设备 ID 和设备名称
     */
    // getCurrentCameraDevice():TRTCDeviceInfo {
    //     if (TRTCCloud.isIPCMode) {
    //         this.deviceManager.getCurrentDevice(TRTCDeviceType.TRTCDeviceTypeCamera);
    //         return this.stateStore.get('currentCamera');
    //     } else {
    //         return this.rtcCloud.getCurrentDevice(TRTCDeviceType.TRTCDeviceTypeCamera);
    //     }
    // }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （六）音频设备相关接口函数
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 获取麦克风设备列表
     *
     * @example
     *   var miclist = rtcCloud.getMicDevicesList();
     *   for (i=0;i<miclist.length;i++) {
     *     var mic = miclist[i];
     *     console.info("mic deviceName: " + mic.deviceName + " deviceId:" + mic.deviceId);
     *   }
     * @return {Array<TRTCDeviceInfo>} 麦克风管理器列表
     */
    getMicDevicesList(): Array<TRTCDeviceInfo> {
        return this.deviceManager.getDevicesList(TRTCDeviceType.TRTCDeviceTypeMic);
    }

    /**
     * 获取当前选择的麦克风
     *
     * @return {TRTCDeviceInfo} 设备信息，能获取设备 ID 和设备名称
     */
    getCurrentMicDevice(): TRTCDeviceInfo {
        if (TRTCCloud.isIPCMode) {
            this.deviceManager.getCurrentDevice(TRTCDeviceType.TRTCDeviceTypeMic);
            return this.stateStore.get('currentMic');
        } else {
            return this.rtcCloud.getCurrentDevice(TRTCDeviceType.TRTCDeviceTypeMic);
        }
    }

    /**
     * 设置要使用的麦克风
     *
     * 选择指定的麦克风作为录音设备，不调用该接口时，默认选择索引为0的麦克风
     *
     * @param {String} micId - 从 getMicDevicesList 中得到的设备 ID
     */
    setCurrentMicDevice(micId: string): void {
        this.deviceManager.setCurrentDevice(TRTCDeviceType.TRTCDeviceTypeMic, micId);
    }

    /**
     * 获取系统当前麦克风设备音量
     *
     * 注意：查询的是系统硬件音量大小。
     * @return {Number} 音量值，范围是0 - 100
     */
    getCurrentMicDeviceVolume(): number {
        if (TRTCCloud.isIPCMode) {
            this.deviceManager.getCurrentDeviceVolume(TRTCDeviceType.TRTCDeviceTypeMic);
            return this.stateStore.get('currentMicVolume');
        } else {
            return this.deviceManager.getCurrentDeviceVolume(TRTCDeviceType.TRTCDeviceTypeMic) as unknown as number;
        }
    }

    /**
     * 设置系统当前麦克风设备的音量
     *
     * 注意：该接口的功能是调节系统采集音量，如果用户直接调节系统设置的采集音量时，该接口的设置结果会被用户的操作所覆盖。
     * @param {Number} volume - 麦克风音量值，范围0 - 100
     */
    setCurrentMicDeviceVolume(volume: number):void {
        this.deviceManager.setCurrentDeviceVolume(TRTCDeviceType.TRTCDeviceTypeMic, volume);
    }

    /**
     * 设置系统当前麦克风设备的静音状态
     *
     * @param {Boolean} mute 设置为 true 时，麦克风设备静音；设置为 false时，麦克风设备取消静音
     */
    setCurrentMicDeviceMute(mute: boolean):void {
        this.deviceManager.setCurrentDeviceMute(TRTCDeviceType.TRTCDeviceTypeMic, mute);
    }

    /**
     * 获取系统当前麦克风设备是否静音
     *
     * @return {Boolean} 静音状态
     */
    getCurrentMicDeviceMute(): boolean {
        if (TRTCCloud.isIPCMode) {
            this.deviceManager.getCurrentDeviceMute(TRTCDeviceType.TRTCDeviceTypeMic);
            return this.stateStore.get('isCurrentMicMute');
        } else {
            return this.rtcCloud.getCurrentDeviceMute(TRTCDeviceType.TRTCDeviceTypeMic);
        }
    }

    /**
     * 获取扬声器设备列表
     *
     * @example
     *   var speakerlist = rtcCloud.getSpeakerDevicesList();
     *   for (i=0;i<speakerlist.length;i++) {
     *     var speaker = speakerlist[i];
     *     console.info("mic deviceName: " + speaker.deviceName + " deviceId:" + speaker.deviceId);
     *   }
     * @return {Array<TRTCDeviceInfo>} 扬声器管理器列表
     */
    getSpeakerDevicesList(): Array<TRTCDeviceInfo> {
        return this.deviceManager.getDevicesList(TRTCDeviceType.TRTCDeviceTypeSpeaker);
    }

    /**
     * 获取当前的扬声器设备
     *
     * @return {TRTCDeviceInfo} 设备信息，能获取设备 ID 和设备名称
     */
    getCurrentSpeakerDevice(): TRTCDeviceInfo {
        if (TRTCCloud.isIPCMode) {
            this.deviceManager.getCurrentDevice(TRTCDeviceType.TRTCDeviceTypeSpeaker);
            return this.stateStore.get('currentSpeaker');
        } else {
            return this.rtcCloud.getCurrentDevice(TRTCDeviceType.TRTCDeviceTypeSpeaker);        
        }
    }

    /**
     * 设置要使用的扬声器
     *
     * @param {String} speakerId - 从 getSpeakerDevicesList 中得到的设备 ID
     */
    setCurrentSpeakerDevice(speakerId: string):void {
        this.deviceManager.setCurrentDevice(TRTCDeviceType.TRTCDeviceTypeSpeaker, speakerId);
    }

    /**
     * 获取系统当前扬声器设备音量
     *
     * @return {Number} 扬声器音量，范围0 - 100
     */
    getCurrentSpeakerVolume(): number {
        if (TRTCCloud.isIPCMode) {
            this.deviceManager.getCurrentDeviceVolume(TRTCDeviceType.TRTCDeviceTypeSpeaker);
            return this.stateStore.get('currentSpeakerVolume');
        } else {
            return this.deviceManager.getCurrentDeviceVolume(TRTCDeviceType.TRTCDeviceTypeSpeaker) as unknown as number;
        }

    }

    /**
     * 设置系统当前扬声器设备音量
     *
     * 注意：该接口的功能是调节系统播放音量，如果用户直接调节系统设置的播放音量时，该接口的设置结果会被用户的操作所覆盖。
     *
     * @param {Number} volume - 设置的扬声器音量，范围0 - 100
     */
    setCurrentSpeakerVolume(volume: number): void {
        this.deviceManager.setCurrentDeviceVolume(TRTCDeviceType.TRTCDeviceTypeSpeaker, volume);
    }

    /**
     * 设置系统当前扬声器设备的静音状态
     *
     * @param {Boolean} mute 设置为 true 时，扬声器设备静音；设置为 false时，扬声器设备取消静音
     */
    setCurrentSpeakerDeviceMute(mute: boolean): void {
        this.deviceManager.setCurrentDeviceMute(TRTCDeviceType.TRTCDeviceTypeSpeaker, mute);
    }

    /**
     * 获取系统当前扬声器设备是否静音
     *
     * @return {Boolean} 静音状态
     */
    getCurrentSpeakerDeviceMute(): boolean {
        if (TRTCCloud.isIPCMode) {
            this.deviceManager.getCurrentDeviceMute(TRTCDeviceType.TRTCDeviceTypeSpeaker);
            return this.stateStore.get('isCurrentSpeakerMute');
        } else {
            return this.rtcCloud.getCurrentDeviceMute(TRTCDeviceType.TRTCDeviceTypeSpeaker);
        }
    }

    /**
     * 设置 SDK 使用的音频设备自动跟随系统默认设备
     *
     * 仅支持设置麦克风和扬声器类型，摄像头暂不支持跟随系统默认设备
     *
     * @param {TRTCDeviceType} deviceType - 设备类型，只支持麦克风和扬声器，摄像头不支持
     * @param {Boolean} enable - 是否跟随系统默认的音频设备
     *  - true: 跟随。当系统默认音频设备发生改变时，SDK 立即切换音频设备。
     *  - false: 不跟随。只有当 SDK 使用的音频设备被移除后或插入新的音频设备为系统默认设备时，SDK 才切换至系统默认的音频设备。
     */
    enableFollowingDefaultAudioDevice(deviceType: TRTCDeviceType, enable: boolean): void {
        this.deviceManager.enableFollowingDefaultAudioDevice(deviceType, enable);
    }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （七）图像前处理相关接口函数
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 设置美颜、美白、红润效果级别
     *
     * SDK 内部集成了两套风格不同的磨皮算法，一套我们取名叫“光滑”，适用于美女秀场，效果比较明显。
     * 另一套我们取名“自然”，磨皮算法更多地保留了面部细节，主观感受上会更加自然。
     * 
     * 注意：计算机必须配备显卡，否则该接口功能不生效。
     *
     * @param {TRTCBeautyStyle} style - 美颜风格，光滑或者自然，光滑风格磨皮更加明显，适合娱乐场景。
     * - TRTCBeautyStyleSmooth: 光滑，适用于美女秀场，效果比较明显。
     * - TRTCBeautyStyleNature: 自然，磨皮算法更多地保留了面部细节，主观感受上会更加自然。
     * @param {Number} beauty    - 美颜级别，取值范围0 - 9，0表示关闭，1 - 9值越大，效果越明显
     * @param {Number} white     - 美白级别，取值范围0 - 9，0表示关闭，1 - 9值越大，效果越明显
     * @param {Number} ruddiness - 红润级别，取值范围0 - 9，0表示关闭，1 - 9值越大，效果越明显，该参数 windows 平台暂未生效
     */
    // setBeautyStyle(style: TRTCBeautyStyle, beauty: number, white: number, ruddiness: number) {
    //     this.rtcCloud.setBeautyStyle(style, beauty, white, ruddiness);
    // }

    /**
     * 设置水印
     *
     * 水印的位置是通过 xOffset, yOffset, fWidthRatio 来指定的。
     * - xOffset：水印的坐标，取值范围为0 - 1的浮点数。
     * - yOffset：水印的坐标，取值范围为0 - 1的浮点数。
     * - fWidthRatio：水印的大小比例，取值范围为0 - 1的浮点数。
     *
     * @param {TRTCVideoStreamType} streamType - 要设置水印的流类型(TRTCVideoStreamTypeBig、TRTCVideoStreamTypeSub)
     * @param {ArrayBuffer|String} srcData - 水印图片源数据（传 null 表示去掉水印）
     * @param {TRTCWaterMarkSrcType} srcType - 水印图片源数据类型
     * - TRTCWaterMarkSrcTypeFile  : 图片文件路径，支持 BMP、GIF、JPEG、PNG、TIFF、Exif、WMF 和 EMF 文件格式
     * - TRTCWaterMarkSrcTypeBGRA32: BGRA32格式内存块
     * - TRTCWaterMarkSrcTypeRGBA32: RGBA32格式内存块
     * @param {Number} nWidth      - 水印图片像素宽度（源数据为文件路径时忽略该参数）
     * @param {Number} nHeight     - 水印图片像素高度（源数据为文件路径时忽略该参数）
     * @param {Number} xOffset     - 水印显示的左上角 x 轴偏移
     * @param {Number} yOffset     - 水印显示的左上角 y 轴偏移
     * @param {Number} fWidthRatio - 水印显示的宽度占画面宽度比例（水印按该参数等比例缩放显示）
     */
    // setWaterMark(
    //     streamType: TRTCVideoStreamType,
    //     srcData: ArrayBuffer | string | null,
    //     srcType: TRTCWaterMarkSrcType,
    //     nWidth: number, nHeight: number,
    //     xOffset: number, yOffset: number,
    //     fWidthRatio: number
    // ): void {
    //     let newSrcType: TRTCWaterMarkSrcType | number = srcType;
    //     if (srcData === null || srcData === undefined || srcType === null || srcType === undefined) {
    //         newSrcType = -1; //关闭水印
    //     }
    //     this.rtcCloud.setWaterMark(streamType, srcData, newSrcType, nWidth, nHeight, xOffset, yOffset, fWidthRatio);
    // }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （八）辅流相关接口函数（屏幕共享，播片等）
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 废弃接口： 开始显示远端用户的辅路画面（TRTCVideoStreamTypeSub，一般用于屏幕分享）
     *
     * - startRemoteView() 用于显示主路画面（TRTCVideoStreamTypeBig，一般用于摄像头）。
     * - startRemoteSubStreamView() 用于显示辅路画面（TRTCVideoStreamTypeSub，一般用于屏幕分享）。
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 startRemoteView 接口替代。
     *
     * 注意：请在 onUserSubStreamAvailable 回调后再调用这个接口。
     *
     * @param {String}      userId - 对方的用户标识
     * @param {HTMLElement} view   - 承载预览画面的 DOM
     */
    // startRemoteSubStreamView(userId: string, view: HTMLElement) {
    //     this.startRemoteView(userId, view, TRTCVideoStreamType.TRTCVideoStreamTypeSub);
    // }

    /**
     * 废弃接口： 停止显示远端用户的辅路画面（TRTCVideoStreamTypeSub，一般用于屏幕分享）。
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 stopRemoteView 接口替代。
     *
     * @param {String} userId - 对方的用户标识
     */
    // stopRemoteSubStreamView(userId: string) {
    //     this.stopRemoteView(userId, TRTCVideoStreamType.TRTCVideoStreamTypeSub);
    // }

    /**
     * 废弃接口： 设置辅路画面（TRTCVideoStreamTypeSub，一般用于屏幕分享）的显示模式。
     *
     * - setRemoteViewFillMode() 用于设置远端主路画面（TRTCVideoStreamTypeBig，一般用于摄像头）的显示模式。
     * - setRemoteSubStreamViewFillMode() 用于设置远端辅路画面（TRTCVideoStreamTypeSub，一般用于屏幕分享）的显示模式。
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 setRemoteRenderParams 接口替代。
     *
     * @param {String} userId - 用户的 ID
     * @param {TRTCVideoFillMode} mode - 填充（画面可能会被拉伸裁剪）或适应（画面可能会有黑边），默认值：TRTCVideoFillMode_Fit
     * - TRTCVideoFillMode_Fill: 图像铺满屏幕，超出显示视窗的视频部分将被截掉，所以画面显示可能不完整。
     * - TRTCVideoFillMode_Fit: 图像长边填满屏幕，短边区域会被填充黑色，但画面的内容肯定是完整的。
     */
    // setRemoteSubStreamViewFillMode(userId: string, mode: TRTCVideoFillMode): void {
    //     const key = this._getKey(userId, TRTCVideoStreamType.TRTCVideoStreamTypeSub);
    //     this.remoteFillModeMap.set(key, mode);
    //     this.remoteSubStreamFillMode = mode;
    //     const rendererMap = this.videoRendererMap.get(key);
    //     if (rendererMap) {
    //         rendererMap.forEach((value: IRenderer) => {
    //             value.setContentMode(mode);
    //         })
    //     }
    // }

    /**
     * 废弃接口： 设置辅路画面（TRTCVideoStreamTypeSub，一般用于屏幕分享）的顺时针旋转角度
     *
     * - setRemoteViewRotation() 用于设置远端主路画面（TRTCVideoStreamTypeBig，一般用于摄像头）的旋转角度。
     * - setRemoteSubStreamViewRotation() 用于设置远端辅路画面（TRTCVideoStreamTypeSub，一般用于屏幕分享）的旋转角度。
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 setRemoteRenderParams 接口替代。
     *
     * @param {String} userId - 用户 ID
     * @param {TRTCVideoRotation} rotation - 支持90、180、270旋转角度
     */
    // setRemoteSubStreamViewRotation(userId: string, rotation: TRTCVideoRotation) {
    //     this.remoteSubStreamRotation = rotation;

    //     const params = new TRTCRenderParams();
    //     params.mirrorType = this.remoteSubStreamMirrorType;
    //     params.rotation = this.remoteSubStreamRotation;
    //     params.fillMode = this.remoteSubStreamFillMode
    //     this.setRemoteRenderParams(userId, TRTCVideoStreamType.TRTCVideoStreamTypeSub, params);
    // }

    /**
     * 枚举可共享的窗口列表
     *
     * 如果您要给您的 App 增加屏幕分享功能，一般需要先显示一个窗口选择界面，这样用户可以选择希望分享的窗口。
     * 通过此函数，您可以获得可分享窗口的 ID、类型、窗口名称以及缩略图。
     * 拿到这些信息后，您就可以实现一个窗口选择界面，当然，您也可以使用我们在 Demo 源码中已经实现好的一个界面。
     *
     * 注意：返回的列表中包括屏幕和应用窗口，屏幕会在列表的前面几个元素中。
     *
     * @param {Number} thumbWidth  - 缩略图宽度，指定要获取的窗口缩略图大小，缩略图可用于绘制在窗口选择界面上
     * @param {Number} thumbHeight - 缩略图高度，指定要获取的窗口缩略图大小，缩略图可用于绘制在窗口选择界面上
     * @param {Number} iconWidth   - 图标宽度，指定要获取的窗口图标大小
     * @param {Number} iconHeight  - 图标高度，指定要获取的窗口图标大小
     *
     * @return {TRTCScreenCaptureSourceInfo[]} 窗口列表包括屏幕
     */
    // getScreenCaptureSources(
    //     thumbWidth: number, thumbHeight: number, iconWidth: number, iconHeight: number
    // ): Array<TRTCScreenCaptureSourceInfo> {
    //     return this.rtcCloud.getScreenCaptureSources({
    //         width: thumbWidth,
    //         height: thumbHeight
    //     }, {
    //         width: iconWidth,
    //         height: iconHeight
    //     });
    // }

    /**
     * 设置屏幕共享参数，该方法在屏幕共享过程中也可以调用
     *
     * 如果您期望在屏幕分享的过程中，切换想要分享的窗口，可以再次调用这个函数而不需要重新开启屏幕分享。
     *
     * 支持如下四种情况：
     * - 共享整个屏幕：sourceInfoList 中 type 为 Screen 的 source，captureRect 设为 { 0, 0, 0, 0 }
     * - 共享指定区域：sourceInfoList 中 type 为 Screen 的 source，captureRect 设为非 NULL，例如 { 100, 100, 300, 300 }
     * - 共享整个窗口：sourceInfoList 中 type 为 Window 的 source，captureRect 设为 { 0, 0, 0, 0 }
     * - 共享窗口区域：sourceInfoList 中 type 为 Window 的 source，captureRect 设为非 NULL，例如 { 100, 100, 300, 300 }
     *
     * 注意：由于操作系统 API 能力限制，分享在同一个应用的多个窗口之间切换时，第二次及以后分享的窗口在调用 SDK 接口后可能无法置顶，需要用户手动选择应用才能置顶。
     *
     * @param {TRTCScreenCaptureSourceInfo} source - 指定分享源，详情参考TRTCScreenCaptureSourceInfo 定义
     * @param {TRTCScreenCaptureSourceType} source.type - 必填, 采集源类型
     * @param {String}                      source.sourceId   - 必填, 采集源ID；对于窗口，该字段指示窗口句柄；对于屏幕，该字段指示屏幕ID
     * @param {String}                      source.sourceName - 必填, 采集源名称，UTF8编码
     * @param {Boolean}                     source.isMinimizeWindow - 必填, 是否最小化窗口
     * @param {Rect}                        captureRect    - 指定捕获的区域
     * @param {TRTCScreenCaptureProperty}   property  - 指定屏幕分享目标的属性，包括捕获鼠标，高亮捕获窗口等，详情参考TRTCScreenCaptureProperty 定义
     *
     * @example
     * // 示例1: 选择要分享的窗口或屏幕，9.3 以后版本推荐此方式
     * import TRTCCloud, {
     *  Rect,
     *  TRTCScreenCaptureProperty
     * } from 'trtc-electron-sdk';
     *
     * const rtcCloud = TRTCCloud.getTRTCShareInstance();
     *
     * const screenAndWindows = rtcCloud.getScreenCaptureSources(320, 180, 32, 32);
     *
     * const selectedScreenOrWindow = screenAndWindows[0];
     *
     * const selectRect = new Rect(0, 0, 0, 0);
     *
     * const captureProperty = new TRTCScreenCaptureProperty(
     *  true, // enable capture mouse
     *  true, // enable highlight
     *  true, // enable high performance
     *  0xFF66FF, // highlight color.
     *  8, // highlight width
     *  false // disable capture child window
     * );
     *
     * rtcCloud.selectScreenCaptureTarget(
     *  selectedScreenOrWindow,
     *  selectRect,
     *  captureProperty
     * );
     *
     * @example
     * // 示例2: 选择要分享的窗口或屏幕，9.3 及之前版本只能使用此方式
     * import TRTCCloud, { Rect } from 'trtc-electron-sdk';
     *
     * const rtcCloud = TRTCCloud.getTRTCShareInstance();
     *
     * const screenAndWindows = rtcCloud.getScreenCaptureSources(320, 180, 32, 32);
     *
     * const selectedScreenOrWindow = screenAndWindows[0];
     *
     * const selectRect = new Rect(0, 0, 0, 0);
     *
     * rtcCloud.selectScreenCaptureTarget(
     *  selectedScreenOrWindow.type,
     *  selectedScreenOrWindow.sourceId,
     *  selectedScreenOrWindow.sourceName,
     *  selectRect,
     *  true, // enable capture mouse
     *  true // enable highlight
     * );
     */
    // selectScreenCaptureTarget(
    //     source: TRTCScreenCaptureSourceInfo | number, captureRect: Rect | string, property: TRTCScreenCaptureProperty | string,
    //     deprecatedCaptureRect?: Rect, captureMouse?: boolean, highlightWindow?: boolean
    // ) {
    //     if ((source as TRTCScreenCaptureSourceInfo).sourceId && captureRect instanceof Rect && property instanceof TRTCScreenCaptureProperty) {
    //         return this.rtcCloud.selectScreenCaptureTarget(source, captureRect, property);
    //     }
    //     const type = source as number;
    //     const sourceId = captureRect as string;
    //     const sourceName = property as string;
    //     if (
    //         sourceId !== null && sourceId !== undefined && sourceName !== null
    //         && sourceName !== undefined && deprecatedCaptureRect !== undefined && captureMouse !== undefined
    //         && highlightWindow !== undefined
    //     ) {
    //         const selSource = new TRTCScreenCaptureSourceInfo(type, sourceId, sourceName);
    //         const selProperty = new TRTCScreenCaptureProperty(captureMouse, highlightWindow);
    //         return this.rtcCloud.selectScreenCaptureTarget(selSource, deprecatedCaptureRect, selProperty);
    //     } else {
    //         this.logger.error('selectScreenCaptureTarget, sourceId or sourcename is undefined!');
    //     }
    // }

    /**
     * 启动屏幕分享，支持选择使用主路或辅路进行屏幕分享。
     *
     * 注意:
     * 一个用户同时最多只能上传一条主路（TRTCVideoStreamTypeBig）画面和一条辅路（TRTCVideoStreamTypeSub）画面，
     * 默认情况下，屏幕分享使用辅路画面，如果使用主路画面，建议您提前停止摄像头采集（stopLocalPreview）避免相互冲突。
     *
     * @param {HTMLElement} view - 承载预览画面的 DOM
     * @param {TRTCVideoStreamType} type 屏幕分享使用的线路，可以设置为主路（TRTCVideoStreamTypeBig）或者辅路（TRTCVideoStreamTypeSub），默认使用辅路。
     * @param {TRTCVideoEncParam} params 屏幕分享的画面编码参数，可以设置为 null，表示让 SDK 选择最佳的编码参数（分辨率、码率等）。即使在调用 startScreenCapture 时设置 type=TRTCVideoStreamTypeBig，依然可以使用此接口更新屏幕分享的编码参数。
     *
     * @example
     * // 分享屏幕或窗口
     * import TRTCCloud, {
     *  TRTCVideoStreamType,
     *  TRTCVideoEncParam,
     *  TRTCVideoResolution,
     *  TRTCVideoResolutionMode
     * } from 'trtc-electron-sdk';
     *
     * const rtcCloud = TRTCCloud.getTRTCShareInstance();
     *
     * const screenAndWindows = rtcCloud.getScreenCaptureSources(320, 180, 32, 32);
     *
     * const selectedScreenOrWindow = screenAndWindows[0];
     *
     * const selectRect = new Rect(0, 0, 0, 0);
     *
     * const captureProperty = new TRTCScreenCaptureProperty(
     *  true, // enable capture mouse
     *  true, // enable highlight
     *  true, // enable high performance
     *  0, // default highlight color
     *  0, // default highlight width
     *  false // disable capture child window
     * );
     *
     * rtcCloud.selectScreenCaptureTarget(
     *  selectedScreenOrWindow,
     *  selectRect,
     *  captureProperty
     * );
     *
     * const screenShareEncParam = new TRTCVideoEncParam(
     *  TRTCVideoResolution.TRTCVideoResolution_1280_720,
     *  TRTCVideoResolutionMode.TRTCVideoResolutionModeLandscape,
     *  15,
     *  1600,
     *  0,
     *  true,
     * );
     *
     * rtcCloud.startScreenCapture(
     *  view, // HTML Element
     *  TRTCVideoStreamType.TRTCVideoStreamTypeSub,
     *  screenShareEncParam,
     * );
     */
    // startScreenCapture(
    //     view: HTMLElement | null = null,
    //     type: TRTCVideoStreamType = TRTCVideoStreamType.TRTCVideoStreamTypeSub,
    //     params: any = null
    // ): void {
    //     if ((type !== TRTCVideoStreamType.TRTCVideoStreamTypeSub && type !== TRTCVideoStreamType.TRTCVideoStreamTypeBig)) {
    //         type = TRTCVideoStreamType.TRTCVideoStreamTypeSub;
    //     }
    //     if (params && !(params instanceof TRTCVideoEncParam)) {
    //         this.logger.error('startScreenCapture, params is not instanceof TRTCVideoEncParam!');
    //         return;
    //     }

    //     if (this.isScreenCapturing && this.screenCaptureStreamType !== type && this.localVideoBufferMap.sub && this.localVideoBufferMap.sub.buffer) {
    //         // 已经在分享中，切换分享流类型，停止当前正在进行的分享
    //         this.stopScreenCapture();
    //     }

    //     this.screenCaptureStreamType = type;

    //     if (view !== undefined) {
    //         if (view !== null) {
    //             const key = this._getKey(LOCAL_USER_VIDEO_ID, type);
    //             this._initRenderer(key, [view]);
    //         }
    //         this.localVideoRenderController.startScreenCapture(view);
    //     }

    //     if (params) {
    //         this.rtcCloud.startScreenCapture(type, params);
    //     } else {
    //         this.rtcCloud.startScreenCapture(type, null);
    //     }
    // }

    /**
     * 暂停屏幕分享
     */
    // pauseScreenCapture(): void {
    //     this.rtcCloud.pauseScreenCapture();
    // }

    /**
     * 恢复屏幕分享
     */
    // resumeScreenCapture(): void {
    //     this.rtcCloud.resumeScreenCapture();
    // }

    /**
     * 停止屏幕分享
     */
    // stopScreenCapture(): void {
    //     const key = this._getKey(LOCAL_USER_VIDEO_ID, this.screenCaptureStreamType);
    //     this._destroyRenderer(key, null);
    //     this.localVideoRenderController.stopScreenCapture();
    //     this.rtcCloud.stopScreenCapture();
    //     this.screenCaptureStreamType = TRTCVideoStreamType.TRTCVideoStreamTypeSub;
    // }

    /**
     * 设置屏幕分享（即辅路）的视频编码参数
     *
     * 该接口可以设定远端用户所看到的屏幕分享（即辅路）的画面质量，同时也能决定云端录制出的视频文件中屏幕分享的画面质量。 请注意如下两个接口的差异：
     * - setVideoEncoderParam() 用于设置主路画面（TRTCVideoStreamTypeBig，一般用于摄像头）的视频编码参数。
     * - setSubStreamEncoderParam() 用于设置辅路画面（TRTCVideoStreamTypeSub，一般用于屏幕分享）的视频编码参数。
     *
     * 注意：
     * 即使您使用主路传输屏幕分享（在调用 startScreenCapture 时设置 type=TRTCVideoStreamTypeBig），依然要使用 setSubStreamEncoderParam 设定屏幕分享的编码参数，而不要使用 setVideoEncoderParam 。
     *
     * @param {TRTCVideoEncParam} params - 辅流（屏幕分享）编码参数
     * @param {TRTCVideoResolution} params.videoResolution - 视频分辨率
     * @param {TRTCVideoResolutionMode} params.resMode - 分辨率模式（横屏分辨率 - 竖屏分辨率）
     * - TRTCVideoResolutionModeLandscape: 横屏分辨率
     * - TRTCVideoResolutionModePortrait : 竖屏分辨率
     * @param {Number} params.videoFps     - 视频采集帧率
     * @param {Number} params.videoBitrate - 视频上行码率
     * @param {Number} params.minVideoBitrate - 最小码率
     */
    // setSubStreamEncoderParam(params: any) {
    //     if (params instanceof TRTCVideoEncParam) {
    //         this.rtcCloud.setSubStreamEncoderParam(params);
    //     } else {
    //         this.logger.error('setSubStreamEncoderParam, params is not instanceof TRTCVideoEncParam!');
    //     }
    // }

    /**
     * 设置辅流（屏幕分享）的混音音量大小
     *
     * 这个数值越高，辅路音量的占比就约高，麦克风音量占比就越小，所以不推荐设置得太大，否则麦克风的声音就被压制了。
     *
     * @param {Number} volume - 设置的混音音量大小，范围0 - 100
     */
    setSubStreamMixVolume(volume: number) {
        this.rtcCloud.setSubStreamMixVolume(volume);
    }

    /**
     * 将指定窗口加入屏幕分享的排除列表中，加入排除列表中的窗口不会被分享出去
     *
     * 支持启动屏幕分享前设置过滤窗口，也支持屏幕分享过程中动态添加过滤窗口。
     *
     * @param {String} win - 不希望分享出去的窗口
     * - 该方法只有在 TRTCScreenCaptureSourceInfo 中的 type 指定为 TRTCScreenCaptureSourceTypeScreen 时生效，即分享屏幕时生效
     * - Windows下该方法添加的窗口列表会在退房后清空；Mac下在退出房间时不会自动清空，需要调用一次removeAllExcludedShareWindow()方法清空列表。
     */
    // addExcludedShareWindow(win: string) {
    //     if (isNaN(+win)) {
    //         this.logger.error('addExcludedShareWindow, win: ' + win + 'is not invalid!');
    //         return;
    //     }
    //     this.rtcCloud.addExcludedShareWindow(win);
    // }

    /**
     * 将指定窗口从屏幕分享的排除列表中移除
     *
     * @param {String} win - 不希望分享出去的窗口
     * - 该方法只有在 TRTCScreenCaptureSourceInfo 中的 type 指定为 TRTCScreenCaptureSourceTypeScreen 时生效，即分享屏幕时生效
     */
    // removeExcludedShareWindow(win: string) {
    //     if (isNaN(+win)) {
    //         this.logger.error('removeExcludedShareWindow, win: ' + win + 'is not invalid!');
    //         return;
    //     }
    //     this.rtcCloud.removeExcludedShareWindow(win);
    // }

    /**
     * 将所有窗口从屏幕分享的排除列表中移除
     *
     * @note 该方法只有在 TRTCScreenCaptureSourceInfo 中的 type 指定为 TRTCScreenCaptureSourceTypeScreen 时生效，即分享屏幕时生效
     */
    // removeAllExcludedShareWindow() {
    //     this.rtcCloud.removeAllExcludedShareWindow();
    // }

    /**
     * 将指定窗口加入屏幕分享的包含列表中
     *
     * 该方法只有在 TRTCScreenCaptureSourceInfo 中的 type 指定为 TRTCScreenCaptureSourceTypeWindow 时生效，即分享窗口内容时，额外包含指定窗口的功能才生效。<br/>
     * 您在 startScreenCapture 之前和之后调用均可。
     * 
     * 注意：通过该方法添加到包含列表中的窗口，会在退出房间后被 SDK 自动清除。
     * 
     * @param {String} win - 希望被分享出去的窗口 ID
     */
    // addIncludedShareWindow(win: string): void {
    //     if (isNaN(+win)) {
    //         this.logger.error('addIncludedShareWindow, win: ' + win + 'is not invalid!');
    //         return;
    //     }
    //     this.rtcCloud.addIncludedShareWindow(win);
    // }

    /**
     * 将指定窗口从屏幕分享的包含列表中移除
     *
     * 该接口只有在 TRTCScreenCaptureSourceInfo 中的 type 指定为 TRTCScreenCaptureSourceTypeWindow 时生效。<br/>
     * 即只有在分享窗口内容时，额外包含指定窗口的功能才生效。
     * 
     * @param {String} win - 希望被分享出去的窗口 ID
     */
    // removeIncludedShareWindow(win: string): void {
    //     if (isNaN(+win)) {
    //         this.logger.error('removeIncludedShareWindow, win: ' + win + 'is not invalid!');
    //         return;
    //     }
    //     this.rtcCloud.removeIncludedShareWindow(win);
    // }

    /**
     * 将全部窗口从屏幕分享的包含列表中移除
     *
     * 该接口只有在 TRTCScreenCaptureSourceInfo 中的 type 指定为 TRTCScreenCaptureSourceTypeWindow 时生效。<br/>
     * 即只有在分享窗口内容时，额外包含指定窗口的功能才生效。
     */
    // removeAllIncludedShareWindow(): void {
    //     this.rtcCloud.removeAllIncludedShareWindow();
    // }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （九）自定义采集和渲染
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 启用音频自定义采集模式
     * 
     * 开启该模式后，SDK 不在运行原有的音频采集流程，即不再继续从麦克风采集音频数据，而是只保留音频编码和发送能力。
     * 您需要通过 [sendCustomAudioData]{@link TRTCCloud#sendCustomAudioData} 不断地向 SDK 塞入自己采集的音频数据。
     * 
     * 注意：
     *  - 音频自定义采集与 SDK 默认的麦克疯音频采集互斥。因此，调用 `enableCustomAudioCapture(true)` 开启音频自定义采集前，需要先调用 [stopLocalAudio]{@link TRTCCloud#stopLocalAudio} 接口关闭默认的麦克风音频上行，否则不生效；调用 `enableCustomAudioCapture(false)` 关闭自定义采集后，要调用 [startLocalAudio]{@link TRTCCloud#startLocalAudio} 接口才能开启 SDK 默认的麦克风音频采集。 
     *  - 由于回声抵消（AEC）需要严格的控制声音采集和播放的时间，所以开启自定义音频采集后，AEC 能力可能会失效。
     * 
     * @param {Boolean} enable - 是否启用，默认值：false。
     */
    // enableCustomAudioCapture(enable: boolean): void {
    //     this.rtcCloud.enableCustomAudioCapture(enable);
    // }

    /**
     * 向 SDK 投送自己采集的音频数据
     * 
     * 参数 {@link TRTCAudioFrame} 推荐下列填写方式（其他字段不需要填写）：
     * - audioFormat：音频数据格式，仅支持 TRTCAudioFrameFormatPCM。
     * - data：音频帧 buffer。音频帧数据只支持 PCM 格式，支持[5ms ~ 100ms]帧长，推荐使用 20ms 帧长，长度计算方法：【48000采样率、单声道的帧长度：48000 × 0.02s × 1 × 16bit = 15360bit = 1920字节】。
     * - sampleRate：采样率，支持：16000、24000、32000、44100、48000。
     * - channel：声道数（如果是立体声，数据是交叉的），单声道：1； 双声道：2。
     * - timestamp：时间戳，单位为毫秒（ms），请使用音频帧在采集时被记录下来的时间戳（可以在采集到一帧音频帧之后，通过调用 [generateCustomPTS]{@link TRTCCloud#generateCustomPTS} 获取时间戳）。
     *
     * 注意：请您精准地按每帧时长的间隔调用本接口，数据投送间隔不均匀时极易触发声音卡顿。
     * 
     * @param {TRTCAudioFrame} frame - 音频数据
     */
    // sendCustomAudioData(frame: TRTCAudioFrame): void {
    //     this.rtcCloud.sendCustomAudioData(frame);
    // }

    /**
     * 启用/关闭自定义音轨
     * 
     * 开启后，您可以通过本接口向 SDK 混入一条自定义的音轨。通过两个布尔型参数，您可以控制该音轨是否要在远端和本地播放。
     * 
     * 注意： 如果您指定参数 enablePublish 和 enablePlayout 均为 false，代表完全关闭您的自定义音轨。
     * @param {Boolean} enablePublish - 控制混入的音轨是否要在远端播放，默认值：false。
     * @param {Boolean} enablePlayout - 控制混入的音轨是否要在本地播放，默认值：false。
     * 
     */
    // enableMixExternalAudioFrame(enablePublish: boolean, enablePlayout: boolean): void {
    //     this.rtcCloud.enableMixExternalAudioFrame(enablePublish, enablePlayout);
    // }

    /**
     * 向 SDK 混入自定义音轨
     * 
     * 调用该接口之前，您需要先通过 [enableMixExternalAudioFrame]{@link TRTCCloud#enableMixExternalAudioFrame} 开启自定义音轨，之后就可以通过本接口将自己的音轨以 PCM 格式混入到 SDK 中。
     * 理想情况下，我们期望您的代码能够以非常均匀的速度向 SDK 提供音轨数据。但我们也非常清楚，完美的调用间隔是一个巨大的挑战。
     * 所以 SDK 内部会开启一个音轨数据的缓冲区，该缓冲区的作用类似一个“蓄水池”，它能够暂存您传入的音轨数据，平抑由于接口调用间隔的抖动问题。
     * 本接口的返回值代表这个音轨缓冲区的大小，单位是毫秒（ms），比如：如果该接口返回 50，则代表当前的音轨缓冲区有 50ms 的音轨数据。因此只要您在 50ms 内再次调用本接口，SDK 就能保证您混入的音轨数据是连续的。
     * 当您调用该接口后，如果发现返回值 > 100ms，则可以等待一帧音频帧的播放时间之后再次调用；如果返回值 < 100ms，则代表缓冲区比较小，您可以再次混入一些音轨数据以确保音轨缓冲区的大小维持在“安全水位”以上。
     * 
     * 参数 {@link TRTCAudioFrame} 推荐下列填写方式（其他字段不需要填写）：
     * - data：音频帧 buffer。音频帧数据只支持 PCM 格式，支持[5ms ~ 100ms]帧长，推荐使用 20ms 帧长，长度计算方法：【48000采样率、单声道的帧长度：48000 × 0.02s × 1 × 16bit = 15360bit = 1920字节】。
     * - sampleRate：采样率，支持：16000、24000、32000、44100、48000。
     * - channel：声道数（如果是立体声，数据是交叉的），单声道：1； 双声道：2。
     * - timestamp：时间戳，单位为毫秒（ms），请使用音频帧在采集时被记录下来的时间戳（可以在获得一帧音频帧之后，通过调用 [generateCustomPTS]{@link TRTCCloud#generateCustomPTS} 获得时间戳）。
     *
     * 注意：
     *  - 混入自定义音轨，需要有上行音频流驱动，支持的上行音频流包括：
     *    - SDK 默认采集的麦克风音频流，调用 [startLocalAudio]{@link TRTCCloud#startLocalAudio} 接口开启。
     *  - 请您精准地按每帧时长的间隔调用本接口，数据投送间隔不均匀时极易触发声音卡顿。
     * 
     * @param {TRTCAudioFrame} frame - 音频数据
     * @returns {Number} - 音频缓冲时长，单位：ms。< 0 错误（-1 未启用 mixExternalAudioFrame）
     */
    // mixExternalAudioFrame(frame: TRTCAudioFrame): number {
    //     return this.rtcCloud.mixExternalAudioFrame(frame);
    // }

    /**
     * 设置推流时混入外部音频的推流音量和播放音量
     * 
     * @param {Number} publishVolume - 设置的推流音量大小，范围0 - 100，-1表示不改变。
     * @param {Number} playoutVolume - 设置的播放音量大小，范围0 - 100，-1表示不改变。
     */
    // setMixExternalAudioVolume(publishVolume: number, playoutVolume: number): void {
    //     this.rtcCloud.setMixExternalAudioVolume(publishVolume, playoutVolume);
    // }

    /**
     * 生成自定义采集时的时间戳
     * 
     * 本接口仅适用于自定义采集模式，用于解决音视频帧的采集时间（capture time）和投送时间（send time）不一致所导致的音画不同步问题。
     * 当您通过 [sendCustomAudioData]{@link TRTCCloud#sendCustomAudioData} 等接口进行自定义视频或音频采集时，请按照如下操作使用该接口：
     *  1. 首先，在采集到一帧视频或音频帧时，通过调用本接口获得当时的 PTS 时间戳。
     *  2. 之后可以将该视频或音频帧送入您使用的前处理模块（如第三方美颜组件，或第三方音效组件）。
     *  3. 在真正调用 [sendCustomAudioData]{@link TRTCCloud#sendCustomAudioData} 进行投送时，请将该帧在采集时记录的 PTS 时间戳赋值给 {@link TRTCVideoFrame} 或 {@link TRTCAudioFrame} 中的 timestamp 字段。
     *
     * 
     * @returns {Number} - 时间戳（单位：ms）
     */
    // generateCustomPTS(): number {
    //     return this.rtcCloud.generateCustomPTS();
    // }

    /**
     * 设置音频数据自定义回调
     * 
     * 设置该回调之后，SDK 内部会把音频数据（PCM 格式）回调出来，包括：
     *   {onCapturedAudioFrame}：本地麦克风采集到的音频数据回调
     * - {onLocalProcessedAudioFrame}：本地采集并经过音频模块前处理后的音频数据回调
     * - {onPlayAudioFrame}：混音前的每一路远程用户的音频数据
     * - {onMixedPlayAudioFrame}：将各路音频混合之后并最终要由系统播放出的音频数据回调
     * - {onMixedAllAudioFrame}：SDK 所有音频混合后的音频数据（包括采集到的和待播放的）
     * 
     * 注意: 设置回调为空即代表停止自定义音频回调，反之，设置回调不为空则代表启动自定义音频回调。
     *
     * @example
     * import TRTCCloud from 'trtc-electron-sdk';
     * 
     * const rtcCloud = TRTCCloud.getTRTCShareInstance();
     * 
     * onCapturedAudioFrame(frame: TRTCAudioFrame) {}
     * onLocalProcessedAudioFrame(frame: TRTCAudioFrame) {}
     * onPlayAudioFrame(frame: TRTCAudioFrame, userId: string) {}
     * onMixedPlayAudioFrame(frame: TRTCAudioFrame) {}
     * onMixedAllAudioFrame(frame: TRTCAudioFrame) {}
     * 
     * // 设置音频数据自定义回调
     * rtcCloud.setAudioFrameCallback({
     *   onCapturedAudioFrame: onCapturedAudioFrame,
     *   onLocalProcessedAudioFrame: onLocalProcessedAudioFrame,
     *   onPlayAudioFrame: onPlayAudioFrame,
     *   onMixedPlayAudioFrame: onMixedPlayAudioFrame,
     *   onMixedAllAudioFrame: onMixedAllAudioFrame,
     * });
     * 
     * // 取消音频数据自定义回调
     * rtcCloud.setAudioFrameCallback({
     *   onCapturedAudioFrame: null,
     *   onLocalProcessedAudioFrame: null,
     *   onPlayAudioFrame: null,
     *   onMixedPlayAudioFrame: null,
     *   onMixedAllAudioFrame: null,
     * });
     * 
     * @param {TRTCAudioFrameCallback} callback - 音频数据自定义回调对象。
     * 
     */
    // setAudioFrameCallback(callback: TRTCAudioFrameCallback): void {
    //     this.rtcCloud.setAudioFrameCallback(callback.onCapturedAudioFrame, callback.onLocalProcessedAudioFrame,
    //         callback.onPlayAudioFrame, callback.onMixedPlayAudioFrame, callback.onMixedAllAudioFrame);
    // }

    /**
     * @private
     * 设置本地视频自定义渲染（Electron 平台下不可用）
     *
     * 注意：设置此方法，SDK 内部会把采集到的数据回调出来，SDK 跳过 HWND 渲染逻辑
     调用 setLocalVideoRenderCallback(TRTCVideoPixelFormat_Unknown, TRTCVideoBufferType_Unknown, nullptr) 停止回调
     * @param {TRTCVideoPixelFormat} pixelFormat 指定回调的像素格式
     * @param {TRTCVideoBufferType}  bufferType  指定视频数据结构类型
     * @param {Fuction} callback    自定义渲染回调
     * @return {Number} 0：成功；<0：错误
     */
    // setLocalVideoRenderCallback(
    //     pixelFormat: TRTCVideoPixelFormat,
    //     bufferType: TRTCVideoBufferType, callback: () => void
    // ): number {
    //     if (pixelFormat !== undefined && bufferType !== undefined && callback !== undefined) {
    //         if (callback !== null) {
    //             this.localVideoCallback = new VideoRenderCallback();
    //             this.localVideoCallback.callback = callback;
    //             this.localVideoCallback.pixelFormat = pixelFormat;
    //         } else {
    //             this.localVideoCallback = null;
    //         }
    //         return 0;
    //     } else {
    //         this.logger.error('setLocalVideoRenderCallback, param is error!');
    //         return -1;
    //     }
    // }

    /**
     * @private
     * 设置远端视频自定义渲染（Electron 平台下不可用）
     *
     * 此方法同 setLocalVideoRenderDelegate，区别在于一个是本地画面的渲染回调， 一个是远程画面的渲染回调。
     *
     * 注意：设置此方法，SDK 内部会把远端的数据解码后回调出来，SDK 跳过 HWND 渲染逻辑
     调用 setRemoteVideoRenderCallback(userId, TRTCVideoPixelFormat_Unknown, TRTCVideoBufferType_Unknown, null) 停止回调。
     * @param {String}               userId      用户标识
     * @param {TRTCVideoPixelFormat} pixelFormat 指定回调的像素格式
     * @param {TRTCVideoBufferType}  bufferType  指定视频数据结构类型
     * @param {Function} callback    自定义渲染回调
     * @return {Number} 0：成功；<0：错误
     */
    // setRemoteVideoRenderCallback(
    //     userId: string, pixelFormat: TRTCVideoPixelFormat,
    //     bufferType: TRTCVideoBufferType, callback: () => void
    // ): number {
    //     if (userId !== undefined && userId !== null
    //         && pixelFormat !== undefined && bufferType !== undefined && callback !== undefined) {
    //         if (callback !== null) {
    //             const remoteCallback = new VideoRenderCallback();
    //             remoteCallback.callback = callback;
    //             remoteCallback.pixelFormat = pixelFormat;
    //             this.remoteVideoCallback.set(String(userId), remoteCallback);
    //         } else {
    //             this.remoteVideoCallback.delete(String(userId));
    //         }
    //         return 0;
    //     } else {
    //         this.logger.error('setRemoteVideoRenderCallback, userId is error!');
    //         return -1;
    //     }
    // }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （十）自定义消息发送
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 发送自定义消息给房间内所有用户
     *
     * 该接口可以借助音视频数据通道向当前房间里的其他用户广播您自定义的数据，但因为复用了音视频数据通道，
     * 请务必严格控制自定义消息的发送频率和消息体的大小，否则会影响音视频数据的质量控制逻辑，造成不确定性的问题。
     *
     * 注意：本接口有以下限制：
     * - 发送消息到房间内所有用户，每秒最多能发送30条消息。
     * - 每个包最大为1KB，超过则很有可能会被中间路由器或者服务器丢弃。
     * - 每个客户端每秒最多能发送总计8KB数据。
     * - 将 reliable 和 ordered 同时设置为 true 或 false，暂不支持交叉设置。
     * - 强烈建议不同类型的消息使用不同的 cmdID，这样可以在要求有序的情况下减小消息时延。
     *
     * @param {Number}  cmdId    - 消息 ID，取值范围为1 - 10
     * @param {String}  msg      - 待发送的消息，最大支持1KB（1000字节）的数据大小
     * @param {Boolean} reliable - 是否可靠发送，可靠发送的代价是会引入一定的延时，因为接收端要暂存一段时间的数据来等待重传
     * @param {Boolean} ordered  - 是否要求有序，即是否要求接收端接收的数据顺序和发送端发送的顺序一致，这会带来一定的接收延时，因为在接收端需要暂存并排序这些消息
     * @return {Boolean} true：消息已经发出；false：消息发送失败
     */
    // sendCustomCmdMsg(
    //     cmdId: number, msg: string, reliable: boolean, ordered: boolean
    // ) {
    //     return this.rtcCloud.sendCustomCmdMsg(cmdId, msg, reliable, ordered);
    // }

    /**
     * 将小数据量的自定义数据嵌入视频帧中
     *
     * 跟 sendCustomCmdMsg 的原理不同，sendSEIMsg 是将数据直接塞入视频数据头中。因此，即使视频帧被旁路到了直播 CDN 上，
     * 这些数据也会一直存在。但是由于要把数据嵌入视频帧中，所以数据本身不能太大，推荐几个字节就好。
     *
     * 最常见的用法是把自定义的时间戳（timstamp）用 sendSEIMsg 嵌入视频帧中，这种方案的最大好处就是可以实现消息和画面的完美对齐。
     *
     * 注意：本接口有以下限制：
     * - 数据在接口调用完后不会被即时发送出去，而是从下一帧视频帧开始带在视频帧中发送。
     * - 发送消息到房间内所有用户，每秒最多能发送30条消息（与 sendCustomCmdMsg 共享限制）。
     * - 每个包最大为1KB，若发送大量数据，会导致视频码率增大，可能导致视频画质下降甚至卡顿（与 sendCustomCmdMsg 共享限制）。
     * - 每个客户端每秒最多能发送总计8KB数据（与 sendCustomCmdMsg 共享限制）。
     * - 若指定多次发送（repeatCount>1），则数据会被带在后续的连续 repeatCount 个视频帧中发送出去，同样会导致视频码率增大。
     * - 如果 repeatCount>1，多次发送，接收消息 onRecvSEIMsg 回调也可能会收到多次相同的消息，需要去重。
     *
     * @param {String} msg         - 待发送的数据，最大支持1kb（1000字节）的数据大小
     * @param {Number} repeatCount - 发送数据次数
     * @return {Boolean} true：消息已通过限制，等待后续视频帧发送；false:消息被限制发送
     */
    // sendSEIMsg(msg: string, repeatCount: number): boolean {
    //     return this.rtcCloud.sendSEIMsg(msg, repeatCount);
    // }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （十一）背景混音相关接口函数
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 废弃接口： 启动播放背景音乐
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 startPlayMusic 接口替代。
     *
     * @param {String} path - 音乐文件路径
     */
    playBGM(path: string): void {
        const musicParam = new AudioMusicParam();
        musicParam.id = this.bgmId;
        musicParam.publish = true;
        musicParam.path = path;
        this.startPlayMusic(musicParam)
    }


    /**
     * 废弃接口： 停止播放背景音乐
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 stopPlayMusic 接口替代。
     *
     */
    stopBGM(): void {
        this.stopPlayMusic(this.bgmId);
    }

    /**
     * 废弃接口： 暂停播放背景音乐
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 pausePlayMusic 接口替代。
     *
     */
    pauseBGM(): void {
        this.pausePlayMusic(this.bgmId);
    }

    /**
     * 废弃接口： 继续播放背景音乐
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 resumePlayMusic 接口替代。
     *
     */
    resumeBGM(): void {
        this.resumePlayMusic(this.bgmId);
    }

    /**
     * 废弃接口： 获取背景音乐文件总时长，单位毫秒
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 getMusicDurationInMS 接口替代。
     *
     * @param {String} path - 音乐文件路径
     * @return {Number} 成功返回时长，失败返回-1
     */
    getBGMDuration(path: string): number {
        return this.getMusicDurationInMS(path);
    }

    /**
     * 废弃接口： 设置背景音乐播放进度
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 seekMusicToPosInTime 接口替代。
     *
     * @param {Number} pos - 单位毫秒
     */
    setBGMPosition(pos: number): void {
        this.seekMusicToPosInTime(this.bgmId, pos);
    }

    /**
     * 废弃接口： 设置背景音乐的音量大小，播放背景音乐混音时使用，用来控制背景音音量大小
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 setAllMusicVolume 接口替代。
     *
     * @param {Number} volume - 音量大小，100为正常音量，取值范围为0 - 200。
     */
    setBGMVolume(volume: number): void {
        this.setAllMusicVolume(volume);
    }

    /**
     * 废弃接口： 设置背景音乐本地播放音量的大小
     *
     * 播放背景音乐混音时使用，用来控制背景音乐在本地播放时的音量大小。
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 setMusicPlayoutVolume 接口替代。
     *
     * @param {Number} volume - 音量大小，100为正常音量，取值范围为0 - 100；默认值：100
     */
    setBGMPlayoutVolume(volume: number): void {
        this.setMusicPlayoutVolume(this.bgmId, volume);
    }

    /**
     * 废弃接口： 设置背景音乐远端播放音量的大小
     *
     * 播放背景音乐混音时使用，用来控制背景音乐在远端播放时的音量大小。
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 setMusicPublishVolume 接口替代。
     *
     * @param {Number} volume - 音量大小，100为正常音量，取值范围为0 - 100；默认值：100
     */
    setBGMPublishVolume(volume: number): void {
        this.setMusicPublishVolume(this.bgmId, volume);
    }

    /**
     * 打开系统声音采集
     *
     * 开启后可以采集整个操作系统的播放声音（path 为空）或某一个播放器（path 不为空）的声音，
     * 并将其混入到当前麦克风采集的声音中一起发送到云端。
     *
     * @param {String} path - 不传 path 或为 null，代表采集整个操作系统的声音；path 填写 exe 程序（如 QQ音乐）所在的路径，将会启动此程序并只采集此程序的声音。
     *
     */
    startSystemAudioLoopback(path?: string | null): void {
        if (path === undefined || path === null) {
            this.rtcCloud.startSystemAudioLoopback(null);
        } else {
            path = path.replace('file:///', '');
            this.rtcCloud.startSystemAudioLoopback(path);
        }
    }

    /**
     * 关闭系统声音采集
     */
    stopSystemAudioLoopback(): void {
        this.rtcCloud.stopSystemAudioLoopback();
    }

    /**
     * 设置系统声音采集的音量
     *
     * @param {Number} volume - 音量大小，取值范围为0 - 100。
     */
    setSystemAudioLoopbackVolume(volume: number): void {
        this.rtcCloud.setSystemAudioLoopbackVolume(volume);
    }

    /**
     * 设置背景音乐的事件回调监听
     * 
     * 请在播放背景音乐之前使用该接口设置播放事件回调，以便感知背景音乐的播放进度。
     * 
     * @param {TRTCMusicPlayObserver} observer - 背景音乐播放事件回调
     * 
     */
    setMusicObserver(observer: TRTCMusicPlayObserver): void {
        this.audioEffectManager.setMusicObserver(observer);
    }

    /**
     * 开始播放背景音乐
     *
     * @param {AudioMusicParam} musicParam - 背景音乐参数
     * @param {TRTCMusicPlayObserver} [observer] - <span style="color:red;">该可选入参已经废弃。</span> 播放音乐事件回调监听，请使用 [setMusicObserver()]{@link TRTCCloud#setMusicObserver} 接口设置背景音乐事件回调。
     *
     * @example
     * import TRTCCloud, { AudioMusicParam } from 'trtc-electron-sdk';
     * const rtcCloud = TRTCCloud.getTRTCShareInstance();
     * 
     * // 设置背景音乐播放事件监听
     * rtcCloud.setMusicObserver({
     *      onStart: (id: number, errCode: number) => {
     *        console.log(`onStart, id: ${id}, errorCode: ${errCode}`);
     *      },
     *      onPlayProgress: (id: number, curPtsMS: number, durationMS: number) => {
     *        console.log(`onPlayProgress, id: ${id}, curPtsMS: ${curPtsMS}, durationMS: ${durationMS}`);
     *      },
     *      onComplete: (id: number, errCode: number) => {
     *          console.log(`onComplete, id: ${id}, errCode: ${errCode}`);
     *      }
     * });
     * 
     * // 开始播放背景音乐
     * const params = new AudioMusicParam();
     * params.id = 1;
     * params.path = 'path';
     * params.publish = true;
     * rtcCloud.startPlayMusic(params);
     */
    startPlayMusic(musicParam: AudioMusicParam, callbackMap?: TRTCMusicPlayObserver): void {
        if (callbackMap?.onStart || callbackMap?.onPlayProgress || callbackMap?.onComplete) {
            this.audioEffectManager.setMusicObserver(callbackMap);
        }
        this.audioEffectManager.startPlayMusic(musicParam);
    }

    /**
     * 停止播放背景音乐
     *
     * @param {Number} id - 音乐 ID
     */
    stopPlayMusic(id: number): void {
        this.audioEffectManager.stopPlayMusic(id);
    }

    /**
     * 暂停播放背景音乐
     *
     * @param {Number} id 音乐 ID
     */
    pausePlayMusic(id: number): void {
        this.audioEffectManager.pausePlayMusic(id);
    }

    /**
     * 恢复播放背景音乐
     *
     * @param {Number} id 音乐 ID
     */
    resumePlayMusic(id: number): void {
        this.audioEffectManager.resumePlayMusic(id);
    }

    /**
   * 获取背景音乐的播放进度（单位：毫秒）
   *
   * @param {Number} id - 音乐 ID。
   * @return {Promise<number>|Number} 成功返回当前播放时间，单位：毫秒，失败返回 -1。
   */
    public getMusicCurrentPosInMS(id: number): Promise<number>|number {
        return this.audioEffectManager.getMusicCurrentPosInMS(id);
    }

    /**
     * 获取背景音乐文件总时长，单位毫秒
     *
     * @param {String} path - 音乐文件路径
     * @return {Number} 成功返回时长，失败返回-1
     */
    getMusicDurationInMS(path: string): number {
        path = path.replace('file:///', '');
        if (TRTCCloud.isIPCMode) {
            this.audioEffectManager.getMusicDurationInMS(path);
            return this.stateStore.get(`musicDuration-{path}`);
        } else {
            return this.audioEffectManager.getMusicDurationInMS(path) as number;
        }
    }

    /**
     * 设置背景音乐播放进度
     *
     * @param {Number} id - 音乐 ID
     * @param {Number} pts - 单位: 毫秒
     */
    seekMusicToPosInTime(id: number, pts: number): void {
        this.audioEffectManager.seekMusicToPosInTime(id, pts);
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
     */
    setAllMusicVolume(volume: number): void {
        this.audioEffectManager.setAllMusicVolume(volume);
    }

    /**
     * 设置背景音乐本地播放音量的大小
     *
     * 播放背景音乐混音时使用，用来控制背景音乐在本地播放时的音量大小。
     *
     * @param {Number} id - 音乐 ID
     * @param {Number} volume - 音量大小，100为正常音量，取值范围为0 - 100；默认值：100
     */
    setMusicPlayoutVolume(id: number, volume: number): void {
        this.audioEffectManager.setMusicPlayoutVolume(id, volume);
    }

    /**
     * 设置背景音乐远端播放音量的大小
     *
     * 播放背景音乐混音时使用，用来控制背景音乐在远端播放时的音量大小。
     *
     * @param {Number} id - 音乐 ID
     * @param {Number} volume - 音量大小，100为正常音量，取值范围为0 - 100；默认值：100
     */
    setMusicPublishVolume(id: number, volume: number): void {
        this.audioEffectManager.setMusicPublishVolume(id, volume);
    }

    /**
     * 开启耳返
     * 
     * 主播开启耳返后，可以在耳机里听到麦克风采集到的自己发出的声音，该特效适用于主播唱歌的应用场景中。
     * 
     * 需要您注意的是，由于蓝牙耳机的硬件延迟非常高，所以在主播佩戴蓝牙耳机时无法开启此特效，请尽量在用户界面上提示主播佩戴有线耳机。同时也需要注意，并非所有的手机开启此特效后都能达到优秀的耳返效果，我们已经对部分耳返效果不佳的手机屏蔽了该特效。
     * @param {Boolean} enable - 是否开启耳返。
     */
    enableVoiceEarMonitor(enable: boolean): void {
        this.audioEffectManager.enableVoiceEarMonitor(enable);
    }

    /**
     * 设置耳返音量
     * 
     * 通过该接口您可以设置耳返特效中声音的音量大小。
     * 
     * 如果将 volume 设置成 100 之后感觉音量还是太小，可以将 volume 最大设置成 150，但超过 100 的 volume 会有爆音的风险，请谨慎操作。
     * @param {Number} volumn - 音量大小，取值范围为0 - 100，默认值：100。
     */
    setVoiceEarMonitorVolume(volumn: number): void {
        this.audioEffectManager.setVoiceEarMonitorVolume(volumn);
    }

    /**
     * 设置语音音量
     * 
     * 该接口可以设置语音音量的大小，一般配合音乐音量的设置接口 setAllMusicVolume 协同使用，用于调谐语音和音乐在混音前各自的音量占比。
     * 
     * 如果将 volume 设置成 100 之后感觉音量还是太小，可以将 volume 最大设置成 150，但超过 100 的 volume 会有爆音的风险，请谨慎操作。
     * @param {Number} volume - 音量大小，取值范围为0 - 100，默认值：100。
     */
    setVoiceCaptureVolume(volume: number): void {
        this.audioEffectManager.setVoiceCaptureVolume(volume);
    }

    /**
     * 设置语音音调
     * 
     * 该接口可以设置语音音调，用于实现变调不变速的目的。
     * @param {Number} pitch - 音调，取值范围为-1.0f~1.0f，默认值：0.0f。
     */
    setVoicePitch(pitch: number): void {
        if (pitch < -1.0 || pitch > 1.0) {
            throw new Error('pitch is out of range [-1.0, 1.0]');
        }
        this.audioEffectManager.setVoicePitch(pitch);
    }

    /**
     * 设置人声的混响效果
     * 
     * 通过该接口您可以设置人声的混响效果，具体特效请参见枚举定义。
     * 
     * 注意：设置的效果在退出房间后会自动失效，如果下次进房还需要对应特效，需要调用此接口再次进行设置。
     * 
     * @param {TRTCVoiceReverbType} type - 人声的混响效果类型。
     */
    setVoiceReverbType(type: TRTCVoiceReverbType): void {
        this.audioEffectManager.setVoiceReverbType(type);
    }

    /**
     * 设置人声的变声效果
     * 
     * 通过该接口您可以设置人声的变声效果，具体特效请参见枚举定义
     * 
     * 注意：设置的效果在退出房间后会自动失效，如果下次进房还需要对应特效，需要调用此接口再次进行设置
     * @param {TRTCVoiceChangerType} type - 人声的变声效果类型 。
     */
    setVoiceChangerType(type: TRTCVoiceChangerType): void {
        this.audioEffectManager.setVoiceChangerType(type);
    }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （十二）音效相关接口函数
    //
    /////////////////////////////////////////////////////////////////////////////////

    /**
     * 废弃接口： 播放音效
     *
     * 每个音效都需要您指定具体的 ID，您可以通过该 ID 对音效的开始、停止、音量等进行设置。
     * 若您想同时播放多个音效，请分配不同的 ID 进行播放。因为使用同一个 ID 播放不同音效，SDK 将会停止上一个 ID 对应的音效播放，再启动新的音效播放。
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 startPlayMusic 接口替代。
     *
     * @param {TRTCAudioEffectParam} effect - 音效
     * @throws {String}
     */
    playAudioEffect(effect: TRTCAudioEffectParam) {
        const musicParam = new AudioMusicParam();
        musicParam.id = effect.effectId;
        musicParam.path = effect.path;
        musicParam.loopCount = effect.loopCount;
        musicParam.publish = effect.publish;
        this.startPlayMusic(musicParam);
        if (this.playAudioEffectIdList.indexOf(effect.effectId) === -1) {
            this.playAudioEffectIdList.push(effect.effectId);
        }
    }

    /**
     * 废弃接口： 设置音效音量
     *
     * 注意：会覆盖通过 setAllAudioEffectsVolume 指定的整体音效音量。
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 setMusicPublishVolume, setMusicPlayoutVolume 接口替代。
     *
     * @param {Number} effectId - 音效 ID
     * @param {Number} volume   - 音量大小，取值范围为0 - 100；默认值：100
     */
    setAudioEffectVolume(effectId: number, volume: number) {
        this.setMusicPublishVolume(effectId, volume);
        this.setMusicPlayoutVolume(effectId, volume);
    }

    /**
     * 废弃接口： 停止音效
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 stopPlayMusic 接口替代。
     *
     * @param {Number} effectId - 音效 ID
     */
    stopAudioEffect(effectId: number) {
        this.stopPlayMusic(effectId);
        this.playAudioEffectIdList = this.playAudioEffectIdList.filter(id => id !== effectId)
    }

    /**
     * 废弃接口： 停止所有音效
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃
     *
     */
    stopAllAudioEffects() {
        for (let i = 0; i < this.playAudioEffectIdList.length; i++) {
            this.stopPlayMusic(this.playAudioEffectIdList[i]);
        }
        this.playAudioEffectIdList = [];
    }

    /**
     * 废弃接口： 设置所有音效的音量
     *
     * 注意：该操作会覆盖通过 setAudioEffectVolume 指定的单独音效音量。
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 setAllMusicVolume 接口替代。
     *
     * @param {Number} volume - 音量大小，取值范围为0 - 100；默认值：100
     */
    setAllAudioEffectsVolume(volume: number) {
        this.setAllMusicVolume(volume);
    }

    /**
     * 废弃接口： 暂停音效
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 pausePlayMusic 接口替代。
     *
     * @param {Number} effectId - 音效 ID
     */
    pauseAudioEffect(effectId: number) {
        this.pausePlayMusic(effectId);
    }

    /**
     * 废弃接口： 恢复音效
     *
     * @deprecated 从 TRTCSDK 8.0 后该接口已被废弃，请使用 resumePlayMusic 接口替代。
     *
     * @param {Number} effectId - 音效 ID
     */
    resumeAudioEffect(effectId: number) {
        this.resumePlayMusic(effectId);
    }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （十三）设备和网络测试
    //
    /////////////////////////////////////////////////////////////////////////////////
    /**
     * 开始进行网络测速（视频通话期间请勿测试，以免影响通话质量）
     *
     * 测速结果将会用于优化 SDK 接下来的服务器选择策略，因此推荐您在用户首次通话前先进行一次测速，这将有助于我们选择最佳的服务器。
     * 同时，如果测试结果非常不理想，您可以通过醒目的 UI 提示用户选择更好的网络。
     *
     * 注意：
     * 1. 测速过程将产生少量的基础服务费用，详见 [计费概述 > 基础服务](https://cloud.tencent.com/document/product/647/17157#.E5.9F.BA.E7.A1.80.E6.9C.8D.E5.8A.A1) 文档说明。
     * 2. 请在进入房间前进行网速测试，在房间中网速测试会影响正常的音视频传输效果，而且由于干扰过多，网速测试结果也不准确。
     * 3. 同一时间只允许一项网速测试任务运行。
     *
     * @param {TRTCSpeedTestParams} params - 测速参数
     * @param {Number} params.sdkAppId     - 应用标识
     * @param {String} params.userId       - 用户标识
     * @param {String} params.userSig      - 用户签名
     * @param {Number} params.expectedUpBandwidth - 预期的上行带宽（kbps，取值范围： 10 ～ 5000，为 0 时不测试）。
     * @param {Number} params.expectedDownBandwidth - 预期的下行带宽（kbps，取值范围： 10 ～ 5000，为 0 时不测试）。
     * @param {Number} params.scene        - 测速场景
     *
     * @return 接口调用结果，< 0：失败
     */
    startSpeedTest(params: TRTCSpeedTestParams | number, userId?: string, userSig?: string) {
        if (params instanceof TRTCSpeedTestParams) {
            return this.rtcCloud.startSpeedTest(params);
        }
        if (userId !== undefined && userSig !== undefined) {
            const sdkAppId = params;
            const speedTestParams = new TRTCSpeedTestParams(sdkAppId, userId, userSig);
            return this.rtcCloud.startSpeedTest(params);
        }
        this.logger.error('startSpeedTest, param is error');
        return -1;
    }

    /**
     * 停止网络测速
     */
    stopSpeedTest() {
        this.rtcCloud.stopSpeedTest();
    }

    /**
     * 开始进行摄像头测试
     *
     * 会触发 onFirstVideoFrame 回调接口
     *
     * 注意：在测试过程中可以使用 setCurrentCameraDevice 接口切换摄像头。
     *
     * @param {HTMLElement} view - 承载预览画面的 DOM
     */
    // startCameraDeviceTest(view: HTMLElement): void {
    //     if (view !== undefined) {
    //         if (view !== null) {
    //             const key = this._getKey(CAMERA_DEVICE_TEST_VIEW, TRTCVideoStreamType.TRTCVideoStreamTypeBig);
    //             this._initRenderer(key, [view]);
    //             const rendererMap = this.videoRendererMap.get(key);
    //             if (rendererMap) {
    //                 rendererMap.forEach((value: IRenderer) => {
    //                     value.setContentMode(TRTCVideoFillMode.TRTCVideoFillMode_Fill);
    //                 })
    //             }
    //         }

    //         // Buffer 为 null 时才新建，否则只能在 handleVideoSizeChange 事件中重新申请 Buffer
    //         if (!this.localVideoBufferMap.cameraTest.buffer) {
    //             const streamType = TRTCVideoStreamType.TRTCVideoStreamTypeBig;
    //             this.localVideoBufferMap.cameraTest.streamType = streamType;
    //             this.localVideoBufferMap.cameraTest.pixelFormat = this.pixelFormat;
    //             this.localVideoBufferMap.cameraTest.buffer = allocBuffer(DEFAULT_VIDEO_WIDTH * DEFAULT_VIDEO_HEIGHT * this.pixelLength);
    //             this.localVideoBufferMap.cameraTest.id = generateUniqueId();
    //             this.localVideoBufferMap.cameraTest.width = DEFAULT_VIDEO_WIDTH;
    //             this.localVideoBufferMap.cameraTest.height = DEFAULT_VIDEO_HEIGHT;
    //             this.rtcCloud.setCameraTestVideoBuffer(
    //                 this.localVideoBufferMap.cameraTest.buffer, this.localVideoBufferMap.cameraTest.width, this.localVideoBufferMap.cameraTest.height,
    //                 this.localVideoBufferMap.cameraTest.pixelFormat, this.localVideoBufferMap.cameraTest.id
    //             );
    //         }

    //         this.rtcCloud.startCameraDeviceTest((args: Array<any>) => {
    //             const [id, type, width, height, timestamp, rotation, valid, bufferId] = args as Array<any>;
    //             if (this.enableRenderFrame) {
    //                 if (valid === true) {
    //                     if (this.localVideoBufferMap.cameraTest.id === bufferId) {
    //                         this._onRenderFrame(CAMERA_DEVICE_TEST_ID, type, width, height, timestamp, rotation, this.localVideoBufferMap.cameraTest.buffer);
    //                     } else {
    //                         this.logger.log('camera video buffer reallocated');
    //                     }
    //                 } else {
    //                     this.handleVideoSizeChange(CAMERA_DEVICE_TEST_ID, type, width, height);
    //                 }
    //             }
    //         });
    //     } else {
    //         this.logger.error('startCameraDeviceTest, view is undefined!');
    //     }
    // }

    /**
     * 停止摄像头测试
     */
    // stopCameraDeviceTest(): void {
    //     const key = this._getKey(CAMERA_DEVICE_TEST_VIEW, TRTCVideoStreamType.TRTCVideoStreamTypeBig);
    //     this._destroyRenderer(key, null);
    //     this.rtcCloud.stopCameraDeviceTest();

    //     if (this.localVideoBufferMap.cameraTest.buffer) {
    //         this.rtcCloud.setCameraTestVideoBuffer(this.localVideoBufferMap.cameraTest.buffer, 0, 0, this.localVideoBufferMap.cameraTest.pixelFormat, this.localVideoBufferMap.cameraTest.id);
    //         this.localVideoBufferMap.cameraTest.buffer = null;
    //         this.localVideoBufferMap.cameraTest.id = 0;
    //     }
    // }

    /**
     * 开始进行麦克风测试
     *
     * 回调接口 onTestMicVolume 获取测试数据
     *
     * 该方法测试麦克风是否能正常工作，volume 的取值范围为0 - 100。
     *
     * @param {Number} interval - 反馈音量提示的时间间隔（ms），建议设置到大于 200 毫秒
     * @param {Boolean} [playback] - 是否开启回播麦克风声音，开启后用户测试麦克风时会听到自己的声音，如果不传递playback参数，则默认为false。
     */
    startMicDeviceTest(interval: number, playback?: boolean):void {
        if (playback === undefined || playback === null) {
            playback = false;
        }
        this.deviceManager.startMicDeviceTest(interval, playback);
    }

    /**
     * 停止麦克风测试
     */
    stopMicDeviceTest(): void {
        this.deviceManager.stopMicDeviceTest();
    }

    /**
     * 开始进行扬声器测试
     *
     * 回调接口 onTestSpeakerVolume 获取测试数据
     *
     * 该方法播放指定的音频文件测试播放设备是否能正常工作。如果能听到声音，说明播放设备能正常工作。
     *
     * @param {String} testAudioFilePath - 音频文件的绝对路径，路径字符串使用 UTF-8 编码格式，支持文件格式：WAV、MP3
     */
    startSpeakerDeviceTest(testAudioFilePath: string):void {
        testAudioFilePath = testAudioFilePath.replace('file:///', '');
        this.deviceManager.startSpeakerDeviceTest(testAudioFilePath);
    }

    /**
     * 停止扬声器测试
     */
    stopSpeakerDeviceTest(): void {
        this.deviceManager.stopSpeakerDeviceTest();
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
    getSDKVersion(): string {
        return this.rtcCloud.getSDKVersion();
    }

    /**
     * 设置 Log 输出级别
     *
     * @param {TRTCLogLevel} level - Log 输出等级，默认值：TRTCLogLevelNone
     * - TRTCLogLevelNone   : 不输出任何 SDK Log
     * - TRTCLogLevelVerbose: 输出所有级别的 Log
     * - TRTCLogLevelDebug  : 输出 DEBUG，INFO，WARNING，ERROR 和 FATAL 级别的 Log
     * - TRTCLogLevelInfo   : 输出 INFO，WARNNING，ERROR 和 FATAL 级别的 Log
     * - TRTCLogLevelWarn   : 只输出WARNNING，ERROR 和 FATAL 级别的 Log
     * - TRTCLogLevelError  : 只输出ERROR 和 FATAL 级别的 Log
     * - TRTCLogLevelFatal  : 只输出 FATAL 级别的 Log
     */
    setLogLevel(level: TRTCLogLevel) {
        logger.setLogLevel(level);
        this.logger.setLogLevel(level);
        this.rtcCloud.setLogLevel(level);
    }

    /**
     * 启用或禁用控制台日志打印
     *
     * @param {Boolean} enabled - 指定是否启用，默认为禁止状态
     */
    setConsoleEnabled(enabled: boolean) {
        this.rtcCloud.setConsoleEnabled(enabled);
    }

    /**
     * 启用或禁用 Log 的本地压缩
     *
     * 开启压缩后，Log 存储体积明显减小，但需要腾讯云提供的 Python 脚本解压后才能阅读。
     * 禁用压缩后，Log 采用明文存储，可以直接用记事本打开阅读，但占用空间较大。
     *
     * @param {Boolean} enabled - 指定是否启用，默认为禁止状态
     */
    setLogCompressEnabled(enabled: boolean) {
        this.rtcCloud.setLogCompressEnabled(enabled);
    }

    /**
     * 设置日志保存路径
     *
     * 通过该接口您可以更改 SDK 本地日志的默认存储路径，SDK 默认的本地日志的存储位置：
     * - windows 日志文件默认保存在 C:/Users/[系统用户名]/AppData/Roaming/liteav/log，即 %appdata%/liteav/log 下，如需修改，必须在所有方法前调用。
     * - mac 日志文件默认保存在 sandbox Documents/log 下，如需修改，必须在所有方法前调用。
     * 
     * 注意：请务必在所有其他接口之前调用，并且保证您指定的目录是存在的，并且您的应用程序拥有对该目录的读写权限。
     *
     * @param {String} path - 存储日志的文件夹，例如 "D:\\Log"，UTF-8 编码
     */
    setLogDirPath(path: string) {
        path = path.replace('file:///', '');
        this.rtcCloud.setLogDirPath(path);
    }

    /**
     * 设置日志回调
     * 
     * 注意: 如何您设置了日志回调，SDK的日志信息将会回调给您，您需要自行在代码中处理。当 callback 为 null 时取消日志回调，SDK 将不会再回调日志。
     * 
     * @param {Function | null} callback - 日志回调。 Function 的参数格式为 (log:string, level:TRTCLogLevel, module:string) => void。
     */
    setLogCallback(callback?: (log:string, level:TRTCLogLevel, module:string) => void | null): void {
        this.rtcCloud.setLogCallback(callback);
    }

    /**
     * 调用实验性 API 接口
     *
     * 注意：该接口用于调用一些实验性功能
     *
     * @param {String} jsonStr - 接口及参数描述的 JSON 字符串
     */
    callExperimentalAPI(jsonStr: string): void {
        this.rtcCloud.callExperimentalAPI(jsonStr);
    }

    /////////////////////////////////////////////////////////////////////////////////
    //
    //                      （十五） 废弃接口函数
    //
    /////////////////////////////////////////////////////////////////////////////////

    ///------------------------内部方法-----------------------------
    // private _localVideoRenderCallback(args: Array<any>): void {
    //     const [id, type, width, height, timestamp, rotation, valid, bufferId] = args as Array<any>;
    //     if (this.enableRenderFrame) {
    //         if (valid === true) {
    //             if (
    //                 this.isScreenCapturing
    //                 && this.screenCaptureStreamType === type
    //                 && this.localVideoBufferMap.sub
    //                 && this.localVideoBufferMap.sub.id === bufferId
    //             ) {
    //                 this._onRenderFrame(id, type, width, height, timestamp, rotation, this.localVideoBufferMap.sub.buffer);
    //             } else if (this.localVideoBufferMap.big.id === bufferId) {
    //                 this._onRenderFrame(id, type, width, height, timestamp, rotation, this.localVideoBufferMap.big.buffer);
    //             } else {
    //                 this.logger.log(`${id} ${type} video buffer reallocated`);
    //             }
    //         } else {
    //             this.handleVideoSizeChange(id, type, width, height);
    //         }
    //     }
    // }

    // public addLocalVideoRenderCallback(): void {
    //     this.rtcCloud.addLocalVideoRenderCallback(this._localVideoRenderCallback, this.pixelFormat);
    // }

    // public removeLocalVideoRenderCallback(): void {
    //     this.rtcCloud.removeLocalVideoRenderCallback();
    // }

    // private _remoteVideoRenderCallback(args: Array<any>): void {
    //     const [id, type, width, height, timestamp, rotation, valid, bufferId] = args as Array<any>;
    //     if (this.enableRenderFrame) {
    //         if (valid === true) {
    //             const remoteUserVideoBuffers = this.remoteVideoBufferMap.get(id)
    //             if (remoteUserVideoBuffers) {
    //                 if (type === TRTCVideoStreamType.TRTCVideoStreamTypeBig && remoteUserVideoBuffers.big && remoteUserVideoBuffers.big.id === bufferId) {
    //                     this._onRenderFrame(id, type, width, height, timestamp, rotation, remoteUserVideoBuffers.big.buffer);
    //                 } else if (type === TRTCVideoStreamType.TRTCVideoStreamTypeSmall && remoteUserVideoBuffers.small && remoteUserVideoBuffers.small.id === bufferId) {
    //                     this._onRenderFrame(id, type, width, height, timestamp, rotation, remoteUserVideoBuffers.small.buffer);
    //                 } else if (type === TRTCVideoStreamType.TRTCVideoStreamTypeSub && remoteUserVideoBuffers.sub && remoteUserVideoBuffers.sub.id === bufferId) {
    //                     this._onRenderFrame(id, type, width, height, timestamp, rotation, remoteUserVideoBuffers.sub.buffer);
    //                 } else {
    //                     this.logger.log(`${id} ${type} video buffer reallocated`);
    //                 }
    //             } else {
    //                 this.logger.warn(`no remote video render for frame:`, args);
    //             }
    //         } else {
    //             this.handleVideoSizeChange(id, type, width, height);
    //         }
    //     }
    // }

    // public addRemoteVideoRenderCallback(userId: string): void {
    //     this.rtcCloud.addRemoteVideoRenderCallback(userId, this._remoteVideoRenderCallback, this.pixelFormat);
    // }

    // public removeRemoteVideoRenderCallback(userId: string): void {
    //     this.rtcCloud.removeRemoteVideoRenderCallback(userId);
    // }

    //----------------------------------//
    // Render Mode API
    //----------------------------------//
    /**
     * 废弃接口：选择绘制的模式 (webgl/yuvcanvs/)
     *
     * @deprecated 从 10.3.403 版本该接口被废弃。SDK 内部会根据视频流数据，自动选择合适的渲染方式，可能的渲染方式有 WebGL、Canvas 2D、video 标签。调用该接口不再修改视频的渲染方式。
     *
     * @param {Number} mode -
     * - 1  webgl
     * - 2  yuvcanvs
     */
    // setRenderMode(mode: number = 1): void {
    //     this.logger.warn('setRenderMode() interface is deprecated and do not need any more');
    // }

    //----------------------------------//
    // plugin API -- start
    //----------------------------------//
    /**
     * 设置自定义插件配置参数
     * 
     * 调用 [addPlugin]{@link TRTCCloud#addPlugin} 接口添加插件前，需要先调用本接口设置配置参数，否则插件不会启动、运行。
     * 
     * @param type {TRTCPluginType} - 插件类型
     * @param config {TRTCVideoProcessPluginOptions | TRTCMediaEncryptDecryptPluginOptions | TRTCAudioProcessPluginOptions} - 插件配置参数
     */
    // setPluginParams(type: TRTCPluginType, options: TRTCVideoProcessPluginOptions | TRTCMediaEncryptDecryptPluginOptions | TRTCAudioProcessPluginOptions): void {
    //     this.logger.log(`setPluginParams params:`, type, options);
    //     this.pluginManager.setPluginParams(type, options);
    // }

    /**
     * 添加插件
     * 
     * 
     * @param options - 插件信息
     * @param options.id {String} - 插件ID，必填，多个插件之间不能重复。
     * @param options.path {String} - 插件库文件路径，必填。Windows 下为 ".dll" 文件，Mac 下为 ".dylib" 文件。
     * @param options.type {TRTCPluginType} - 插件类型，1表示自定义美颜插件，2表示音视频自定义加解密插件, 3表示音频自定义处理插件。
     * @param [options.deviceId] {String} - 摄像头设备 ID，开启多个摄像头美颜时必填。
     * @returns {TRTCPluginInfo}
     * 
     */
    // addPlugin(options: { id: string, path: string, type?: TRTCPluginType, deviceId?: string }): TRTCPluginInfo {
    //     return this.pluginManager.addPlugin(options);
    // }

    /**
     * 删除插件
     * 
     * 
     * @param id {String} - 插件ID，必填。
     * @param [deviceId] {String} - 摄像头设备 ID，开启多个摄像头美颜时必填。
     */
    // removePlugin(id: string, deviceId?: string): void {
    //     this.pluginManager.removePlugin(id, deviceId || "");
    // }

    /**
     * 注册插件事件监听，全局只需要调用一次
     * @param {Function} pluginCallback - 插件事件回调函数
     *  - pluginId - 插件ID
     *  - errorCode - 错误码。0、-1、-2、-3、-4、-5 是 SDK 内部定义错误码，其它错误码是插件自定义错误码。
     *     - 0 表示 addPlugin 成功
     *     - -1 插件库加载失败
     *     - -2 插件库缺少插件创建函数
     *     - -3 创建函数执行失败
     *     - -4 插件初始化函数执行失败
     *     - -5 插件加载资源函数执行失败
     *  - msg - 错误信息
     * 
     *  注意：错误码：-1000 到 1000 是 SDK 预留错误码，用户自定义插件中，请使用这个范围以外的错误码。
     */
    // setPluginCallback(pluginCallback: (pluginId: string, errorCode: number, msg: string) => void): void {
    //     this.pluginManager.setCallback(pluginCallback);
    // }

    /** 
     * 初始化插件管理器
     * 
     * @deprecated 请使用 [setPluginParams]{@link TRTCCloud#setPluginParams} 接口<br/>
     * 
     * 启动美颜插件管理器，并设置视频在美颜处理时的像素格式和数据传递方式。
     * 
     * @param [options] 视频预处理参数，非必填。
     * @param {TRTCVideoPixelFormat} options.pixelFormat - 视频像素格式，默认值：`TRTCVideoPixelFormat_I420`。
     *  - 当数据传递方式为纹理 `TRTCVideoBufferType_Texture` 时，取值必须为 `TRTCVideoPixelFormat_RGBA32` 格式。
     * @param {TRTCVideoBufferType} [options.bufferType] - 视频数据传递方式，默认值：`TRTCVideoBufferType_Buffer`。
     * 
     */
    // initPluginManager(options?: {
    //     pixelFormat: TRTCVideoPixelFormat;
    //     bufferType?: TRTCVideoBufferType;
    // }): void {
    //     if (!TRTCCloud.isIPCMode) {
    //         this.setPluginParams(TRTCPluginType.TRTCPluginTypeVideoProcess, {
    //             enable: true,
    //             pixelFormat: options?.pixelFormat || TRTCVideoPixelFormat.TRTCVideoPixelFormat_I420
    //         });
    //     } 
    // }

    /**
     * 销毁插件管理
     * 
     * @deprecated 请使用 [setPluginParams]{@link TRTCCloud#setPluginParams} 接口
     * 
     */
    // destroyPluginManager(): void {
    //     if (!TRTCCloud.isIPCMode) {
    //         this.setPluginParams(TRTCPluginType.TRTCPluginTypeVideoProcess, {
    //             enable: false,
    //         });
    //     }
    // }

    /**
     * 获取插件列表
     * @returns TRTCPluginInfo[]|null
     * 
     * @ignore
     * @deprecated
     */
    // getPluginList(): TRTCPluginInfo[] | null {
    //     return this.pluginManager.getPluginList();
    // }
    //----------------------------------//
    // plugin API -- end
    //----------------------------------//

    //----------------------------------//
    // Vod API -- start
    //----------------------------------//
    // createVodPlayer(mediaFilePath: string, repeat: boolean) {
    //     const nativeVodPlayer = this.rtcCloud.createVodPlayer(mediaFilePath, repeat);
    //     if (nativeVodPlayer) {
    //         const vodPlayer = new VodPlayer(nativeVodPlayer, mediaFilePath, repeat);
    //         vodPlayer.setVodPlayerRenderCallback();
    //         vodPlayer.setVodEventCallback();
    //         this.vodPlayers[vodPlayer.key] = vodPlayer;
    //         return vodPlayer;
    //     }
    //     return null;
    // }

    // destroyVodPlayer(vodPlayer: VodPlayer) {
    //     vodPlayer.destroyRender();
    //     this.rtcCloud.destroyVodPlayer(vodPlayer.key);
    //     delete this.vodPlayers[vodPlayer.key];
    // }
    //----------------------------------//
    // Vod API -- end
    //----------------------------------//

    private _getKey(uid: string, type: TRTCVideoStreamType): string {
        return String(uid) + '_' + String(type);
    }

    // setEnableRenderFrame(enable: boolean): void {
    //     this.logger.debug('setEnableRenderFrame:' + enable);
    //     this.enableRenderFrame = enable;
    // }

    log(info: string): void {
        this.rtcCloud.log(info);
    }

    // private _getRendererMap(uid: string, streamType: TRTCVideoStreamType): Map<HTMLElement, IRenderer> | undefined {
    //     const key = this._getKey(uid, streamType);
    //     return this.videoRendererMap.get(key);
    // }

    // private _onRenderFrame(
    //     uid: string, type: TRTCVideoStreamType,
    //     width: number, height: number, timestamp: number,
    //     rotation: number, data: any
    // ): void {
    //     if (uid.length == 0 && this.isCaptureLocalVideoEnabled) {
    //         this.fire(LOCAL_VIDEO_DATA, {
    //             uid: '', type, rotation, timestamp,
    //             pixelFormat: this.pixelFormat,
    //             data: { width, height, data }
    //         });
    //     }

    //     if (uid.length == 0 || uid === CAMERA_DEVICE_TEST_ID) {
    //         // 本地预览或者摄像头测试
    //         if (this.isExternalRenderEnabled) {
    //             this.fire(CUSTOM_VIDEO_DATA, {
    //                 uid: '', type, rotation, timestamp,
    //                 pixelformate: this.pixelFormat, // deprecated
    //                 pixelFormat: this.pixelFormat,
    //                 data: { width, height, data }
    //             });
    //         } else {
    //             this.fire(CUSTOM_VIDEO_DATA, {
    //                 uid: '', type, rotation, timestamp,
    //                 pixelformate: this.pixelFormat, // deprecated
    //                 pixelFormat: this.pixelFormat,
    //                 data: {}
    //             });
    //         }
    //         if (uid.length == 0) {
    //             this._onRealRender(LOCAL_USER_VIDEO_ID, type, width, height, timestamp, rotation, data); //本地社视频返回的是空
    //             //回调local view 给用户数据，本地数据
    //             if (type == TRTCVideoStreamType.TRTCVideoStreamTypeBig) {
    //                 if (this.localVideoCallback !== null && this.localVideoCallback.callback !== null) {
    //                     this._onUserRenderCallback(
    //                         this.localVideoCallback.callback,
    //                         this.localVideoCallback.pixelFormat, uid, type,
    //                         width, height, timestamp, rotation, data
    //                     );
    //                 }
    //             }
    //         }
    //         if (uid === CAMERA_DEVICE_TEST_ID) {
    //             this._onRealRender(CAMERA_DEVICE_TEST_VIEW, type, width, height, timestamp, rotation, data);  //摄像头测试
    //         }
    //     } else {
    //         if (this.isExternalRenderEnabled) {
    //             this.fire(CUSTOM_VIDEO_DATA, {
    //                 uid, type, rotation, timestamp,
    //                 pixelformate: this.pixelFormat, // deprecated
    //                 pixelFormat: this.pixelFormat,
    //                 data: { width, height, data }
    //             });
    //         } else {
    //             this.fire(CUSTOM_VIDEO_DATA, {
    //                 uid: uid, type, rotation, timestamp,
    //                 pixelformate: this.pixelFormat, // deprecated
    //                 pixelFormat: this.pixelFormat,
    //                 data: {}
    //             });
    //             // 画面不区分大小流，只区分主流和辅流（屏幕分享），这里统一使用主流当做 key
    //             let streamType = type;
    //             if (streamType === TRTCVideoStreamType.TRTCVideoStreamTypeSmall) {
    //                 streamType = TRTCVideoStreamType.TRTCVideoStreamTypeBig;
    //             }
    //             this._onRealRender(uid, streamType, width, height, timestamp, rotation, data);
    //         }

    //         //回调远程给用户数据
    //         const remoteCallback = this.remoteVideoCallback.get(uid);
    //         if (remoteCallback !== undefined &&
    //             remoteCallback !== null &&
    //             remoteCallback.callback !== undefined &&
    //             remoteCallback.callback !== null) {
    //             this._onUserRenderCallback(
    //                 remoteCallback.callback, remoteCallback.pixelFormat,
    //                 uid, type, width, height, timestamp, rotation, data
    //             );
    //         }
    //     }
    //     data = null;
    // }

    // private _onRealRender(
    //     uid: string, type: TRTCVideoStreamType,
    //     width: number, height: number, timestamp: number,
    //     rotation: number, data: any
    // ): void {
    //     const rendererMap = this._getRendererMap(uid, type);
    //     if (rendererMap && rendererMap.size > 0) {
    //         let isNeedRotate = true;
    //         if (uid === LOCAL_USER_VIDEO_ID && this._isMacPlatform() && type !== TRTCVideoStreamType.TRTCVideoStreamTypeSub) {
    //             // Mac 平台 8.1 版本底层本地自定义渲染主流支持旋转(Windows 会在后续版本进行支持), js 无需进行二次旋转
    //             isNeedRotate = false;
    //         }
    //         const realRotation = rotation * 90; //ratation是0, 1, 2, 3. 绘制内部使用0, 90, 180, 270
    //         rendererMap.forEach((value: IRenderer) => {
    //             value.drawFrame({
    //                 data,
    //                 width,
    //                 height,
    //                 timestamp,
    //                 rotation: realRotation,
    //                 isNeedRotate
    //             });
    //         })
    //     } else {
    //         // 创建渲染器时 view 参数传了 null，只推流或者拉流，本地不渲染
    //     }
    // }

    // private _checkAndDeleteExistingRenderer(view: HTMLElement, key: string): void {
    //     this.videoRendererMap.forEach((rendererMap: Map<HTMLElement, IRenderer>, existingKey: string) => {
    //         rendererMap.forEach((renderer: IRenderer, node: HTMLElement, map: Map<HTMLElement, IRenderer>) => {
    //             if (node === view && existingKey !== key) {
    //                 try {
    //                     this.logger.warn(`existing video renderer for ${existingKey}, destroy and create for ${key}.`, view);
    //                     renderer.destroy();
    //                     map.delete(node);
    //                 } catch (err: any) {
    //                     this.logger.error("_checkAndDeleteExistingRenderer destroy render error:", err);
    //                 }
    //             }
    //         });
    //     });
    // }

    // private _createVideoRenderer(view: HTMLElement, key: string, options: RendererOptions): IRenderer {
    //     // 事先清空一下，避免画面叠加
    //     if (view.childElementCount > 0) {
    //         this.logger.warn("clear HTML element content:", view);
    //     }
    //     this._checkAndDeleteExistingRenderer(view, key);
    //     view.innerHTML = '';

    //     const renderer = createRenderer(this.pixelFormat, view, options);

    //     if (key === this._getKey(LOCAL_USER_VIDEO_ID, TRTCVideoStreamType.TRTCVideoStreamTypeBig)) {
    //         renderer.setContentMode(this.localFillMode);
    //     } else if (this.remoteFillModeMap.has(key)) {
    //         const fillMode = this.remoteFillModeMap.get(key);
    //         if (fillMode !== undefined) {
    //             renderer?.setContentMode(fillMode);
    //         }
    //     }

    //     return renderer;
    // }

    // private _initRenderer(key: string, views: Array<HTMLElement>): void {
    //     const onContextLost = (key: string, view: HTMLElement) => {
    //         const rendererMap = this.videoRendererMap.get(key);
    //         if (rendererMap) {
    //             const render = this._createVideoRenderer(view, key, { type: RenderType.Canvas2D });
    //             rendererMap?.set(view, render);
    //             this.videoRendererMap.set(key, rendererMap);
    //         }
    //     };

    //     const validViews = views.filter(view => {
    //         const isValid = view && view instanceof HTMLElement;
    //         if (!isValid) {
    //             this.logger.warn("create renderer failed due to invalid HTMLElement", view);
    //         }
    //         return isValid;

    //     });
    //     let rendererMap = this.videoRendererMap.get(key);
    //     if (rendererMap) {
    //         rendererMap.forEach((value: IRenderer, innerKey: HTMLElement, map: Map<HTMLElement, IRenderer>) => {
    //             if (validViews.indexOf(innerKey) === -1 || !value.isValid(innerKey)) {
    //                 try {
    //                     value.destroy();
    //                     map.delete(innerKey);
    //                 } catch (err: any) {
    //                     this.logger.error("_initRenderer destroy render error:", err);
    //                 }
    //             }
    //         });
    //         validViews.forEach((view: HTMLElement) => {
    //             if (!rendererMap?.has(view)) {
    //                 const renderer = this._createVideoRenderer(view, key, {
    //                     type: RenderType.Video,
    //                     onContextLost: () => {
    //                         onContextLost(key, view);
    //                     },
    //                 });
    //                 rendererMap?.set(view, renderer);
    //             }
    //         });
    //     } else {
    //         rendererMap = new Map<HTMLElement, IRenderer>();
    //         validViews.forEach((view: HTMLElement) => {
    //             const renderer = this._createVideoRenderer(view, key, {
    //                 type: RenderType.Video,
    //                 onContextLost: () => {
    //                     onContextLost(key, view);
    //                 },
    //             });
    //             rendererMap?.set(view, renderer);
    //         });
    //     }
    //     this.videoRendererMap.set(key, rendererMap);
    // }

    // private _destroyRenderer(key: string, onFailure: ((err: Error) => void) | null): void {
    //     const rendererMap = this.videoRendererMap.get(key);
    //     if (rendererMap) {
    //         rendererMap.forEach((value: IRenderer, key: HTMLElement, map: Map<HTMLElement, IRenderer>) => {
    //             try {
    //                 value.destroy();
    //                 map.delete(key);
    //             } catch (err: any) {
    //                 onFailure && onFailure(err);
    //             }
    //         });
    //         rendererMap.clear();
    //         this.videoRendererMap.delete(key);
    //     }

    // }

    private _isMacPlatform(): boolean {
        return process.platform == 'darwin';
    }

    // //-------------------------------------------------//
    // // Local media transcoding API begin
    // //-------------------------------------------------//
    // /**
    //  * 创建本地多媒体合图实例
    //  *
    //  * 注意：单例模式，多次调用返回的是同一个对象
    //  *
    //  * @param {Object} config - 配置参数
    //  * @param {TRTCVideoPixelFormat} config.pixelFormat - 视频数据的像素格式
    //  * @returns {TRTCLocalMediaTranscoder}
    //  */
    // createLocalMediaTranscoder(config?: {
    //     pixelFormat: TRTCVideoPixelFormat
    // }): TRTCLocalMediaTranscoder | null {
    //     if (this.localMediaTranscoder === null) {
    //         let pixelFormat = TRTCVideoPixelFormat.TRTCVideoPixelFormat_I420;
    //         if (config && config.pixelFormat) {
    //             pixelFormat = config.pixelFormat;
    //         }
    //         const nativeLocalMediaTranscoding = this.rtcCloud.createLocalMediaTranscoding();
    //         if (nativeLocalMediaTranscoding) {
    //             this.localMediaTranscoder = new TRTCLocalMediaTranscoder(nativeLocalMediaTranscoding, pixelFormat);
    //         } else {
    //             console.warn('TRTCLocalMediaTranscoder create error. Currently only support "Windows" operation system.')
    //         }
    //     }
    //     return this.localMediaTranscoder;
    // }

    // /**
    //  * 销毁本地多媒体合图实例
    //  */
    // destroyLocalMediaTranscoder(): void {
    //     if (this.localMediaTranscoder) {
    //         try {
    //             this.localMediaTranscoder.destroy();
    //             this.localMediaTranscoder = null;
    //             this.rtcCloud.destroyLocalMediaTranscoding();
    //         } catch (e: any) {
    //             // 重复销毁会有报错提示
    //             console.warn(`trtc:destroyLocalMediaTranscoder warning:`, e.message);
    //         }
    //     }
    // }
    // //-------------------------------------------------//
    // // Local media transocoding API end
    // //-------------------------------------------------//

    /**
     * 获取设备管理器
     * @private
     * @returns {TRTCDeviceManager}
     */
    private getDeviceManager(): TRTCDeviceManager {
        return this.deviceManager;
    }

    /**
     * 获取音效管理器
     * @private
     * @returns {TRTCAudioEffectManager}
     */
    private getAudioEffectManager(): TRTCAudioEffectManager {
        return this.audioEffectManager;
    }
}

export default TRTCCloud;
