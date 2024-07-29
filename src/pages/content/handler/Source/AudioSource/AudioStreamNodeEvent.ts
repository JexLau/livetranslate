import { AudioSourceEvent } from "./AudioSourceEvent";

// 音频流节点事件基类
export abstract  class AudioStreamNodeEvent extends AudioSourceEvent {
  private privAudioNodeId: string;

  protected constructor(eventName: string, audioSourceId: string, audioNodeId: string) {
      super(eventName, audioSourceId);
      this.privAudioNodeId = audioNodeId;
  }

  public get audioNodeId(): string {
      return this.privAudioNodeId;
  }
}

// 音频流节点附加中事件
export class AudioStreamNodeAttachingEvent extends AudioStreamNodeEvent {
  constructor(audioSourceId: string, audioNodeId: string) {
      super("AudioStreamNodeAttachingEvent", audioSourceId, audioNodeId);
  }
}

// 音频流节点已附加事件
export class AudioStreamNodeAttachedEvent extends AudioStreamNodeEvent {
  constructor(audioSourceId: string, audioNodeId: string) {
      super("AudioStreamNodeAttachedEvent", audioSourceId, audioNodeId);
  }
}

// 音频流节点已分离事件
export class AudioStreamNodeDetachedEvent extends AudioStreamNodeEvent {
  constructor(audioSourceId: string, audioNodeId: string) {
      super("AudioStreamNodeDetachedEvent", audioSourceId, audioNodeId);
  }
}

// 音频流节点错误事件
export class AudioStreamNodeErrorEvent extends AudioStreamNodeEvent {
  private privError: string;

  constructor(audioSourceId: string, audioNodeId: string, error: string) {
      super("AudioStreamNodeErrorEvent", audioSourceId, audioNodeId);
      this.privError = error;
  }

  public get error(): string {
      return this.privError;
  }
}