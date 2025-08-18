/**
 * TRTC 关键类型定义
 *
 * @description 分辨率、质量等级等枚举和常量值的定义
 *
 */
/// <reference types="node" />
export enum TRTCVideoResolution {
  TRTCVideoResolution_120_120 = 1,
  TRTCVideoResolution_160_160 = 3,
  TRTCVideoResolution_270_270 = 5,
  TRTCVideoResolution_480_480 = 7,
  TRTCVideoResolution_160_120 = 50,
  TRTCVideoResolution_240_180 = 52,
  TRTCVideoResolution_280_210 = 54,
  TRTCVideoResolution_320_240 = 56,
  TRTCVideoResolution_400_300 = 58,
  TRTCVideoResolution_480_360 = 60,
  TRTCVideoResolution_640_480 = 62,
  TRTCVideoResolution_960_720 = 64,
  TRTCVideoResolution_160_90 = 100,
  TRTCVideoResolution_256_144 = 102,
  TRTCVideoResolution_320_180 = 104,
  TRTCVideoResolution_480_270 = 106,
  TRTCVideoResolution_640_360 = 108,
  TRTCVideoResolution_960_540 = 110,
  TRTCVideoResolution_1280_720 = 112,
  TRTCVideoResolution_1920_1080 = 114,
}
export enum TRTCVideoResolutionMode {
  TRTCVideoResolutionModeLandscape = 0,
  TRTCVideoResolutionModePortrait = 1,
}
export enum TRTCVideoStreamType {
  TRTCVideoStreamTypeBig = 0,
  TRTCVideoStreamTypeSmall = 1,
  TRTCVideoStreamTypeSub = 2,
}
export enum TRTCQuality {
  TRTCQuality_Unknown = 0,
  TRTCQuality_Excellent = 1,
  TRTCQuality_Good = 2,
  TRTCQuality_Poor = 3,
  TRTCQuality_Bad = 4,
  TRTCQuality_Vbad = 5,
  TRTCQuality_Down = 6,
}
export enum TRTCVideoFillMode {
  TRTCVideoFillMode_Fill = 0,
  TRTCVideoFillMode_Fit = 1,
}
export enum TRTCVideoRotation {
  TRTCVideoRotation0 = 0,
  TRTCVideoRotation90 = 1,
  TRTCVideoRotation180 = 2,
  TRTCVideoRotation270 = 3,
}
export enum TRTCBeautyStyle {
  TRTCBeautyStyleSmooth = 0,
  TRTCBeautyStyleNature = 1,
}
export enum TRTCVideoPixelFormat {
  TRTCVideoPixelFormat_Unknown = 0,
  TRTCVideoPixelFormat_I420 = 1,
  TRTCVideoPixelFormat_Texture_2D = 2,
  TRTCVideoPixelFormat_BGRA32 = 3,
  TRTCVideoPixelFormat_RGBA32 = 5,
  TRTCVideoPixelFormat_H264 = 6,
}
export enum TRTCVideoBufferType {
  TRTCVideoBufferType_Unknown = 0,
  TRTCVideoBufferType_Buffer = 1,
  TRTCVideoBufferType_Texture = 3,
}
export enum TRTCVideoMirrorType {
  TRTCVideoMirrorType_Auto = 0,
  TRTCVideoMirrorType_Enable = 1,
  TRTCVideoMirrorType_Disable = 2,
}
export enum TRTCRecordType {
  TRTCRecordTypeAudio = 0,
  TRTCRecordTypeVideo = 1,
  TRTCRecordTypeBoth = 2,
}
export declare type TRTCAudioParallelParams = {
  maxCount: number;
  includeUsers: Array<string>;
};
export enum TRTCAppScene {
  TRTCAppSceneVideoCall = 0,
  TRTCAppSceneLIVE = 1,
  TRTCAppSceneAudioCall = 2,
  TRTCAppSceneVoiceChatRoom = 3,
}
export enum TRTCRoleType {
  TRTCRoleAnchor = 20,
  TRTCRoleAudience = 21,
}
export enum TRTCQosControlMode {
  TRTCQosControlModeClient = 0,
  TRTCQosControlModeServer = 1,
}
export enum TRTCVideoQosPreference {
  TRTCVideoQosPreferenceSmooth = 1,
  TRTCVideoQosPreferenceClear = 2,
}
export enum TRTCAudioFrameFormat {
  TRTCAudioFrameFormatNone = 0,
  TRTCAudioFrameFormatPCM = 1,
}
export enum TRTCScreenCaptureSourceType {
  TRTCScreenCaptureSourceTypeUnknown = -1,
  TRTCScreenCaptureSourceTypeWindow = 0,
  TRTCScreenCaptureSourceTypeScreen = 1,
  TRTCScreenCaptureSourceTypeCustom = 2,
}
export enum TRTCAudioQuality {
  TRTCAudioQualitySpeech = 1,
  TRTCAudioQualityDefault = 2,
  TRTCAudioQualityMusic = 3,
}
/**
 * 图缓存
 *
 * @param {ArrayBuffer} buffer - 图像存储的内容，BGRA 格式。
 * @param {Number}      length - 图像数据大小大小
 * @param {Number}      width  - 图像宽度
 * @param {Number}      heigth - 图像高度
 *
 */
export class TRTCImageBuffer {
  buffer: ArrayBuffer;
  length: number;
  width: number;
  height: number;
  constructor(
    buffer?: ArrayBuffer,
    length?: number,
    width?: number,
    height?: number,
  ) {
    this.buffer = buffer || new ArrayBuffer(0);
    this.length = length || 0;
    this.width = width || 0;
    this.height = height || 0;
  }
}
/**
 * 屏幕采集源信息
 *
 * @param {TRTCScreenCaptureSourceType} type       - 采集源类型
 * @param {String}                      sourceId   - 采集源ID；对于窗口，该字段指示窗口句柄；对于屏幕，该字段指示屏幕ID
 * @param {String}                      sourceName - 采集源名称，UTF8编码
 * @param {TRTCImageBuffer}             thumbBGRA  - 缩略图内容
 * @param {TRTCImageBuffer}             iconBGRA   - 图标内容
 * @param {Boolean}                     isMinimizeWindow - 是否最小化窗口
 * @param {Number}                      width - 屏幕/窗口宽，单位:像素。
 * @param {Number}                      height - 屏幕/窗口高，单位:像素。
 * @param {Boolean}                     isMainScreen - 是否为主显示屏。
 * @param {Number}                      x - 屏幕/窗口 x 坐标，单位:像素点。
 * @param {Number}                      y - 屏幕/窗口 y 坐标，单位:像素点。
 *
 */
export class TRTCScreenCaptureSourceInfo {
  type: number;
  sourceId: string;
  sourceName: string;
  thumbBGRA: TRTCImageBuffer;
  iconBGRA: TRTCImageBuffer;
  isMinimizeWindow: boolean;
  width: number;
  height: number;
  isMainScreen: boolean;
  constructor(
    type?: TRTCScreenCaptureSourceType,
    sourceId?: string,
    sourceName?: string,
    thumbBGRA?: TRTCImageBuffer,
    iconBGRA?: TRTCImageBuffer,
    isMinimizeWindow?: boolean,
    width?: number,
    height?: number,
    isMainScreen?: boolean,
  ) {
    this.type = type || TRTCScreenCaptureSourceType.TRTCScreenCaptureSourceTypeUnknown;
    this.sourceId = sourceId || '';
    this.sourceName = sourceName || '';
    this.thumbBGRA = thumbBGRA || new TRTCImageBuffer();
    this.iconBGRA = iconBGRA || new TRTCImageBuffer();
    this.isMinimizeWindow = isMinimizeWindow || false;
    this.width = width || 0;
    this.height = height || 0;
    this.isMainScreen = isMainScreen || false;
  }
}
/**
 * 屏幕分享的进阶控制参数
 *
 * 该参数用于屏幕分享相关的接口 [selectScreenCaptureTarget]{@link TRTCCloud#selectScreenCaptureTarget}，用于在指定分享目标时设定一系列进阶控制参数。
 * 比如：是否采集鼠标、是否要采集子窗口、是否要在被分享目标周围绘制一个边框等。
 *
 * 注意：设置高亮边框颜色参数在 Mac 平台不支持。
 *
 * @param {Boolean} enableCaptureMouse    - 是否采集目标内容的同时采集鼠标，默认为 true
 * @param {Boolean} enableHighLight       - 是否高亮正在共享的窗口（在被分享目标周围绘制一个边框），默认为 true。
 * @param {Boolean} enableHighPerformance - 是否开启高性能模式（只会在分享屏幕时会生效），默认为 true。【特殊说明】开启后屏幕采集性能最佳，但会丧失抗遮挡能力，如果您同时开启 enableHighLight + enableHighPerformance，远端用户可以看到高亮的边框。
 * @param {Number} highLightColor         - 指定高亮边框的颜色，RGB 格式，传入 0 时代表采用默认颜色，默认颜色为 0xFFE640。
 * @param {Number} highLightWidth         - 指定高亮边框的宽度，传入0时采用默认描边宽度，默认宽度为 5 像素，您可以设置的最大值为 50。
 * @param {Boolean} enableCaptureChildWindow  - 窗口采集时是否采集子窗口（需要子窗口与被采集窗口具有 Owner 或 Popup 属性），默认为 false。
 */
export class TRTCScreenCaptureProperty {
  enableCaptureMouse: boolean;
  enableHighLight: boolean;
  enableHighPerformance: boolean;
  highLightColor: number;
  highLightWidth: number;
  enableCaptureChildWindow: boolean;
  constructor(
    enableCaptureMouse?: boolean,
    enableHighLight?: boolean,
    enableHighPerformance?: boolean,
    highLightColor?: number,
    highLightWidth?: number,
    enableCaptureChildWindow?: boolean,
  ) {
    this.enableCaptureMouse = enableCaptureMouse !== undefined ? enableCaptureMouse : true;
    this.enableHighLight = enableHighLight !== undefined ? enableHighLight : true;
    this.enableHighPerformance = enableHighPerformance !== undefined ? enableHighPerformance : true;
    this.highLightColor = highLightColor !== undefined ? highLightColor : 0;
    this.highLightWidth = highLightWidth !== undefined ? highLightWidth : 0;
    this.enableCaptureChildWindow = enableCaptureChildWindow !== undefined ? enableCaptureChildWindow : false;
  }
}
/**
 * 设备信息
 *
 * @param {String} deviceId   - 设备PID，字符编码格式是UTF-8
 * @param {String} deviceName - 设备名称，字符编码格式是UTF-8
 * @param {Object} deviceProperties - 设备属性
 *  - 只支持摄像头，包含摄像头支持的采集分辨率。
 * @param {Array} deviceProperties.SupportedResolution - 支持的采集分辨率数组，每个数据是一个对象，包含 `width` 和 `height` 两个属性，属性值都是整形数值。
 *  - 注意：虚拟摄像头该字段不存在。
 *
 */
export class TRTCDeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceProperties: Record<string, any>;
  constructor(deviceId: string, deviceName: string, deviceProperties: {}) {
    this.deviceId = deviceId;
    this.deviceName = deviceName;
    this.deviceProperties = deviceProperties;
  }
}
/**
 * 视频帧数据
 *
 * @param {TRTCVideoPixelFormat} videoFormat   - 视频帧的格式
 * @param {TRTCVideoBufferType} bufferType - 视频数据结构类型
 * @param {ArrayBuffer} data - 视频数据，字段 bufferType 是 LiteAVVideoBufferType_Buffer 时生效
 * @param {Number} textureId - 视频纹理ID，字段bufferType是LiteAVVideoBufferType_Texture时生效
 * @param {Number} length - 视频数据的长度，单位是字节，对于i420而言， length = width * height * 3 / 2，对于BGRA32而言， length = width * height * 4
 * @param {Number} width - 画面的宽度
 * @param {Number} height - 画面的高度
 * @param {Number} timestamp - 时间戳，单位ms
 * @param {Number} rotation - 画面旋转角度
 *
 */
export class TRTCVideoFrame {
  videoFormat: number;
  bufferType: number;
  data: null | ArrayBuffer;
  textureId: number;
  length: number;
  width: number;
  height: number;
  timestamp: number;
  rotation: number;
  constructor(
    videoFormat?: TRTCVideoPixelFormat,
    bufferType?: TRTCVideoBufferType,
    data?: null | ArrayBuffer,
    textureId?: number,
    length?: number,
    width?: number,
    height?: number,
    timestamp?: number,
    rotation?: number,
  ) {
    this.videoFormat = videoFormat || TRTCVideoPixelFormat.TRTCVideoPixelFormat_Unknown;
    this.bufferType = bufferType || TRTCVideoBufferType.TRTCVideoBufferType_Unknown;
    this.data = data || null;
    this.textureId = textureId || 0;
    this.length = length || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.timestamp = timestamp || 0;
    this.rotation = rotation || TRTCVideoRotation.TRTCVideoRotation0;
  }
}
/**
 * 音频帧数据
 *
 * @param {TRTCAudioFrameFormat} audioFormat - 音频帧的格式
 * @param {Buffer|ArrayBuffer} data - 音频数据
 * @param {Number} length - 音频数据的长度
 * @param {Number} sampleRate - 采样率
 * @param {Number} channel - 声道数
 * @param {Number} timestamp - 时间戳，单位ms
 * @param {ArrayBuffer|null} extraData - 音频额外数据，远端用户通过 `onLocalProcessedAudioFrame` 写入的数据会通过该字段回调
 * @param {Number} extraDataLength - 音频消息数据的长度
 */
export class TRTCAudioFrame {
  audioFormat: TRTCAudioFrameFormat;
  data: Buffer | ArrayBuffer | null;
  length: number;
  sampleRate: number;
  channel: number;
  timestamp: number;
  extraData: ArrayBuffer | null;
  extraDataLength: number;
  constructor(
    audioFormat?: TRTCAudioFrameFormat,
    data?: any,
    length?: number,
    sampleRate?: number,
    channel?: number,
    timestamp?: number,
    extraData?: any,
    extraDataLength?: number,
  ) {
    this.audioFormat = audioFormat || TRTCAudioFrameFormat.TRTCAudioFrameFormatNone;
    this.data = data || null;
    this.length = length || 0;
    this.sampleRate = sampleRate || 0;
    this.channel = channel || 0;
    this.timestamp = timestamp || 0;
    this.extraData = extraData || null;
    this.extraDataLength = extraDataLength || 0;
  }
}
export enum TRTCLogLevel {
  TRTCLogLevelVerbose = 0,
  TRTCLogLevelDebug = 1,
  TRTCLogLevelInfo = 2,
  TRTCLogLevelWarn = 3,
  TRTCLogLevelError = 4,
  TRTCLogLevelFatal = 5,
  TRTCLogLevelNone = 6,
}
export enum TRTCDeviceState {
  TRTCDeviceStateAdd = 0,
  TRTCDeviceStateRemove = 1,
  TRTCDeviceStateActive = 2,
  TRTCDefaultDeviceChanged = 3,
}
export enum TRTCDeviceType {
  TRTCDeviceTypeUnknown = -1,
  TRTCDeviceTypeMic = 0,
  TRTCDeviceTypeSpeaker = 1,
  TRTCDeviceTypeCamera = 2,
}
export enum TRTCCameraCaptureMode {
  TRTCCameraResolutionStrategyAuto = 0,
  TRTCCameraResolutionStrategyPerformance = 1,
  TRTCCameraResolutionStrategyHighQuality = 2,
  TRTCCameraCaptureManual = 3,
}
export type TRTCCameraCaptureParams = {
  /** 摄像头采集偏好 */
  mode: TRTCCameraCaptureMode;
  /** 采集图像宽度 */
  width: number;
  /** 采集图像高度 */
  height: number;
};
export enum TRTCWaterMarkSrcType {
  TRTCWaterMarkSrcTypeFile = 0,
  TRTCWaterMarkSrcTypeBGRA32 = 1,
  TRTCWaterMarkSrcTypeRGBA32 = 2,
}
/**
 * 进房相关参数
 *
 * 只有该参数填写正确，才能顺利调用 enterRoom 进入 roomId 所指定的音视频房间。
 *
 * @param {Number}       sdkAppId      - 【字段含义】应用标识（必填），腾讯视频云基于 sdkAppId 完成计费统计。<br>
 *                                       【推荐取值】在腾讯云 [TRTC 控制台](https://console.cloud.tencent.com/rav/) 中创建应用，之后可以在账号信息页面中得到该 ID。<br>
 * @param {String}       userId        - 【字段含义】用户标识（必填）。当前用户的 userId，相当于用户名，UTF-8编码。<br>
 *                                       【推荐取值】如果一个用户在您的账号系统中的 ID 为“abc”，则 userId 即可设置为“abc”。<br>
 * @param {String}       userSig       - 【字段含义】用户签名（必填），当前 userId 对应的验证签名，相当于登录密码。<br>
 *                                       【推荐取值】请参考 [如何计算UserSig](https://cloud.tencent.com/document/product/647/17275)。<br>
 * @param {Number}       roomId        - 【字段含义】房间号码（必填），指定房间号，在同一个房间里的用户（userId）可以彼此看到对方并进行视频通话, roomId 和 strRoomId 必须填一个, 若您选用 strRoomId，则 roomId 需要填写为0。<br>
 *                                       【推荐取值】您可以随意指定，但请不要重复，如果您的用户账号 ID 是数字类型的，可以直接用创建者的用户 ID 作为 roomId。<br>
 * @param {String}       strRoomId     - 【字段含义】字符串房间号码（选填），roomId 和 strRoomId 必须填一个。若两者都填，则优先选择 roomId。<br>
 *                                       【推荐取值】您可以随意指定，但请不要重复。<br>
 * @param {TRTCRoleType} role          - 【字段含义】直播场景下的角色，仅适用于直播场景（TRTCAppSceneLIVE 和 TRTCAppSceneVoiceChatRoom），视频通话场景下指定无效。<br>
 *                                       【推荐取值】默认值：主播（TRTCRoleAnchor）<br>
 * @param {String}       privateMapKey - 【字段含义】房间签名（非必填），如果您希望某个房间只能让特定的某些 userId 进入，就需要使用 privateMapKey 进行权限保护。<br>
 *                                       【推荐取值】仅建议有高级别安全需求的客户使用，参考文档：[进房权限保护](https://cloud.tencent.com/document/product/647/32240)<br>
 * @param {String}       businessInfo  - 【字段含义】业务数据（非必填），某些非常用的高级特性才需要用到此字段。<br>
 *                                       【推荐取值】不建议使用<br>
 * @param {String}       streamId      - 【字段含义】绑定腾讯云直播 CDN 流 ID[非必填]，设置之后，您就可以在腾讯云直播 CDN 上通过标准直播方案（FLV或HLS）播放该用户的音视频流。<br>
 *                                       【推荐取值】限制长度为64字节，可以不填写，一种推荐的方案是使用 “sdkappid_roomid_userid_main” 作为 streamid，这样比较好辨认且不会在您的多个应用中发生冲突。<br>
 *                                       【特殊说明】要使用腾讯云直播 CDN，您需要先在[控制台](https://console.cloud.tencent.com/trtc/) 中的功能配置页开启“启动自动旁路直播”开关。<br>
 *                                       【参考文档】[CDN 旁路直播](https://cloud.tencent.com/document/product/647/16826)。
 * @param {String}       userDefineRecordId - 【字段含义】设置云端录制完成后的回调消息中的 "userdefinerecordid"  字段内容，便于您更方便的识别录制回调。<br>
 *                                            【推荐取值】限制长度为64字节，只允许包含大小写英文字母（a-zA-Z）、数字（0-9）及下划线和连词符。<br>
 *                                            【参考文档】[云端录制](https://cloud.tencent.com/document/product/647/16823)。
 */
export class TRTCParams {
  sdkAppId: number;
  userId: string;
  userSig: string;
  roomId: number;
  strRoomId: string;
  role: number;
  privateMapKey: null | string;
  businessInfo: null | string;
  streamId: null | string;
  userDefineRecordId: null | string;
  constructor(
    sdkAppId?: number,
    userId?: string,
    userSig?: string,
    roomId?: number,
    strRoomId?: string,
    role?: TRTCRoleType,
    privateMapKey?: null | string,
    businessInfo?: null | string,
    streamId?: null | string,
    userDefineRecordId?: null | string,
  ) {
    this.sdkAppId = sdkAppId || 0;
    this.userId = userId || '';
    this.userSig = userSig || '';
    this.roomId = roomId || 0;
    this.strRoomId = strRoomId || '';
    this.role = role !== undefined ? role : TRTCRoleType.TRTCRoleAnchor;
    this.privateMapKey = privateMapKey || null;
    this.businessInfo = businessInfo || null;
    this.streamId = streamId || null;
    this.userDefineRecordId = userDefineRecordId || null;
  }
}
/**
 * 视频编码参数
 *
 * 该设置决定了远端用户看到的画面质量（同时也是云端录制出的视频文件的画面质量）。
 *
 * @param {TRTCVideoResolution}     videoResolution - 【字段含义】 视频分辨率<br>
 *                                                    【推荐取值】 <br>
 *                                                     - 视频通话建议选择360 × 640及以下分辨率，resMode 选择 Portrait。<br>
 *                                                     - 手机直播建议选择 540 × 960，resMode 选择 Portrait。<br>
 *                                                     - Window 和 iMac 建议选择 640 × 360 及以上分辨率，resMode 选择 Landscape。
 *                                                    【特别说明】 TRTCVideoResolution 默认只能横屏模式的分辨率，例如640 × 360。<br>
 *                                                                如需使用竖屏分辨率，请指定 resMode 为 Portrait，例如640 × 360结合 Portrait 则为360 × 640。<br>
 * @param {TRTCVideoResolutionMode} resMode         - 【字段含义】分辨率模式（横屏分辨率 - 竖屏分辨率）<br>
 *                                                    【推荐取值】手机直播建议选择 Portrait，Window 和 Mac 建议选择 Landscape。<br>
 *                                                    【特别说明】如果 videoResolution 指定分辨率 640 × 360，resMode 指定模式为 Portrait，则最终编码出的分辨率为360 × 640。<br>
 * @param {Number}                  videoFps        - 【字段含义】视频采集帧率<br>
 *                                                    【推荐取值】15fps 或 20fps，10fps 以下会有轻微卡顿感，5fps 以下卡顿感明显，20fps 以上的帧率则过于浪费（电影的帧率也只有 24fps）。<br>
 *                                                    【特别说明】很多 Android 手机的前置摄像头并不支持15fps以上的采集帧率，部分过于突出美颜功能的 Android 手机前置摄像头的采集帧率可能低于10fps。<br>
 * @param {Number}                  videoBitrate    - 【字段含义】视频上行码率<br>
 *                                                    【推荐取值】推荐设置请参考本文件前半部分 TRTCVideoResolution 定义处的注释说明<br>
 *                                                    【特别说明】码率太低会导致视频中有很多的马赛克<br>
 * @param {Number}                  minVideoBitrate  -【字段含义】最低视频码率，SDK 会在网络不佳的情况下主动降低视频码率，最低会降至 minVideoBitrate 所设定的数值。
 *                                                    【推荐取值】<br>
 *                                                      - 如果您追求“允许卡顿但要保持清晰”的效果，可以设置 minVideoBitrate 为 videoBitrate 的 60%；
 *                                                      - 如果您追求“允许模糊但要保持流畅”的效果，可以设置 minVideoBitrate 为 200kbps；
 *                                                      - 如果您将 videoBitrate 和 minVideoBitrate 设置为同一个值，等价于关闭 SDK 的自适应调节能力；
 *                                                      - 默认值：0，此时最低码率由 SDK 根据分辨率情况，自动设置合适的数值。<br>
 *                                                    【特别说明】<br>
 *                                                     - 当您把分辨率设置的比较高时，minVideoBitrate 不适合设置的太低，否则会出现画面模糊和大范围的马赛克宏块。
 *                                                       比如把分辨率设置为 720p，把码率设置为 200kbps，那么编码出的画面将会出现大范围区域性马赛克。
 * @param {Boolean}                 enableAdjustRes - 【字段含义】是否允许动态调整分辨率（开启后会对云端录制产生影响）<br>
 *                                                    【推荐取值】该功能适用于不需要云端录制的场景，开启后 SDK 会根据当前网络情况，智能选择出一个合适的分辨率，避免出现“大分辨率+小码率”的低效编码模式。<br>
 *                                                    【特别说明】默认值：关闭。如有云端录制的需求，请不要开启此功能，因为如果视频分辨率发生变化后，云端录制出的 MP4 在普通的播放器上无法正常播放。<br>
 */
export class TRTCVideoEncParam {
  videoResolution: TRTCVideoResolution;
  resMode: TRTCVideoResolutionMode;
  videoFps: number;
  videoBitrate: number;
  minVideoBitrate: number;
  enableAdjustRes: boolean;
  constructor(
    videoResolution?: TRTCVideoResolution,
    resMode?: TRTCVideoResolutionMode,
    videoFps?: number,
    videoBitrate?: number,
    minVideoBitrate?: number,
    enableAdjustRes?: boolean,
  ) {
    this.videoResolution = videoResolution || TRTCVideoResolution.TRTCVideoResolution_640_360;
    this.resMode = resMode || TRTCVideoResolutionMode.TRTCVideoResolutionModeLandscape;
    this.videoFps = videoFps || 15;
    this.videoBitrate = videoBitrate || 600;
    this.minVideoBitrate = minVideoBitrate || 0;
    this.enableAdjustRes = enableAdjustRes !== undefined ? enableAdjustRes : false;
  }
}
/**
 * 画面渲染参数
 *
 * 您可以通过设置此参数来控制画面的旋转、填充、镜像模式
 *
 * @param {TRTCVideoRotation} rotation  - 【字段含义】视频画面旋转方向
 * @param {TRTCVideoFillMode} fillMode  - 【字段含义】视频画面填充模式
 * @param {TRTCVideoMirrorType} mirrorType  - 【字段含义】画面渲染镜像类型
 *
 */
export class TRTCRenderParams {
  rotation: TRTCVideoRotation;
  fillMode: TRTCVideoFillMode;
  mirrorType: TRTCVideoMirrorType;
  constructor(
    rotation?: TRTCVideoRotation,
    fillMode?: TRTCVideoFillMode,
    mirrorType?: TRTCVideoMirrorType,
  ) {
    this.rotation = rotation || TRTCVideoRotation.TRTCVideoRotation0;
    this.fillMode = fillMode || TRTCVideoFillMode.TRTCVideoFillMode_Fit;
    this.mirrorType = mirrorType || TRTCVideoMirrorType.TRTCVideoMirrorType_Auto;
  }
}
/**
 * 网络流控相关参数
 *
 * 网络流控相关参数，该设置决定了SDK在各种网络环境下的调控方向（比如弱网下是“保清晰”还是“保流畅”）
 *
 * @param {TRTCVideoQosPreference} preference  - 【字段含义】弱网下是“保清晰”还是“保流畅”<br>
 *                                               【特别说明】<br>
 *                                                - 弱网下保流畅：在遭遇弱网环境时，画面会变得模糊，且会有较多马赛克，但可以保持流畅不卡顿
 *                                                - 弱网下保清晰：在遭遇弱网环境时，画面会尽可能保持清晰，但可能会更容易出现卡顿
 * @param {TRTCQosControlMode}     controlMode - 【字段含义】流控模式（云端控制 - 客户端控制）<br>
 *                                               【推荐取值】云端控制<br>
 *                                               【特别说明】<br>
 *                                                - Client 模式：客户端控制模式，用于 SDK 开发内部调试，客户请勿使用
 *                                                - Server 模式（默认）：云端控制模式，若没有特殊原因，请直接使用该模式
 *
 */
export class TRTCNetworkQosParam {
  preference: TRTCVideoQosPreference;
  controlMode: TRTCQosControlMode;
  constructor(
    preference?: TRTCVideoQosPreference,
    controlMode?: TRTCQosControlMode,
  ) {
    this.preference = preference || TRTCVideoQosPreference.TRTCVideoQosPreferenceSmooth;
    this.controlMode = controlMode || TRTCQosControlMode.TRTCQosControlModeServer;
  }
}
/**
 * 视频质量
 *
 * 表示视频质量的好坏，通过这个数值，您可以在 UI 界面上用图标表征 userId 的通话线路质量
 *
 * @param {String}      userId  - 用户标识
 * @param {TRTCQuality} quality - 视频质量
 *
 */
export class TRTCQualityInfo {
  userId: string;
  quality: TRTCQuality;
  constructor(userId?: string, quality?: TRTCQuality) {
    this.userId = userId || '';
    this.quality = quality || TRTCQuality.TRTCQuality_Unknown;
  }
}
/**
 * 音量大小
 *
 * 表示语音音量的评估大小，通过这个数值，您可以在 UI 界面上用图标表征 userId 是否有在说话。
 *
 * @param {String} userId - 说话者的 userId，字符编码格式是 UTF-8
 * @param {Number} volume - 说话者的音量， 取值范围0 - 100
 * @param {Number} vad - 是否检测到人声，0：非人声 1：人声
 * @param {Number} pitch - 本地用户的人声频率（单位：Hz），取值范围[0 - 4000]，对于远端用户，该值始终为0。
 * @param {Float32Array} spectrumData - 音频频谱数据是将音频数据在频率域中的分布，划分为 256 个频率段，使用 spectrumData 记录各个频率段的能量值，每个能量值的取值范围为 [-300, 0]，单位为 dBFS。
                                        本地频谱使用编码前的音频数据计算，会受到本地采集音量、BGM等影响；远端频谱使用接收到的音频数据计算，本地调整远端播放音量等操作不会对其产生影响。
 * @param {Number} spectrumDataLength - spectrumDataLength 记录音频频谱数据的长度，为 256。
 *
 */
export class TRTCVolumeInfo {
  userId: string;
  volume: number;
  vad: number;
  pitch: number;
  spectrumData: Float32Array;
  spectrumDataLength: number;
  constructor(
    userId?: string,
    volume?: number,
    vad?: number,
    pitch?: number,
    spectrumData?: Float32Array,
    spectrumDataLength?: number,
  ) {
    this.userId = userId || '';
    this.volume = volume || 0;
    this.vad = vad || 0;
    this.pitch = pitch || 0;
    this.spectrumData = spectrumData || new Float32Array(256);
    this.spectrumDataLength = spectrumDataLength || 256;
  }
}
/**
 * 测速参数
 *
 * 您可以在用户进入房间前通过 [startSpeedTest]{@link TRTCCloud#startSpeedTest} 接口测试网速（注意：请不要在通话中调用）。
 *
 * @param {Number}      sdkAppId              - 应用标识
 * @param {String}      userId                - 用户标识
 * @param {String}      userSig               - 用户签名
 * @param {Number}      expectedUpBandwidth   - 预期的上行带宽（kbps，取值范围： 10 ～ 5000，为 0 时不测试）。
 * @param {Number}      expectedDownBandwidth - 预期的下行带宽（kbps，取值范围： 10 ～ 5000，为 0 时不测试）。
 */
export class TRTCSpeedTestParams {
  sdkAppId: number;
  userId: string;
  userSig: string;
  expectedUpBandwidth: number;
  expectedDownBandwidth: number;
  constructor(
    sdkAppId?: number,
    userId?: string,
    userSig?: string,
    expectedUpBandwidth?: number,
    expectedDownBandwidth?: number,
  ) {
    this.sdkAppId = sdkAppId || 0;
    this.userId = userId || '';
    this.userSig = userSig || '';
    this.expectedUpBandwidth = expectedUpBandwidth || 0;
    this.expectedDownBandwidth = expectedDownBandwidth || 0;
  }
}
/**
 * 网络测速结果
 *
 * 您可以在用户进入房间前通过 TRTCCloud 的 startSpeedTest 接口进行测速 （注意：请不要在通话中调用），
 * 测速结果会每2 - 3秒钟返回一次，每次返回一个 IP 地址的测试结果。
 *
 * 注意:
 * - quality 是内部通过评估算法测算出的网络质量，loss 越低，rtt 越小，得分也就越高。
 * - upLostRate 是指上行丢包率，例如0.3代表每向服务器发送10个数据包，可能有3个会在中途丢失。
 * - downLostRate 是指下行丢包率，例如0.2代表从服务器每收取10个数据包，可能有2个会在中途丢失。
 * - rtt 是指当前设备到腾讯云服务器的一次网络往返时间，正常数值在10ms - 100ms之间。
 *
 * @param {Boolean}     success      - 测试是否成功, 9.3 版本新增字段
 * @param {String}      errMsg       - 带宽测试错误信息, 9.3 版本新增字段
 * @param {String}      ip           - 服务器 IP 地址
 * @param {TRTCQuality} quality      - 网络质量，内部通过评估算法测算出的网络质量，loss 越低，rtt 越小，得分也就越高
 * @param {Number}      upLostRate   - 上行丢包率，范围是[0 - 1.0]，例如0.3代表每向服务器发送10个数据包，可能有3个会在中途丢失。
 * @param {Number}      downLostRate - 下行丢包率，范围是[0 - 1.0]，例如0.2代表从服务器每收取10个数据包，可能有2个会在中途丢失。
 * @param {Number}      rtt          - 延迟（毫秒），代表 SDK 跟服务器一来一回之间所消耗的时间，这个值越小越好，正常数值在10ms - 100ms之间。
 * @param {Number}      availableUpBandwidth          - 上行带宽（kbps，-1：无效值）。
 * @param {Number}      availableDownBandwidth        - 下行带宽（kbps，-1：无效值）。
 * @param {Number}      upJitter     - 上行数据包抖动（ms)
 * @param {Number}      downJitter   - 下行数据包抖动（ms)
 *
 */
export class TRTCSpeedTestResult {
  success: boolean;
  errMsg: string;
  ip: string;
  quality: TRTCQuality;
  upLostRate: number;
  downLostRate: number;
  rtt: number;
  availableUpBandwidth: number;
  availableDownBandwidth: number;
  upJitter: number;
  downJitter: number;
  constructor(
    success?: boolean,
    errMsg?: string,
    ip?: string,
    quality?: TRTCQuality,
    upLostRate?: number,
    downLostRate?: number,
    rtt?: number,
    availableUpBandwidth?: number,
    availableDownBandwidth?: number,
    upJitter?: number,
    downJitter?: number,
  ) {
    this.success = success !== undefined ? success : true;
    this.errMsg = errMsg || '';
    this.ip = ip || '';
    this.quality = quality || TRTCQuality.TRTCQuality_Unknown;
    this.upLostRate = upLostRate || 0;
    this.downLostRate = downLostRate || 0;
    this.rtt = rtt || 0;
    this.availableUpBandwidth = availableUpBandwidth !== undefined ? availableUpBandwidth : -1;
    this.availableDownBandwidth = availableDownBandwidth !== undefined ? availableDownBandwidth : -1;
    this.upJitter = upJitter || 0;
    this.downJitter = downJitter || 0;
  }
}
/**
 * 记录矩形的四个点坐标
 *
 * @param {Number} left   - 左坐标
 * @param {Number} top    - 上坐标
 * @param {Number} right  - 右坐标
 * @param {Number} bottom - 下坐标
 *
 */
export class Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  constructor(left?: number, top?: number, right?: number, bottom?: number) {
    this.left = left ?? 0;
    this.top = top ?? 0;
    this.right = right ?? 0;
    this.bottom = bottom ?? 0;
  }
}
/**
 * 云端混流中每一路子画面的位置信息
 *
 * TRTCMixUser 用于指定每一路（即每一个 userId）视频画面的具体摆放位置
 *
 * @param {String}              userId      - 参与混流的 userId
 * @param {String}              roomId      - 参与混流的 roomId，跨房流传入的实际 roomId，当前房间流传入 roomId = ''
 * @param {Rect}                rect        - 图层位置坐标以及大小，左上角为坐标原点(0,0) （绝对像素值）
 * @param {Number}              rect.left   - 图层位置的左坐标
 * @param {Number}              rect.top    - 图层位置的上坐标
 * @param {Number}              rect.right  - 图层位置的右坐标
 * @param {Number}              rect.bottom - 图层位置的下坐标
 * @param {Number}              zOrder      - 图层层次（1 - 15）不可重复
 * @param {Boolean}             pureAudio   - 是否纯音频
 * @param {TRTCVideoStreamType} streamType  - 参与混合的是主路画面（TRTCVideoStreamTypeBig）或屏幕分享（TRTCVideoStreamTypeSub）画面
 * @param {TRTCMixInputType}    inputType   - 指定该路流的混合内容（只混音频、只混视频、混合音视频、混入水印）
 * @param {Number}              renderMode  - 该画面在输出时的显示模式
 * @param {String}              image       - 占位图或水印图
 *
 */
export class TRTCMixUser {
  userId: string;
  roomId: string;
  rect: null | Rect;
  zOrder: number;
  pureAudio: boolean;
  streamType: TRTCVideoStreamType;
  inputType: TRTCMixInputType;
  renderMode: number;
  image: string;
  constructor(
    userId?: string,
    roomId?: string,
    rect?: null | Rect,
    zOrder?: number,
    pureAudio?: boolean,
    streamType?: TRTCVideoStreamType,
    inputType?: TRTCMixInputType,
    renderMode?: number,
    image?: string,
  ) {
    this.userId = userId || '';
    this.roomId = roomId || '';
    this.rect = rect || null;
    this.zOrder = zOrder || 0;
    this.pureAudio = pureAudio !== undefined ? pureAudio : false;
    this.streamType = streamType || TRTCVideoStreamType.TRTCVideoStreamTypeBig;
    this.inputType = inputType || TRTCMixInputType.TRTCMixInputTypeAudioVideo;
    this.renderMode = renderMode || 0;
    this.image = image || '';
  }
}
export enum TRTCTranscodingConfigMode {
  TRTCTranscodingConfigMode_Unknown = 0,
  TRTCTranscodingConfigMode_Manual = 1,
  TRTCTranscodingConfigMode_Template_PureAudio = 2,
  TRTCTranscodingConfigMode_Template_PresetLayout = 3,
  TRTCTranscodingConfigMode_Template_ScreenSharing = 4,
  TRTC_TranscodingConfigMode_Unknown = 5,
  TRTC_TranscodingConfigMode_Manual = 6,
  TRTC_TranscodingConfigMode_Template_PureAudio = 7,
  TRTC_TranscodingConfigMode_Template_PresetLayout = 8,
  TRTC_TranscodingConfigMode_Template_ScreenSharing = 9,
}
export enum TRTCMixInputType {
  TRTCMixInputTypeUndefined = 0,
  TRTCMixInputTypeAudioVideo = 1,
  TRTCMixInputTypePureVideo = 2,
  TRTCMixInputTypePureAudio = 3,
  TRTCMixInputTypeWatermark = 4,
}
export enum TRTCAudioRecordingContent {
  TRTCAudioRecordingContentAll = 0,
  TRTCAudioRecordingContentLocal = 1,
  TRTCAudioRecordingContentRemote = 2,
}
export enum TRTCPublishMode {
  TRTCPublishModeUnknown = 0,
  TRTCPublishBigStreamToCdn = 1,
  TRTCPublishSubStreamToCdn = 2,
  TRTCPublishMixStreamToCdn = 3,
  TRTCPublishMixStreamToRoom = 4,
}
export enum TRTCVoiceReverbType {
  TRTCLiveVoiceReverbType_0 = 0,
  TRTCLiveVoiceReverbType_1 = 1,
  TRTCLiveVoiceReverbType_2 = 2,
  TRTCLiveVoiceReverbType_3 = 3,
  TRTCLiveVoiceReverbType_4 = 4,
  TRTCLiveVoiceReverbType_5 = 5,
  TRTCLiveVoiceReverbType_6 = 6,
  TRTCLiveVoiceReverbType_7 = 7,
  TRTCLiveVoiceReverbType_8 = 8,
  TRTCLiveVoiceReverbType_9 = 9,
  TRTCLiveVoiceReverbType_10 = 10,
  TRTCLiveVoiceReverbType_11 = 11,
}
export enum TRTCVoiceChangerType {
  TRTCLiveVoiceChangerType_0 = 0,
  TRTCLiveVoiceChangerType_1 = 1,
  TRTCLiveVoiceChangerType_2 = 2,
  TRTCLiveVoiceChangerType_3 = 3,
  TRTCLiveVoiceChangerType_4 = 4,
  TRTCLiveVoiceChangerType_5 = 5,
  TRTCLiveVoiceChangerType_6 = 6,
  TRTCLiveVoiceChangerType_7 = 7,
  TRTCLiveVoiceChangerType_8 = 8,
  TRTCLiveVoiceChangerType_9 = 9,
  TRTCLiveVoiceChangerType_10 = 10,
  TRTCLiveVoiceChangerType_11 = 11,
}
export enum TRTCPluginType {
  TRTCPluginTypeUnknown = 0,
  TRTCPluginTypeVideoProcess = 1,
  TRTCPluginTypeMediaEncryptDecrypt = 2,
  TRTCPluginTypeAudioProcess = 3,
}
export interface PluginInfo {
  id: string;
  deviceId?: string;
  enable: () => number;
  disable: () => number;
  setParameter: (param: string) => number;
}
export declare type TRTCPluginInfo = PluginInfo;
export declare type TRTCVideoProcessPluginOptions = {
  enable?: boolean;
  pixelFormat?: TRTCVideoPixelFormat;
};
export declare type TRTCMediaEncryptDecryptPluginOptions = {
  enable?: boolean;
};
export declare type TRTCAudioProcessPluginOptions = {
  enable?: boolean;
};
/**
 * 云端混流（转码）配置
 *
 * 包括最终编码质量和各路画面的摆放位置
 *
 * @param {TRTCTranscodingConfigMode} mode - 【字段含义】转码 config 模式
 * @param {Number} appId - 【字段含义】腾讯云直播 AppID<br>
 *                         【推荐取值】请在 [实时音视频控制台](https://console.cloud.tencent.com/rav) 选择已经创建的应用，单击【帐号信息】后，在“直播信息”中获取
 * @param {Number} bizId - 【字段含义】腾讯云直播 bizid<br>
 *                         【推荐取值】请在 [实时音视频控制台](https://console.cloud.tencent.com/rav) 选择已经创建的应用，单击【帐号信息】后，在“直播信息”中获取
 * @param {Number} videoWidth   - 【字段含义】最终转码后的视频分辨率的宽度。<br>
 *                                【推荐取值】推荐值：360px ，如果你是纯音频推流，请将 width × height 设为 0px × 0px，否则混流后会携带一条画布背景的视频流。
 * @param {Number} videoHeight  - 【字段含义】最终转码后的视频分辨率的高度。<br>
 *                                【推荐取值】推荐值：640px ，如果你是纯音频推流，请将 width × height 设为 0px × 0px，否则混流后会携带一条画布背景的视频流。
 * @param {Number} videoBitrate - 【字段含义】最终转码后的视频分辨率的码率（kbps）<br>
 *                                【推荐取值】如果填0，后台会根据videoWidth和videoHeight来估算码率，您也可以参考枚举定义TRTCVideoResolution_640_480的注释。
 * @param {Number} videoFramerate  - 【字段含义】最终转码后的视频分辨率的帧率（FPS）<br>
 *                                   【推荐取值】默认值：15fps，取值范围是 (0,30]。
 * @param {Number} videoGOP        - 【字段含义】最终转码后的视频分辨率的关键帧间隔（又称为 GOP）。<br>
 *                                   【推荐取值】默认值：2，单位为秒，取值范围是 [1,8]。
 * @param {Number} backgroundColor - 【字段含义】混合后画面的底色颜色，默认为黑色，格式为十六进制数字，比如：“0x61B9F1” 代表 RGB 分别为(97,158,241)。<br>
 *                                   【推荐取值】默认值：0x000000，黑色
 * @param {String} backgroundImage - 【字段含义】混合后画面的背景图。<br>
 *                                   【推荐取值】默认值：''，即不设置背景图<br>
 *                                   【特别说明】背景图需要您事先在 “[控制台](https://console.cloud.tencent.com/trtc) => 应用管理 => 功能配置 => 素材管理” 中上传，<br>
 *                                    上传成功后可以获得对应的“图片ID”，然后将“图片ID”转换成字符串类型并设置到 backgroundImage 里即可。<br>
 *                                    例如：假设“图片ID” 为 63，可以设置 backgroundImage = @"63";
 * @param {Number} audioSampleRate - 【字段含义】最终转码后的音频采样率。<br>
 *                                   【推荐取值】默认值：48000Hz。支持12000HZ、16000HZ、22050HZ、24000HZ、32000HZ、44100HZ、48000HZ。
 * @param {Number} audioBitrate    - 【字段含义】最终转码后的音频码率。<br>
 *                                   【推荐取值】默认值：64kbps，取值范围是 [32，192]。
 * @param {Number} audioChannels   - 【字段含义】最终转码后的音频声道数<br>
 *                                   【推荐取值】默认值：1。取值范围为 [1,2] 中的整型。
 * @param {TRTCMixUser[]} mixUsersArray - 【字段含义】每一路子画面的位置信息
 * @param {String} streamId        - 【字段含义】输出到 CDN 上的直播流 ID。<br>
 *                                    如不设置该参数，SDK 会执行默认逻辑，即房间里的多路流会混合到该接口调用者的视频流上，也就是 A+B =>A；<br>
 *                                    如果设置该参数，SDK 会将房间里的多路流混合到您指定的直播流 ID 上，也就是 A+B =>C。<br>
 *                                   【推荐取值】默认值：''，即房间里的多路流会混合到该接口调用者的视频流上。
 */
export class TRTCTranscodingConfig {
  mode: TRTCTranscodingConfigMode;
  appId: number;
  bizId: number;
  videoWidth: number;
  videoHeight: number;
  videoBitrate: number;
  videoFramerate: number;
  videoGOP: number;
  backgroundColor: number;
  backgroundImage: string;
  audioSampleRate: number;
  audioBitrate: number;
  audioChannels: number;
  mixUsersArray: TRTCMixUser[];
  streamId: string;
  constructor(
    mode?: TRTCTranscodingConfigMode,
    appId?: number,
    bizId?: number,
    videoWidth?: number,
    videoHeight?: number,
    videoBitrate?: number,
    videoFramerate?: number,
    videoGOP?: number,
    backgroundColor?: number,
    backgroundImage?: string,
    audioSampleRate?: number,
    audioBitrate?: number,
    audioChannels?: number,
    mixUsersArray?: any[],
    streamId?: string,
  ) {
    this.mode = mode || TRTCTranscodingConfigMode.TRTCTranscodingConfigMode_Unknown;
    this.appId = appId || 0;
    this.bizId = bizId || 0;
    this.videoWidth = videoWidth || 0;
    this.videoHeight = videoHeight || 0;
    this.videoBitrate = videoBitrate || 0;
    this.videoFramerate = videoFramerate || 15;
    this.videoGOP = videoGOP || 2;
    this.backgroundColor = backgroundColor || 0x000000;
    this.backgroundImage = backgroundImage || '';
    this.audioSampleRate = audioSampleRate || 48000;
    this.audioBitrate = audioBitrate || 64;
    this.audioChannels = audioChannels || 1;
    this.mixUsersArray = mixUsersArray || [];
    this.streamId = streamId || '';
  }
}
/**
 * CDN 旁路推流参数
 *
 * @param {Number} appId - 腾讯云 AppID，请在 [实时音视频控制台](https://console.cloud.tencent.com/rav) 选择已经创建的应用，单击【帐号信息】后，在“直播信息”中获取
 * @param {Number} bizId - 腾讯云直播 bizId，请在 [实时音视频控制台](https://console.cloud.tencent.com/rav) 选择已经创建的应用，单击【帐号信息】后，在“直播信息”中获取
 * @param {String} url - 旁路转推的 URL
 * @param {String} streamId - 需要转推的 streamId，默认值：空值。如果不填写，则默认转推调用者的旁路流。
 *
 */
export class TRTCPublishCDNParam {
  appId: number;
  bizId: number;
  url: null | string;
  streamId: null | string;
  constructor(
    appId?: number,
    bizId?: number,
    url?: null | string,
    streamId?: null | string,
  ) {
    this.appId = appId || 0;
    this.bizId = bizId || 0;
    this.url = url || null;
    this.streamId = streamId || null;
  }
}
export declare type TRTCPublishCdnUrl = {
  rtmpUrl: string;
  isInternalLine: boolean;
};
export declare type TRTCUser = {
  userId: string;
  intRoomId: number;
  strRoomId: string;
};
export declare type TRTCPublishTarget = {
  mode: TRTCPublishMode;
  cdnUrlList: TRTCPublishCdnUrl[];
  mixStreamIdentity: TRTCUser;
};
export declare type TRTCStreamEncoderParam = {
  videoEncodedWidth: number;
  videoEncodedHeight: number;
  videoEncodedFPS: number;
  videoEncodedGOP: number;
  videoEncodedKbps: number;
  audioEncodedSampleRate: number;
  audioEncodedChannelNum: number;
  audioEncodedKbps: number;
  audioEncodedCodecType: number;
  videoEncodedCodecType: number;
  videoSeiParams: string;
};
export declare type TRTCVideoLayout = {
  rect: Rect;
  zOrder: number;
  fillMode: TRTCVideoFillMode;
  backgroundColor: number;
  placeHolderImage: string;
  fixedVideoUser: TRTCUser;
  fixedVideoStreamType: TRTCVideoStreamType;
};
export declare type TRTCWatermark = {
  watermarkUrl: string;
  rect: Rect;
  zOrder: number;
};
export declare type TRTCStreamMixingConfig = {
  backgroundColor: number;
  backgroundImage: string;
  videoLayoutList: TRTCVideoLayout[];
  audioMixUserList: TRTCUser[];
  watermarkList: TRTCWatermark[];
};
/**
 * 录音参数
 *
 * @param {String} filePath                            - 【字段含义】录音文件的保存路径（必填）。<br/>
 *【特别说明】该路径需精确到文件名及格式后缀，格式后缀用于决定录音文件的格式，目前支持的格式有 PCM、WAV 和 AAC。<br/>
 * 例如：假如您指定路径为 "mypath/record/audio.aac"，代表您希望 SDK 生成一个 AAC 格式的音频录制文件。<br/>
 * 请您指定一个有读写权限的合法路径，否则录音文件无法生成。<br/>
 * @param {TRTCAudioRecordingContent} recordingContent - 【字段含义】音频录制内容类型。
 *                                                       【特别说明】默认录制所有本地和远端音频。
 * @param {Number} maxDurationPerFile                  - 【字段含义】maxDurationPerFile 录制文件分片时长，单位毫秒，最小值10000。默认值为0，表示不分片。
 */
export class TRTCAudioRecordingParams {
  filePath: null | string;
  recordingContent: TRTCAudioRecordingContent;
  maxDurationPerFile: number;
  constructor(
    filePath?: null | string,
    recordingContent?: TRTCAudioRecordingContent,
    maxDurationPerFile?: number,
  ) {
    this.filePath = filePath || null;
    this.recordingContent = recordingContent || TRTCAudioRecordingContent.TRTCAudioRecordingContentAll;
    this.maxDurationPerFile = maxDurationPerFile || 0;
  }
}
/**
 * 音效
 *
 * @param {Number} effectId  - 【字段含义】音效 ID<br>
 *                             【特殊说明】SDK 允许播放多路音效，因此需要音效 ID 进行标记，用于控制音效的开始、停止、音量等
 * @param {String} path      - 【字段含义】音效路径
 * @param {Number} loopCount - 【字段含义】循环播放次数<br>
 *                             【推荐取值】取值范围为0 - 任意正整数，默认值：0。0表示播放音效一次；1表示播放音效两次；以此类
 * @param {Boolean} publish  - 【字段含义】音效是否上行<br>
 *                             【推荐取值】YES：音效在本地播放的同时，会上行至云端，因此远端用户也能听到该音效；NO：音效不会上行至云端，因此只能在本地听到该音效。默认值：NO
 * @param {Number} volume    - 【字段含义】音效音量<br>
 *                             【推荐取值】取值范围为0 - 100；默认值：100
 */
export class TRTCAudioEffectParam {
  effectId: number;
  path: string;
  loopCount: number;
  publish: boolean;
  volume: number;
  constructor(
    effectId?: number,
    path?: string,
    loopCount?: number,
    publish?: boolean,
    volume?: number,
  ) {
    this.effectId = effectId || 0;
    this.path = path || '';
    this.loopCount = loopCount || 0;
    this.publish = publish !== undefined ? publish : false;
    this.volume = volume || 100;
  }
}
/**
 * 本地的音视频统计信息
 *
 * @param {Number} width           - 视频宽度
 * @param {Number} height          - 视频高度
 * @param {Number} frameRate       - 帧率（fps）
 * @param {Number} videoBitrate    - 视频发送码率（Kbps）
 * @param {Number} audioSampleRate - 音频采样率（Hz）
 * @param {Number} audioBitrate    - 音频发送码率（Kbps）
 * @param {TRTCVideoStreamType} streamType - 流类型（大画面 | 小画面 | 辅路画面）
 *
 */
export class TRTCLocalStatistics {
  width: number;
  height: number;
  frameRate: number;
  videoBitrate: number;
  audioSampleRate: number;
  audioBitrate: number;
  streamType: TRTCVideoStreamType;
  constructor(
    width?: number,
    height?: number,
    frameRate?: number,
    videoBitrate?: number,
    audioSampleRate?: number,
    audioBitrate?: number,
    streamType?: TRTCVideoStreamType,
  ) {
    this.width = width || 0;
    this.height = height || 0;
    this.frameRate = frameRate || 0;
    this.videoBitrate = videoBitrate || 0;
    this.audioSampleRate = audioSampleRate || 0;
    this.audioBitrate = audioBitrate || 0;
    this.streamType = streamType || TRTCVideoStreamType.TRTCVideoStreamTypeBig;
  }
}
/**
 * 远端成员的音视频统计信息
 *
 * @param {String} userId          - 用户 ID，指定是哪个用户的视频流
 * @param {Number} audioPacketLoss - 音频流的总丢包率（％）
 *                                   audioPacketLoss 代表音频流历经`主播>云端>观众`这样一条完整的传输链路后，最终在观众端统计到的丢包率。
 *                                   audioPacketLoss 越小越好，丢包率为0即表示该路音频流的所有数据均已经完整地到达了观众端。
 *                                   如果出现了 downLoss == 0 但 audioPacketLoss != 0 的情况，说明该路音频流在“云端=>观众”这一段链路上没有出现丢包，
 *                                   但是在`主播>云端`这一段链路上出现了不可恢复的丢包。
 * @param {Number} videoPacketLoss - 该路视频流的总丢包率（％）
 *                                   videoPacketLoss 代表该路视频流历经`主播>云端>观众`这样一条完整的传输链路后，最终在观众端统计到的丢包率。
 *                                   videoPacketLoss 越小越好，丢包率为0即表示该路视频流的所有数据均已经完整地到达了观众端。
 *                                   如果出现了 downLoss == 0 但 videoPacketLoss != 0 的情况，说明该路视频流在`云端>观众`这一段链路上没有出现丢包，
 *                                   但是在`主播>云端`这一段链路上出现了不可恢复的丢包。
 * @param {Number} width           - 视频宽度
 * @param {Number} height          - 视频高度
 * @param {Number} frameRate       - 接收帧率（fps）
 * @param {Number} videoBitrate    - 视频码率（Kbps）
 * @param {Number} audioSampleRate - 音频采样率（Hz）
 * @param {Number} audioBitrate    - 音频码率（Kbps）
 * @param {Number} jitterBufferDelay    - 播放时延（ms）
 * @param {Number} point2PointDelay     - 端到端延迟（ms）
 *                                        point2PointDelay 代表 “主播=>云端=>观众” 的延迟，更准确地说，它代表了“采集=>编码=>网络传输=>接收=>缓冲=>解码=>播放” 全链路的延迟。
 *                                        point2PointDelay 需要本地和远端的 SDK 均为 8.5 及以上的版本才生效，若远端用户为 8.5 以前的版本，此数值会一直为0，代表无意义。
 * @param {Number} audioTotalBlockTime    - 音频播放卡顿累计时长（ms）
 * @param {Number} audioBlockRate    - 音频播放卡顿率，音频卡顿累计时长占音频总播放时长的百分比 (%)
 * @param {Number} videoTotalBlockTime    - 视频播放卡顿累计时长（ms）
 * @param {Number} videoBlockRate    - 视频播放卡顿率，视频卡顿累计时长占音频总播放时长的百分比（%）
 * @param {Number} finalLoss         - 该线路的总丢包率（％）。已废弃，不推荐使用；建议使用 audioPacketLoss、videoPacketLoss 替代
 * @param {Number} remoteNetworkUplinkLoss - 该用户从 SDK 到云端的上行丢包率，单位 (%)
 *                                           该数值越小越好，如果 remoteNetworkUplinkLoss 为 0%，则意味着上行链路的网络质量很好，上传到云端的数据包基本不发生丢失。
 *                                           如果 remoteNetworkUplinkLoss 为 30%，则意味着 SDK 向云端发送的音视频数据包中，会有 30% 丢失在传输链路中。
 * @param {Number} remoteNetworkRTT        - 该用户从 SDK 到云端的往返延时，单位 ms
 *                                           该数值代表从 SDK 发送一个网络包到云端，再从云端回送一个网络包到 SDK 的总计耗时，也就是一个网络包经历 “SDK=>云端=>SDK” 的总耗时。
 *                                           该数值越小越好：如果 remoteNetworkRTT < 50ms，意味着较低的音视频通话延迟；如果 remoteNetworkRTT > 200ms，则意味着较高的音视频通话延迟。
 *                                           需要特别解释的是，remoteNetworkRTT 代表 “SDK=>云端=>SDK” 的总耗时，所以不需要区分 remoteNetworkUpRTT 和 remoteNetworkDownRTT
 * @param {TRTCVideoStreamType} streamType - 流类型（大画面 | 小画面 | 辅路画面）
 *
 */
export class TRTCRemoteStatistics {
  userId: string;
  finalLoss: number;
  width: number;
  height: number;
  frameRate: number;
  videoBitrate: number;
  audioSampleRate: number;
  audioBitrate: number;
  jitterBufferDelay: number;
  audioTotalBlockTime: number;
  audioBlockRate: number;
  videoTotalBlockTime: number;
  videoBlockRate: number;
  streamType: TRTCVideoStreamType;
  audioPacketLoss: number;
  videoPacketLoss: number;
  point2PointDelay: number;
  remoteNetworkUplinkLoss: number;
  remoteNetworkRTT: number;
  constructor(
    userId?: string,
    finalLoss?: number,
    width?: number,
    height?: number,
    frameRate?: number,
    videoBitrate?: number,
    audioSampleRate?: number,
    audioBitrate?: number,
    jitterBufferDelay?: number,
    audioTotalBlockTime?: number,
    audioBlockRate?: number,
    videoTotalBlockTime?: number,
    videoBlockRate?: number,
    streamType?: TRTCVideoStreamType,
    audioPacketLoss?: number,
    videoPacketLoss?: number,
    point2PointDelay?: number,
    remoteNetworkUplinkLoss?: number,
    remoteNetworkRTT?: number,
  ) {
    this.userId = userId || '';
    this.finalLoss = finalLoss || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.frameRate = frameRate || 0;
    this.videoBitrate = videoBitrate || 0;
    this.audioSampleRate = audioSampleRate || 0;
    this.audioBitrate = audioBitrate || 0;
    this.jitterBufferDelay = jitterBufferDelay || 0;
    this.audioTotalBlockTime = audioTotalBlockTime || 0;
    this.audioBlockRate = audioBlockRate || 0;
    this.videoTotalBlockTime = videoTotalBlockTime || 0;
    this.videoBlockRate = videoBlockRate || 0;
    this.streamType = streamType || TRTCVideoStreamType.TRTCVideoStreamTypeBig;
    this.audioPacketLoss = audioPacketLoss || 0;
    this.videoPacketLoss = videoPacketLoss || 0;
    this.point2PointDelay = point2PointDelay || 0;
    this.remoteNetworkUplinkLoss = remoteNetworkUplinkLoss || 0;
    this.remoteNetworkRTT = remoteNetworkRTT || 0;
  }
}
/**
 * 统计数据
 *
 * @param {Number} upLoss    - C -> S 上行丢包率（％），这个值越小越好，例如，0%的丢包率代表网络很好，
 *                             而 30% 的丢包率则意味着 SDK 向服务器发送的每10个数据包中就会有3个会在上行传输中丢失。
 * @param {Number} downLoss  - S -> C 下行丢包率（％），这个值越小越好，例如，0%的丢包率代表网络很好，
 *                             而 30% 的丢包率则意味着服务器向 SDK 发送的每10个数据包中就会有3个会在下行传输中丢失。
 * @param {Number} appCpu    - 当前 App 的 CPU 使用率（％）
 * @param {Number} systemCpu - 当前系统的 CPU 使用率（％）
 * @param {Number} rtt       - 从 SDK 到云端的往返延时，单位 ms。
 *                             该数值代表从 SDK 发送一个网络包到云端，再从云端回送一个网络包到 SDK 的总计耗时，也就是一个网络包经历 “SDK=>云端=>SDK” 的总耗时。
 *                             该数值越小越好：如果 rtt < 50ms，意味着较低的音视频通话延迟；如果 rtt > 200ms，则意味着较高的音视频通话延迟。
 *                             需要特别解释的是，rtt 代表 “SDK=>云端=>SDK” 的总耗时，所以不需要区分 upRtt 和 downRtt。
 * @param {Number} receivedBytes - 总接收字节数（包含信令和音视频）
 * @param {Number} sentBytes     - 总发送字节总数（包含信令和音视频）
 * @param {TRTCLocalStatistics[]} localStatisticsArray - 自己本地的音视频统计信息，由于可能有大画面、小画面以及辅路画面等多路的情况，所以是一个数组
 * @param {Number} localStatisticsArraySize - 数组 localStatisticsArray 的大小
 * @param {TRTCRemoteStatistics[]} remoteStatisticsArray - 远端成员的音视频统计信息，由于可能有大画面、小画面以及辅路画面等多路的情况，所以是一个数组
 * @param {Number} remoteStatisticsArraySize - 数组 remoteStatisticsArray 的大小
 * @param {Number} gatewayRtt - 从 SDK 到本地路由器的往返时延，单位 ms。
 *                              该数值代表从 SDK 发送一个网络包到本地路由器网关，再从网关回送一个网络包到 SDK 的总计耗时，也就是一个网络包经历 “SDK>网关>SDK” 的总耗时。
 *                              该数值越小越好：如果 gatewayRtt < 50ms，意味着较低的音视频通话延迟；如果 gatewayRtt > 200ms，则意味着较高的音视频通话延迟。
 * @param {Number} systemMemoryInMB - 当前系统的内存，单位 (MB)
 * @param {Number} systemMemoryUsageInMB - 当前系统内存占用，单位 (MB)
 * @param {Number} appMemoryUsageInMB - 当前应用的内存占用，单位 (MB)
 *
 */
export class TRTCStatistics {
  upLoss: number;
  downLoss: number;
  appCpu: number;
  systemCpu: number;
  rtt: number;
  receivedBytes: number;
  sentBytes: number;
  localStatisticsArray: TRTCLocalStatistics[];
  localStatisticsArraySize: number;
  remoteStatisticsArray: TRTCRemoteStatistics[];
  remoteStatisticsArraySize: number;
  gatewayRtt: number;
  appMemoryUsageInMB: number;
  systemMemoryUsageInMB: number;
  systemMemoryInMB: number;
  constructor(
    upLoss?: number,
    downLoss?: number,
    appCpu?: number,
    systemCpu?: number,
    rtt?: number,
    receivedBytes?: number,
    sentBytes?: number,
    localStatisticsArray?: TRTCLocalStatistics[],
    localStatisticsArraySize?: number,
    remoteStatisticsArray?: TRTCRemoteStatistics[],
    remoteStatisticsArraySize?: number,
    gatewayRtt?: number,
    appMemoryUsageInMB?: number,
    systemMemoryUsageInMB?: number,
    systemMemoryInMB?: number,
  ) {
    this.upLoss = upLoss || 0;
    this.downLoss = downLoss || 0;
    this.appCpu = appCpu || 0;
    this.systemCpu = systemCpu || 0;
    this.rtt = rtt || 0;
    this.receivedBytes = receivedBytes || 0;
    this.sentBytes = sentBytes || 0;
    this.localStatisticsArray = localStatisticsArray || [];
    this.localStatisticsArraySize = localStatisticsArraySize || 0;
    this.remoteStatisticsArray = remoteStatisticsArray || [];
    this.remoteStatisticsArraySize = remoteStatisticsArraySize || 0;
    this.gatewayRtt = gatewayRtt || 0;
    this.appMemoryUsageInMB = appMemoryUsageInMB || 0;
    this.systemMemoryUsageInMB = systemMemoryUsageInMB || 0;
    this.systemMemoryInMB = systemMemoryInMB || 0;
  }
}
/**
 * 音乐参数
 *
 * @param {Number} id    - 音乐 ID
 * @param {String} path  - 音乐文件的绝对路径
 * @param {Number} loopCount  - 音乐循环播放的次数
 * @param {Boolean} publish  - 是否将音乐传到远端
 * @param {Boolean} isShortFile  - 播放的是否为短音乐文件
 * @param {Number} startTimeMS  - 音乐开始播放时间点，单位毫秒
 * @param {Number} endTimeMS  - 音乐结束播放时间点，单位毫秒，0表示播放至文件结尾。
 *
 */
export class AudioMusicParam {
  id: number;
  path: string;
  loopCount: number;
  publish: boolean;
  isShortFile: boolean;
  startTimeMS: number;
  endTimeMS: number;
  constructor(
    id?: number,
    path?: string,
    loopCount?: number,
    publish?: boolean,
    isShortFile?: boolean,
    startTimeMS?: number,
    endTimeMS?: number,
  ) {
    this.id = id || 0;
    this.path = path || '';
    this.loopCount = loopCount || 0;
    this.publish = publish !== undefined ? publish : false;
    this.isShortFile = isShortFile !== undefined ? isShortFile : false;
    this.startTimeMS = startTimeMS || 0;
    this.endTimeMS = endTimeMS || 0;
  }
}
export declare type TRTCAudioMusicParam = {
  id: number;
  path: string;
  loopCount: number;
  publish: boolean;
  isShortFile: boolean;
  startTimeMS: number;
  endTimeMS: number;
};
/**
 * 背景音乐播放事件监听器类型定义
 */
export declare type TRTCMusicPlayObserver = {
  /**
   * 背景音乐开始播放事件
   * @param {Number} id - 背景音乐 ID
   * @param {Number} errCode - 错误码。0: 开始播放成功；-4001: 打开文件失败，如音频文件格式不支持，本地音频文件不存在，网络音频文件无法访问等。
   * @returns
   */
  onStart: (id: number, errCode: number) => void | null;
  /**
   * 背景音乐的播放进度事件
   * @param {Number} id - 背景音乐 ID
   * @param {Number} curPtsMS - 背景音乐当前播放时间戳
   * @param {Number} durationMS - 背景音乐时长
   * @returns
   */
  onPlayProgress: (
    id: number,
    curPtsMS: number,
    durationMS: number,
  ) => void | null;
  /**
   * 背景音乐播放完毕事件
   * @param {Number} id - 背景音乐 ID
   * @param {Number} errCode - 错误码。0: 播放结束；-4002: 解码失败，如音频文件损坏，网络音频文件服务器无法访问等。
   * @returns
   */
  onComplete: (id: number, errCode: number) => void | null;
};
export declare type TRTCMusicPreloadObserver = {
  /**
   * 背景音乐预加载进度
   * @param {Number} id -  背景音乐 ID
   * @param {Number} progress -  加载进度
   */
  onLoadProgress: (id: number, progress: number) => void;
  /**
   *  背景音乐预加载出错
   * @param {Number} id -  背景音乐 ID
   * @param {Number} errorCode - 错误码
   */
  onLoadError: (id: number, errorCode: number) => void;
};
/**
 * 音频数据自定义回调事件监听器类型定义
 */
export declare type TRTCAudioFrameCallback = {
  /**
   * 本地采集并经过音频模块前处理后的音频数据回调
   * @param {TRTCAudioFrame} frame - PCM 格式的音频数据帧(只读)
   * @returns
   */
  onCapturedAudioFrame: (frame: TRTCAudioFrame) => void | null;
  /**
   * 本地采集并经过音频模块前处理、音效处理和混 BGM 后的音频数据回调
   * @param {TRTCAudioFrame} frame - PCM 格式的音频数据帧(只读)
   * @returns
   */
  onLocalProcessedAudioFrame: (frame: TRTCAudioFrame) => void | null;
  /**
   * 混音前的每一路远程用户的音频数据
   * @param {TRTCAudioFrame} frame - PCM 格式的音频数据帧(只读)
   * @param {String} userId - 用户ID
   * @returns
   */
  onPlayAudioFrame: (frame: TRTCAudioFrame, userId: string) => void | null;
  /**
   * 将各路待播放音频混合之后并在最终提交系统播放之前的数据回调
   * @param {TRTCAudioFrame} frame - PCM 格式的音频数据帧(只读)
   * @returns
   */
  onMixedPlayAudioFrame: (frame: TRTCAudioFrame) => void | null;
  /**
   * SDK 所有音频混合后的音频数据（包括采集到的和待播放的）
   * @param {TRTCAudioFrame} frame - PCM 格式的音频数据帧(只读)
   * @returns
   */
  onMixedAllAudioFrame: (frame: TRTCAudioFrame) => void | null;
};
/**
 * 房间切换参数
 *
 * @param {Number} roomId    - 房间ID，在同一个房间内的用户可以看到彼此并进行视频通话, 若您选用 strRoomId，则 roomId 需要填写为0。
 * @param {String} strRoomId    - 字符串房间号码 [选填]，在同一个房间内的用户可以看到彼此并进行视频通话, roomId 和 strRoomId 必须填一个。若两者都填，则优先选择 roomId。
 * @param {String} userSig    - 用户签名 [选填]，当前 userId 对应的验证签名，相当于登录密码。不填时，SDK 会继续使用旧的 userSig，
 *                               但用户必须保证旧的 userSig 仍在有效期内，否则会造成进房失败等后果。
 * @param {String} privateMapKey - 房间签名 [选填]，当您希望某个房间只能让特定的 userId 进入时，需要使用 privateMapKey 进行权限保护。
 *
 */
export class TRTCSwitchRoomParam {
  roomId: number;
  strRoomId: string;
  userSig: string;
  privateMapKey: string;
  constructor(
    roomId?: number,
    strRoomId?: string,
    userSig?: string,
    privateMapKey?: string,
  ) {
    this.roomId = roomId || 0;
    this.strRoomId = strRoomId || '';
    this.userSig = userSig || '';
    this.privateMapKey = privateMapKey || '';
  }
}
export interface VideoFramePayload {
  uid: string;
  type: TRTCVideoStreamType;
  rotation: TRTCVideoRotation;
  timestamp: number;
  data: {
    width: number;
    height: number;
    data: ArrayBuffer;
  };
}
export class VideoBufferInfo {
  id: number;
  userId: string;
  buffer: Buffer | null;
  streamType: TRTCVideoStreamType;
  width: number;
  height: number;
  pixelFormat: TRTCVideoPixelFormat;
  pixelLength: number;
  constructor(options?: {
    id: number;
    userId: string;
    width: number;
    height: number;
    streamType: TRTCVideoStreamType;
    pixelFormat: TRTCVideoPixelFormat;
  }) {
    this.id = options?.id || 0;
    this.userId = options?.userId || '';
    this.width = options?.width || 0;
    this.height = options?.height || 0;
    this.streamType = options?.streamType || TRTCVideoStreamType.TRTCVideoStreamTypeBig;
    this.pixelFormat = options?.pixelFormat || TRTCVideoPixelFormat.TRTCVideoPixelFormat_Unknown;
    this.pixelLength = this.width * this.height * (this.pixelFormat === TRTCVideoPixelFormat.TRTCVideoPixelFormat_I420 ? 3 / 2 : 4);
    this.buffer = null;
  }
}
/**
 * 构造函数参数
 */
export interface TRTCInitConfig {
  networkProxy?: {
    host: string;
    port: number;
    username: string;
    password: string;
    config: {
      supportHttps: boolean;
      supportTcp: boolean;
      supportUdp: boolean;
    };
  };
  isIPCMode?: boolean;
}
