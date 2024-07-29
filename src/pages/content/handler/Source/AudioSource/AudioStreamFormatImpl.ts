import { AudioFormatTag } from "../../typings";

// 音频流格式类
export class AudioStreamFormat {
  public static getDefaultInputFormat(): AudioStreamFormatImpl {
      return AudioStreamFormatImpl.getDefaultInputFormat();
  }

  public static getWaveFormat(samplesPerSecond: number, bitsPerSample: number, channels: number, format?: AudioFormatTag): AudioStreamFormatImpl {
      return new AudioStreamFormatImpl(samplesPerSecond, bitsPerSample, channels, format);
  }

  public static getWaveFormatPCM(samplesPerSecond: number, bitsPerSample: number, channels: number): AudioStreamFormatImpl {
      return new AudioStreamFormatImpl(samplesPerSecond, bitsPerSample, channels);
  }
}

// 音频流格式实现类
export class AudioStreamFormatImpl extends AudioStreamFormat {
  private privHeader?: ArrayBuffer;
  public formatTag: number = 0;
  public bitsPerSample: number;
  public samplesPerSec: number;
  public channels: number;
  public avgBytesPerSec: number;
  public blockAlign: number;

  constructor(
      samplesPerSec: number = 16000,
      bitsPerSample: number = 16,
      channels: number = 1,
      format: AudioFormatTag = AudioFormatTag.PCM
  ) {
      super();
      let isWavFormat = true;

      switch (format) {
          case AudioFormatTag.PCM:
              this.formatTag = 1;
              break;
          case AudioFormatTag.ALaw:
              this.formatTag = 6;
              break;
          case AudioFormatTag.MuLaw:
              this.formatTag = 7;
              break;
          default:
              isWavFormat = false;
      }

      this.bitsPerSample = bitsPerSample;
      this.samplesPerSec = samplesPerSec;
      this.channels = channels;
      this.avgBytesPerSec = this.samplesPerSec * this.channels * (this.bitsPerSample / 8);
      this.blockAlign = this.channels * Math.max(this.bitsPerSample, 8);

      if (isWavFormat) {
          this.privHeader = new ArrayBuffer(44);
          const view = new DataView(this.privHeader);
          this.setString(view, 0, "RIFF");
          view.setUint32(4, 0, true);
          this.setString(view, 8, "WAVEfmt ");
          view.setUint32(16, 16, true);
          view.setUint16(20, this.formatTag, true);
          view.setUint16(22, this.channels, true);
          view.setUint32(24, this.samplesPerSec, true);
          view.setUint32(28, this.avgBytesPerSec, true);
          view.setUint16(32, this.channels * (this.bitsPerSample / 8), true);
          view.setUint16(34, this.bitsPerSample, true);
          this.setString(view, 36, "data");
          view.setUint32(40, 0, true);
      }
  }

  public static getDefaultInputFormat(): AudioStreamFormatImpl {
      return new AudioStreamFormatImpl();
  }

  public static getAudioContext(sampleRate?: number): AudioContext {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext || false;
      if (AudioContext) {
          if (sampleRate !== undefined && (navigator.mediaDevices as any).getSupportedConstraints().sampleRate) {
              return new AudioContext({ sampleRate });
          } else {
              return new AudioContext();
          }
      }
      throw new Error("Browser does not support Web Audio API (AudioContext is not available).");
  }

  public close(): void { }

  public get header(): ArrayBuffer | undefined {
      return this.privHeader;
  }

  private setString(view: DataView, offset: number, str: string): void {
      for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
      }
  }
}