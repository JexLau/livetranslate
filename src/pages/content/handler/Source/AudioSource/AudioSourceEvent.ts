import { PlatformEvent } from "../../Connection/PlatformEvent";
import { PlatformEvent_EventType } from "../../typings";

export class AudioSourceEvent extends PlatformEvent {
  privAudioSourceId?: string;
  constructor(eventName: string, audioSourceId?: string, eventType = PlatformEvent_EventType.Info) {
    super(eventName, eventType);
    this.privAudioSourceId = audioSourceId;
  }
  get audioSourceId() {
    return this.privAudioSourceId;
  }
}

// 音频源初始化事件
export class AudioSourceInitializingEvent extends AudioSourceEvent {
  constructor(audioSourceId: string) {
    super("AudioSourceInitializingEvent", audioSourceId);
  }
}

// 音频源就绪事件
export class AudioSourceReadyEvent extends AudioSourceEvent {
  constructor(audioSourceId: string) {
    super("AudioSourceReadyEvent", audioSourceId);
  }
}

// 音频源关闭事件
export class AudioSourceOffEvent extends AudioSourceEvent {
  constructor(audioSourceId: string) {
    super("AudioSourceOffEvent", audioSourceId);
  }
}

// 音频源错误事件
export class AudioSourceErrorEvent extends AudioSourceEvent {
  private privError: string;

  constructor(audioSourceId: string, error: string) {
    super("AudioSourceErrorEvent", audioSourceId, PlatformEvent_EventType.Error);
    this.privError = error;
  }

  public get error(): string {
    return this.privError;
  }
}
