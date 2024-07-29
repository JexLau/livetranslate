import { type } from "os";
import { AudioStreamFormat } from "./AudioSource/AudioStreamFormatImpl";
import { ChunkedArrayBufferStream } from "./ChunkedArrayBufferStream";
import { Events, EventSource, createNoDashGuid } from "../Util";
import { PlatformEvent } from "../Connection/PlatformEvent";
import { AudioSourceErrorEvent, AudioSourceInitializingEvent, AudioSourceReadyEvent, AudioSourceOffEvent } from "./AudioSource/AudioSourceEvent";
import { AudioStreamNodeAttachingEvent, AudioStreamNodeAttachedEvent, AudioStreamNodeDetachedEvent } from "./AudioSource/AudioStreamNodeEvent";

// 文件音频源类
export class FileAudioSource {
  private privStreams: { [id: string]: ChunkedArrayBufferStream } = {};
  private privId: string;
  private privEvents: EventSource;
  private privSource: Blob | ArrayBuffer;
  private privAudioFormatPromise: Promise<AudioStreamFormat>;
  private privHeaderEnd: number = 44;
  private privFilename: string;
  private privMicrophoneLabel?: string;

  constructor(file: Blob | ArrayBuffer, filename?: string, audioSourceId?: string) {
      this.privId = audioSourceId || createNoDashGuid();
      this.privEvents = new EventSource();
      this.privSource = file;

      if (typeof window !== "undefined" && typeof Blob !== "undefined" && this.privSource instanceof Blob) {
          this.privFilename = file.name;
      } else {
          this.privFilename = filename || "unknown.wav";
      }

      this.privAudioFormatPromise = this.readHeader();
  }

  public get format(): Promise<AudioStreamFormat> {
      return this.privAudioFormatPromise;
  }

  public get blob(): Promise<Blob> {
      return Promise.resolve(this.privSource as Blob);
  }

  public turnOn(): Promise<void> {
      if (this.privFilename.lastIndexOf(".wav") !== this.privFilename.length - 4) {
          const errorMsg = `${this.privFilename} is not supported. Only WAVE files are allowed at the moment.`;
          this.onEvent(new AudioSourceErrorEvent(errorMsg, ""));
          return Promise.reject(errorMsg);
      }

      this.onEvent(new AudioSourceInitializingEvent(this.privId));
      this.onEvent(new AudioSourceReadyEvent(this.privId));
      return Promise.resolve();
  }

  public id(): string {
      return this.privId;
  }

  public async attach(audioNodeId: string): Promise<IAudioStreamNode> {
      this.onEvent(new AudioStreamNodeAttachingEvent(this.privId, audioNodeId));
      const stream = await this.upload(audioNodeId);
      this.onEvent(new AudioStreamNodeAttachedEvent(this.privId, audioNodeId));
      return {
          detach: async () => {
              stream.readEnded();
              delete this.privStreams[audioNodeId];
              this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
              await this.turnOff();
          },
          id: () => audioNodeId,
          read: () => stream.read()
      };
  }

  public detach(audioNodeId: string): void {
      if (audioNodeId && this.privStreams[audioNodeId]) {
          this.privStreams[audioNodeId].close();
          delete this.privStreams[audioNodeId];
          this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
      }
  }

  public turnOff(): Promise<void> {
      for (const streamId in this.privStreams) {
          if (streamId) {
              const stream = this.privStreams[streamId];
              if (stream && !stream.isClosed) {
                  stream.close();
              }
          }
      }

      this.onEvent(new AudioSourceOffEvent(this.privId));
      return Promise.resolve();
  }

  public get events(): EventSource {
      return this.privEvents;
  }

  public get deviceInfo(): Promise<ISpeechConfigAudioDevice> {
      return this.privAudioFormatPromise.then((result: AudioStreamFormat) =>
          Promise.resolve({
              bitspersample: result.bitsPerSample,
              channelcount: result.channels,
              connectivity: connectivity.Unknown,
              manufacturer: "Speech SDK",
              model: "File",
              samplerate: result.samplesPerSec,
              type: type.File
          })
      );
  }

  // ... 其他私有方法 ...

  private onEvent(event: PlatformEvent): void {
      this.privEvents.onEvent(event);
      Events.instance.onEvent(event);
  }
}