import { Deferred } from "./Util/Deferred";

// 音频格式标签枚举
export enum AudioFormatTag {
  PCM = 1,
  MuLaw = 2,
  Siren = 3,
  MP3 = 4,
  SILKSkype = 5,
  OGG_OPUS = 6,
  WEBM_OPUS = 7,
  ALaw = 8,
  FLAC = 9,
  OPUS = 10
}

// 流类型接口
export interface IStreamChunk<T> {
  isEnd: boolean;
  buffer: T | null;
  timeReceived: number;
}


// 订阅者类型枚举
export enum SubscriberType {
  Dequeue,
  Peek
}

// 订阅者接口
export interface ISubscriber {
  deferral: Deferred<any>;
  type: SubscriberType;
}

// 消息类型枚举
export enum MessageType {
  Text = 0,
  Binary = 1
}

// 连接状态枚举
export enum ConnectionState {
  None = 0,
  Connected = 1,
  Connecting = 2,
  Disconnected = 3
}

// 取消原因枚举
export enum CancellationReason {
  Error = 0,
  EndOfStream = 1
}

// 取消错误代码枚举
export enum CancellationErrorCode {
  NoError = 0,
  AuthenticationFailure = 1,
  BadRequestParameters = 2,
  TooManyRequests = 3,
  ConnectionFailure = 4,
  ServiceTimeout = 5,
  ServiceError = 6,
  RuntimeError = 7,
  Forbidden = 8
}

// 结果原因枚举
export enum ResultReason {
  // ... (这里应该有更多的枚举值，但在给定的代码中没有显示)
}

export enum PlatformEvent_EventType {
  Debug = 0,
  Info = 1,
  Warning = 2,
  Error = 3,
  None = 4
}

export interface IAudioStreamNode {
  detach: () => void;
  id: () => string;
  read: () => Promise<IStreamChunk<ArrayBuffer>>;
}

export interface IAudioSourceDeviceInfo {
  bitspersample: number;
  channelcount: number;
  connectivity: connectivity;
  manufacturer: string;
  model: string;
  samplerate: number;
  type: type;
}

export enum connectivity {
  Unknown = "Unknown",
  Wired = "Wired",
  Bluetooth = "Bluetooth",
  Cellular = "Cellular",
  WiFi = "WiFi",
  InBuilt = "InBuilt"
}

export enum type {
  Phone = "Phone",
  Speaker = "Speaker",
  Car = "Car",
  Headset = "Headset",
  Thermostat = "Thermostat",
  Microphones = "Microphones",
  Deskphone = "Deskphone",
  RemoteControl = "RemoteControl",
  Unknown = "Unknown",
  File = "File",
  Stream = "Stream"
}