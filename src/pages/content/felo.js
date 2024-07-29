var AudioFormatTag, Stream_awaiter = function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))((function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      var value;
      result.done ? resolve(result.value) : (value = result.value, value instanceof P ? value : new P((function (resolve) {
        resolve(value);
      }))).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  }));
};
class Stream_Stream {
  constructor(streamId) {
    this.privIsWriteEnded = !1, this.privIsReadEnded = !1, this.privId = streamId || createNoDashGuid(),
      this.privReaderQueue = new Queue;
  }
  get isClosed() {
    return this.privIsWriteEnded;
  }
  get isReadEnded() {
    return this.privIsReadEnded;
  }
  get id() {
    return this.privId;
  }
  close() {
    this.privIsWriteEnded || (this.writeStreamChunk({
      buffer: null,
      isEnd: !0,
      timeReceived: Date.now()
    }), this.privIsWriteEnded = !0);
  }
  writeStreamChunk(streamChunk) {
    if (this.throwIfClosed(), !this.privReaderQueue.isDisposed()) try {
      this.privReaderQueue.enqueue(streamChunk);
    } catch (e) { }
  }
  read() {
    if (this.privIsReadEnded) throw new InvalidOperationError("Stream read has already finished");
    return this.privReaderQueue.dequeue().then((streamChunk => Stream_awaiter(this, void 0, void 0, (function* () {
      return (void 0 === streamChunk || streamChunk.isEnd) && (yield this.privReaderQueue.dispose("End of stream reached")),
        streamChunk;
    }))));
  }
  readEnded() {
    this.privIsReadEnded || (this.privIsReadEnded = !0, this.privReaderQueue = new Queue);
  }
  throwIfClosed() {
    if (this.privIsWriteEnded) throw new InvalidOperationError("Stream closed");
  }
}
class ChunkedArrayBufferStream extends Stream_Stream {
  constructor(targetChunkSize, streamId) {
    super(streamId), this.privTargetChunkSize = targetChunkSize, this.privNextBufferReadyBytes = 0;
  }
  writeStreamChunk(chunk) {
    if (chunk.isEnd || 0 === this.privNextBufferReadyBytes && chunk.buffer.byteLength === this.privTargetChunkSize) return void super.writeStreamChunk(chunk);
    let bytesCopiedFromBuffer = 0;
    for (; bytesCopiedFromBuffer < chunk.buffer.byteLength;) {
      void 0 === this.privNextBufferToWrite && (this.privNextBufferToWrite = new ArrayBuffer(this.privTargetChunkSize),
        this.privNextBufferStartTime = chunk.timeReceived);
      const bytesToCopy = Math.min(chunk.buffer.byteLength - bytesCopiedFromBuffer, this.privTargetChunkSize - this.privNextBufferReadyBytes), targetView = new Uint8Array(this.privNextBufferToWrite), sourceView = new Uint8Array(chunk.buffer.slice(bytesCopiedFromBuffer, bytesToCopy + bytesCopiedFromBuffer));
      targetView.set(sourceView, this.privNextBufferReadyBytes), this.privNextBufferReadyBytes += bytesToCopy,
        bytesCopiedFromBuffer += bytesToCopy, this.privNextBufferReadyBytes === this.privTargetChunkSize && (super.writeStreamChunk({
          buffer: this.privNextBufferToWrite,
          isEnd: !1,
          timeReceived: this.privNextBufferStartTime
        }), this.privNextBufferReadyBytes = 0, this.privNextBufferToWrite = void 0);
    }
  }
  close() {
    0 === this.privNextBufferReadyBytes || this.isClosed || super.writeStreamChunk({
      buffer: this.privNextBufferToWrite.slice(0, this.privNextBufferReadyBytes),
      isEnd: !1,
      timeReceived: this.privNextBufferStartTime
    }), super.close();
  }
}
class Events {
  static setEventSource(eventSource) {
    if (!eventSource) throw new ArgumentNullError("eventSource");
    Events.privInstance = eventSource;
  }
  static get instance() {
    return Events.privInstance;
  }
}
Events.privInstance = new EventSource, function (AudioFormatTag) {
  AudioFormatTag[AudioFormatTag.PCM = 1] = "PCM", AudioFormatTag[AudioFormatTag.MuLaw = 2] = "MuLaw",
    AudioFormatTag[AudioFormatTag.Siren = 3] = "Siren", AudioFormatTag[AudioFormatTag.MP3 = 4] = "MP3",
    AudioFormatTag[AudioFormatTag.SILKSkype = 5] = "SILKSkype", AudioFormatTag[AudioFormatTag.OGG_OPUS = 6] = "OGG_OPUS",
    AudioFormatTag[AudioFormatTag.WEBM_OPUS = 7] = "WEBM_OPUS", AudioFormatTag[AudioFormatTag.ALaw = 8] = "ALaw",
    AudioFormatTag[AudioFormatTag.FLAC = 9] = "FLAC", AudioFormatTag[AudioFormatTag.OPUS = 10] = "OPUS";
}(AudioFormatTag || (AudioFormatTag = {}));
class AudioStreamFormat {
  static getDefaultInputFormat() {
    return AudioStreamFormatImpl.getDefaultInputFormat();
  }
  static getWaveFormat(samplesPerSecond, bitsPerSample, channels, format) {
    return new AudioStreamFormatImpl(samplesPerSecond, bitsPerSample, channels, format);
  }
  static getWaveFormatPCM(samplesPerSecond, bitsPerSample, channels) {
    return new AudioStreamFormatImpl(samplesPerSecond, bitsPerSample, channels);
  }
}
class AudioStreamFormatImpl extends AudioStreamFormat {
  constructor(samplesPerSec = 16e3, bitsPerSample = 16, channels = 1, format = AudioFormatTag.PCM) {
    super();
    let isWavFormat = !0;
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
        isWavFormat = !1;
    }
    if (this.bitsPerSample = bitsPerSample, this.samplesPerSec = samplesPerSec, this.channels = channels,
      this.avgBytesPerSec = this.samplesPerSec * this.channels * (this.bitsPerSample / 8),
      this.blockAlign = this.channels * Math.max(this.bitsPerSample, 8), isWavFormat) {
      this.privHeader = new ArrayBuffer(44);
      const view = new DataView(this.privHeader);
      this.setString(view, 0, "RIFF"), view.setUint32(4, 0, !0), this.setString(view, 8, "WAVEfmt "),
        view.setUint32(16, 16, !0), view.setUint16(20, this.formatTag, !0), view.setUint16(22, this.channels, !0),
        view.setUint32(24, this.samplesPerSec, !0), view.setUint32(28, this.avgBytesPerSec, !0),
        view.setUint16(32, this.channels * (this.bitsPerSample / 8), !0), view.setUint16(34, this.bitsPerSample, !0),
        this.setString(view, 36, "data"), view.setUint32(40, 0, !0);
    }
  }
  static getDefaultInputFormat() {
    return new AudioStreamFormatImpl;
  }
  static getAudioContext(sampleRate) {
    const AudioContext = window.AudioContext || window.webkitAudioContext || !1;
    if (AudioContext) return void 0 !== sampleRate && navigator.mediaDevices.getSupportedConstraints().sampleRate ? new AudioContext({
      sampleRate
    }) : new AudioContext;
    throw new Error("Browser does not support Web Audio API (AudioContext is not available).");
  }
  close() { }
  get header() {
    return this.privHeader;
  }
  setString(view, offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }
}
var MicAudioSource_awaiter = function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))((function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      var value;
      result.done ? resolve(result.value) : (value = result.value, value instanceof P ? value : new P((function (resolve) {
        resolve(value);
      }))).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  }));
};
class MicAudioSource {
  constructor(privRecorder, deviceId, audioSourceId, mediaStream) {
    this.privRecorder = privRecorder, this.deviceId = deviceId, this.privStreams = {},
      this.privOutputChunkSize = MicAudioSource.AUDIOFORMAT.avgBytesPerSec / 10, this.privId = audioSourceId || createNoDashGuid(),
      this.privEvents = new EventSource, this.privMediaStream = mediaStream || null, this.privIsClosing = !1;
  }
  get format() {
    return Promise.resolve(MicAudioSource.AUDIOFORMAT);
  }
  get blob() {
    return Promise.reject("Not implemented for Mic input");
  }
  turnOn() {
    if (this.privInitializeDeferral) return this.privInitializeDeferral.promise;
    this.privInitializeDeferral = new Deferred;
    try {
      this.createAudioContext();
    } catch (error) {
      if (error instanceof Error) {
        const typedError = error;
        this.privInitializeDeferral.reject(typedError.name + ": " + typedError.message);
      } else this.privInitializeDeferral.reject(error);
      return this.privInitializeDeferral.promise;
    }
    const nav = window.navigator;
    let getUserMedia = nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia || nav.msGetUserMedia;
    if (nav.mediaDevices && (getUserMedia = (constraints, successCallback, errorCallback) => {
      nav.mediaDevices.getUserMedia(constraints).then(successCallback).catch(errorCallback);
    }), getUserMedia) {
      const next = () => {
        this.onEvent(new AudioSourceInitializingEvent(this.privId)), this.privMediaStream && this.privMediaStream.active ? (this.onEvent(new AudioSourceReadyEvent(this.privId)),
          this.privInitializeDeferral.resolve()) : getUserMedia({
            audio: !this.deviceId || {
              deviceId: this.deviceId
            },
            video: !1
          }, (mediaStream => {
            this.privMediaStream = mediaStream, this.onEvent(new AudioSourceReadyEvent(this.privId)),
              this.privInitializeDeferral.resolve();
          }), (error => {
            const errorMsg = `Error occurred during microphone initialization: ${error}`;
            this.privInitializeDeferral.reject(errorMsg), this.onEvent(new AudioSourceErrorEvent(this.privId, errorMsg));
          }));
      };
      "suspended" === this.privContext.state ? this.privContext.resume().then(next).catch((reason => {
        this.privInitializeDeferral.reject(`Failed to initialize audio context: ${reason}`);
      })) : next();
    } else {
      const errorMsg = "Browser does not support getUserMedia.";
      this.privInitializeDeferral.reject(errorMsg), this.onEvent(new AudioSourceErrorEvent(errorMsg, ""));
    }
    return this.privInitializeDeferral.promise;
  }
  id() {
    return this.privId;
  }
  attach(audioNodeId) {
    return this.onEvent(new AudioStreamNodeAttachingEvent(this.privId, audioNodeId)),
      this.listen(audioNodeId).then((stream => (this.onEvent(new AudioStreamNodeAttachedEvent(this.privId, audioNodeId)),
      {
        detach: () => MicAudioSource_awaiter(this, void 0, void 0, (function* () {
          return stream.readEnded(), delete this.privStreams[audioNodeId], this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId)),
            this.turnOff();
        })),
        id: () => audioNodeId,
        read: () => stream.read()
      })));
  }
  detach(audioNodeId) {
    audioNodeId && this.privStreams[audioNodeId] && (this.privStreams[audioNodeId].close(),
      delete this.privStreams[audioNodeId], this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId)));
  }
  turnOff() {
    return MicAudioSource_awaiter(this, void 0, void 0, (function* () {
      for (const streamId in this.privStreams) if (streamId) {
        const stream = this.privStreams[streamId];
        stream && stream.close();
      }
      this.onEvent(new AudioSourceOffEvent(this.privId)), this.privInitializeDeferral && (yield this.privInitializeDeferral,
        this.privInitializeDeferral = null), yield this.destroyAudioContext();
    }));
  }
  get events() {
    return this.privEvents;
  }
  get deviceInfo() {
    return this.getMicrophoneLabel().then((label => ({
      bitspersample: MicAudioSource.AUDIOFORMAT.bitsPerSample,
      channelcount: MicAudioSource.AUDIOFORMAT.channels,
      connectivity: connectivity.Unknown,
      manufacturer: "Speech SDK",
      model: label,
      samplerate: MicAudioSource.AUDIOFORMAT.samplesPerSec,
      type: type.Microphones
    })));
  }
  setProperty(name, value) {
    if ("MICROPHONE-WorkletSourceUrl" !== name) throw new Error("Property '" + name + "' is not supported on Microphone.");
    this.privRecorder.setWorkletUrl(value);
  }
  getMicrophoneLabel() {
    if (void 0 !== this.privMicrophoneLabel) return Promise.resolve(this.privMicrophoneLabel);
    if (void 0 === this.privMediaStream || !this.privMediaStream.active) return Promise.resolve("microphone");
    this.privMicrophoneLabel = "microphone";
    const microphoneDeviceId = this.privMediaStream.getTracks()[0].getSettings().deviceId;
    if (void 0 === microphoneDeviceId) return Promise.resolve(this.privMicrophoneLabel);
    const deferred = new Deferred;
    return navigator.mediaDevices.enumerateDevices().then((devices => {
      for (const device of devices) if (device.deviceId === microphoneDeviceId) {
        this.privMicrophoneLabel = device.label;
        break;
      }
      deferred.resolve(this.privMicrophoneLabel);
    }), (() => deferred.resolve(this.privMicrophoneLabel))), deferred.promise;
  }
  listen(audioNodeId) {
    return MicAudioSource_awaiter(this, void 0, void 0, (function* () {
      yield this.turnOn();
      const stream = new ChunkedArrayBufferStream(this.privOutputChunkSize, audioNodeId);
      this.privStreams[audioNodeId] = stream;
      try {
        this.privRecorder.record(this.privContext, this.privMediaStream, stream);
      } catch (error) {
        throw this.onEvent(new AudioStreamNodeErrorEvent(this.privId, audioNodeId, error)),
        error;
      }
      return stream;
    }));
  }
  onEvent(event) {
    this.privEvents.onEvent(event), Events.instance.onEvent(event);
  }
  createAudioContext() {
    this.privContext || (this.privContext = AudioStreamFormatImpl.getAudioContext(MicAudioSource.AUDIOFORMAT.samplesPerSec));
  }
  destroyAudioContext() {
    return MicAudioSource_awaiter(this, void 0, void 0, (function* () {
      if (!this.privContext) return;
      this.privRecorder.releaseMediaResources(this.privContext);
      let hasClose = !1;
      "close" in this.privContext && (hasClose = !0), hasClose ? this.privIsClosing || (this.privIsClosing = !0,
        yield this.privContext.close(), this.privContext = null, this.privIsClosing = !1) : null !== this.privContext && "running" === this.privContext.state && (yield this.privContext.suspend());
    }));
  }
}
MicAudioSource.AUDIOFORMAT = AudioStreamFormat.getDefaultInputFormat();
var FileAudioSource_awaiter = function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))((function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      var value;
      result.done ? resolve(result.value) : (value = result.value, value instanceof P ? value : new P((function (resolve) {
        resolve(value);
      }))).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  }));
};
class FileAudioSource {
  constructor(file, filename, audioSourceId) {
    this.privStreams = {}, this.privHeaderEnd = 44, this.privId = audioSourceId || createNoDashGuid(),
      this.privEvents = new EventSource, this.privSource = file, "undefined" != typeof window && "undefined" != typeof Blob && this.privSource instanceof Blob ? this.privFilename = file.name : this.privFilename = filename || "unknown.wav",
      this.privAudioFormatPromise = this.readHeader();
  }
  get format() {
    return this.privAudioFormatPromise;
  }
  get blob() {
    return Promise.resolve(this.privSource);
  }
  turnOn() {
    if (this.privFilename.lastIndexOf(".wav") !== this.privFilename.length - 4) {
      const errorMsg = this.privFilename + " is not supported. Only WAVE files are allowed at the moment.";
      return this.onEvent(new AudioSourceErrorEvent(errorMsg, "")), Promise.reject(errorMsg);
    }
    this.onEvent(new AudioSourceInitializingEvent(this.privId)), this.onEvent(new AudioSourceReadyEvent(this.privId));
  }
  id() {
    return this.privId;
  }
  attach(audioNodeId) {
    return FileAudioSource_awaiter(this, void 0, void 0, (function* () {
      this.onEvent(new AudioStreamNodeAttachingEvent(this.privId, audioNodeId));
      const stream = yield this.upload(audioNodeId);
      return this.onEvent(new AudioStreamNodeAttachedEvent(this.privId, audioNodeId)),
        Promise.resolve({
          detach: () => FileAudioSource_awaiter(this, void 0, void 0, (function* () {
            stream.readEnded(), delete this.privStreams[audioNodeId], this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId)),
              yield this.turnOff();
          })),
          id: () => audioNodeId,
          read: () => stream.read()
        });
    }));
  }
  detach(audioNodeId) {
    audioNodeId && this.privStreams[audioNodeId] && (this.privStreams[audioNodeId].close(),
      delete this.privStreams[audioNodeId], this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId)));
  }
  turnOff() {
    for (const streamId in this.privStreams) if (streamId) {
      const stream = this.privStreams[streamId];
      stream && !stream.isClosed && stream.close();
    }
    return this.onEvent(new AudioSourceOffEvent(this.privId)), Promise.resolve();
  }
  get events() {
    return this.privEvents;
  }
  get deviceInfo() {
    return this.privAudioFormatPromise.then((result => Promise.resolve({
      bitspersample: result.bitsPerSample,
      channelcount: result.channels,
      connectivity: connectivity.Unknown,
      manufacturer: "Speech SDK",
      model: "File",
      samplerate: result.samplesPerSec,
      type: type.File
    })));
  }
  readHeader() {
    const header = this.privSource.slice(0, 512), headerResult = new Deferred, processHeader = header => {
      const view = new DataView(header), getWord = index => String.fromCharCode(view.getUint8(index), view.getUint8(index + 1), view.getUint8(index + 2), view.getUint8(index + 3));
      if ("RIFF" !== getWord(0)) return void headerResult.reject("Invalid WAV header in file, RIFF was not found");
      if ("WAVE" !== getWord(8) || "fmt " !== getWord(12)) return void headerResult.reject("Invalid WAV header in file, WAVEfmt was not found");
      const formatSize = view.getInt32(16, !0), channelCount = view.getUint16(22, !0), sampleRate = view.getUint32(24, !0), bitsPerSample = view.getUint16(34, !0);
      let pos = 36 + Math.max(formatSize - 16, 0);
      for (; "data" !== getWord(pos); pos += 2) if (pos > 504) return void headerResult.reject("Invalid WAV header in file, data block was not found");
      this.privHeaderEnd = pos + 8, headerResult.resolve(AudioStreamFormat.getWaveFormatPCM(sampleRate, bitsPerSample, channelCount));
    };
    if ("undefined" != typeof window && "undefined" != typeof Blob && header instanceof Blob) {
      const reader = new FileReader;
      reader.onload = event => {
        const header = event.target.result;
        processHeader(header);
      }, reader.readAsArrayBuffer(header);
    } else {
      const h = header;
      processHeader(h.buffer.slice(h.byteOffset, h.byteOffset + h.byteLength));
    }
    return headerResult.promise;
  }
  upload(audioNodeId) {
    return FileAudioSource_awaiter(this, void 0, void 0, (function* () {
      const onerror = error => {
        const errorMsg = `Error occurred while processing '${this.privFilename}'. ${error}`;
        throw this.onEvent(new AudioStreamNodeErrorEvent(this.privId, audioNodeId, errorMsg)),
        new Error(errorMsg);
      };
      try {
        yield this.turnOn();
        const format = yield this.privAudioFormatPromise, stream = new ChunkedArrayBufferStream(format.avgBytesPerSec / 10, audioNodeId);
        this.privStreams[audioNodeId] = stream;
        const chunk = this.privSource.slice(this.privHeaderEnd), processFile = buff => {
          stream.isClosed || (stream.writeStreamChunk({
            buffer: buff,
            isEnd: !1,
            timeReceived: Date.now()
          }), stream.close());
        };
        if ("undefined" != typeof window && "undefined" != typeof Blob && chunk instanceof Blob) {
          const reader = new FileReader;
          reader.onerror = ev => onerror(ev.toString()), reader.onload = event => {
            const fileBuffer = event.target.result;
            processFile(fileBuffer);
          }, reader.readAsArrayBuffer(chunk);
        } else {
          const c = chunk;
          processFile(c.buffer.slice(c.byteOffset, c.byteOffset + c.byteLength));
        }
        return stream;
      } catch (e) {
        onerror(e);
      }
    }));
  }
  onEvent(event) {
    this.privEvents.onEvent(event), Events.instance.onEvent(event);
  }
}
class PullAudioInputStreamCallback { }
var MessageType, ConnectionState, CancellationReason, CancellationErrorCode, ResultReason, AudioInputStream_awaiter = function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))((function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      var value;
      result.done ? resolve(result.value) : (value = result.value, value instanceof P ? value : new P((function (resolve) {
        resolve(value);
      }))).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  }));
};
class AudioInputStream {
  constructor() { }
  static createPushStream(format) {
    return PushAudioInputStream.create(format);
  }
  static createPullStream(callback, format) {
    return PullAudioInputStream.create(callback, format);
  }
}
class PushAudioInputStream extends AudioInputStream {
  static create(format) {
    return new PushAudioInputStreamImpl(format);
  }
}
class PushAudioInputStreamImpl extends PushAudioInputStream {
  constructor(format) {
    super(), this.privFormat = void 0 === format ? AudioStreamFormatImpl.getDefaultInputFormat() : format,
      this.privEvents = new EventSource, this.privId = createNoDashGuid(), this.privStream = new ChunkedArrayBufferStream(this.privFormat.avgBytesPerSec / 10);
  }
  get format() {
    return Promise.resolve(this.privFormat);
  }
  write(dataBuffer) {
    this.privStream.writeStreamChunk({
      buffer: dataBuffer,
      isEnd: !1,
      timeReceived: Date.now()
    });
  }
  close() {
    this.privStream.close();
  }
  id() {
    return this.privId;
  }
  get blob() {
    return this.attach("id").then((audioNode => {
      const data = [];
      let bufferData = Buffer.from("");
      const readCycle = () => audioNode.read().then((audioStreamChunk => !audioStreamChunk || audioStreamChunk.isEnd ? "undefined" != typeof XMLHttpRequest && "undefined" != typeof Blob ? Promise.resolve(new Blob(data)) : Promise.resolve(Buffer.from(bufferData)) : ("undefined" != typeof Blob ? data.push(audioStreamChunk.buffer) : bufferData = Buffer.concat([bufferData, this.toBuffer(audioStreamChunk.buffer)]),
        readCycle())));
      return readCycle();
    }));
  }
  turnOn() {
    this.onEvent(new AudioSourceInitializingEvent(this.privId)), this.onEvent(new AudioSourceReadyEvent(this.privId));
  }
  attach(audioNodeId) {
    return AudioInputStream_awaiter(this, void 0, void 0, (function* () {
      this.onEvent(new AudioStreamNodeAttachingEvent(this.privId, audioNodeId)), yield this.turnOn();
      const stream = this.privStream;
      return this.onEvent(new AudioStreamNodeAttachedEvent(this.privId, audioNodeId)),
      {
        detach: () => AudioInputStream_awaiter(this, void 0, void 0, (function* () {
          return this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId)),
            this.turnOff();
        })),
        id: () => audioNodeId,
        read: () => stream.read()
      };
    }));
  }
  detach(audioNodeId) {
    this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
  }
  turnOff() { }
  get events() {
    return this.privEvents;
  }
  get deviceInfo() {
    return Promise.resolve({
      bitspersample: this.privFormat.bitsPerSample,
      channelcount: this.privFormat.channels,
      connectivity: connectivity.Unknown,
      manufacturer: "Speech SDK",
      model: "PushStream",
      samplerate: this.privFormat.samplesPerSec,
      type: type.Stream
    });
  }
  onEvent(event) {
    this.privEvents.onEvent(event), Events.instance.onEvent(event);
  }
  toBuffer(arrayBuffer) {
    const buf = Buffer.alloc(arrayBuffer.byteLength), view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buf.length; ++i) buf[i] = view[i];
    return buf;
  }
}
class PullAudioInputStream extends AudioInputStream {
  constructor() {
    super();
  }
  static create(callback, format) {
    return new PullAudioInputStreamImpl(callback, format);
  }
}
class PullAudioInputStreamImpl extends PullAudioInputStream {
  constructor(callback, format) {
    super(), this.privFormat = void 0 === format ? AudioStreamFormat.getDefaultInputFormat() : format,
      this.privEvents = new EventSource, this.privId = createNoDashGuid(), this.privCallback = callback,
      this.privIsClosed = !1, this.privBufferSize = this.privFormat.avgBytesPerSec / 10;
  }
  get format() {
    return Promise.resolve(this.privFormat);
  }
  close() {
    this.privIsClosed = !0, this.privCallback.close();
  }
  id() {
    return this.privId;
  }
  get blob() {
    return Promise.reject("Not implemented");
  }
  turnOn() {
    this.onEvent(new AudioSourceInitializingEvent(this.privId)), this.onEvent(new AudioSourceReadyEvent(this.privId));
  }
  attach(audioNodeId) {
    return AudioInputStream_awaiter(this, void 0, void 0, (function* () {
      return this.onEvent(new AudioStreamNodeAttachingEvent(this.privId, audioNodeId)),
        yield this.turnOn(), this.onEvent(new AudioStreamNodeAttachedEvent(this.privId, audioNodeId)),
      {
        detach: () => (this.privCallback.close(), this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId)),
          this.turnOff()),
        id: () => audioNodeId,
        read: () => {
          let transmitBuff, totalBytes = 0;
          for (; totalBytes < this.privBufferSize;) {
            const readBuff = new ArrayBuffer(this.privBufferSize - totalBytes), pulledBytes = this.privCallback.read(readBuff);
            if (void 0 === transmitBuff) transmitBuff = readBuff; else {
              new Int8Array(transmitBuff).set(new Int8Array(readBuff), totalBytes);
            }
            if (0 === pulledBytes) break;
            totalBytes += pulledBytes;
          }
          return Promise.resolve({
            buffer: transmitBuff.slice(0, totalBytes),
            isEnd: this.privIsClosed || 0 === totalBytes,
            timeReceived: Date.now()
          });
        }
      };
    }));
  }
  detach(audioNodeId) {
    this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
  }
  turnOff() { }
  get events() {
    return this.privEvents;
  }
  get deviceInfo() {
    return Promise.resolve({
      bitspersample: this.privFormat.bitsPerSample,
      channelcount: this.privFormat.channels,
      connectivity: connectivity.Unknown,
      manufacturer: "Speech SDK",
      model: "PullStream",
      samplerate: this.privFormat.samplesPerSec,
      type: type.Stream
    });
  }
  onEvent(event) {
    this.privEvents.onEvent(event), Events.instance.onEvent(event);
  }
}
!function (MessageType) {
  MessageType[MessageType.Text = 0] = "Text", MessageType[MessageType.Binary = 1] = "Binary";
}(MessageType || (MessageType = {}));
class ConnectionMessage {
  constructor(messageType, body, headers, id) {
    if (this.privBody = null, messageType === MessageType.Text && body && "string" != typeof body) throw new InvalidOperationError("Payload must be a string");
    if (messageType === MessageType.Binary && body && !(body instanceof ArrayBuffer)) throw new InvalidOperationError("Payload must be ArrayBuffer");
    switch (this.privMessageType = messageType, this.privBody = body, this.privHeaders = headers || {},
    this.privId = id || createNoDashGuid(), this.messageType) {
      case MessageType.Binary:
        this.privSize = null !== this.binaryBody ? this.binaryBody.byteLength : 0;
        break;

      case MessageType.Text:
        this.privSize = this.textBody.length;
    }
  }
  get messageType() {
    return this.privMessageType;
  }
  get headers() {
    return this.privHeaders;
  }
  get body() {
    return this.privBody;
  }
  get textBody() {
    if (this.privMessageType === MessageType.Binary) throw new InvalidOperationError("Not supported for binary message");
    return this.privBody;
  }
  get binaryBody() {
    if (this.privMessageType === MessageType.Text) throw new InvalidOperationError("Not supported for text message");
    return this.privBody;
  }
  get id() {
    return this.privId;
  }
}
class ServiceEvent extends PlatformEvent {
  constructor(eventName, jsonstring, eventType = PlatformEvent_EventType.Info) {
    super(eventName, eventType), this.privJsonResult = jsonstring;
  }
  get jsonString() {
    return this.privJsonResult;
  }
}
class ConnectionEvent extends PlatformEvent {
  constructor(eventName, connectionId, eventType = PlatformEvent_EventType.Info) {
    super(eventName, eventType), this.privConnectionId = connectionId;
  }
  get connectionId() {
    return this.privConnectionId;
  }
}
class ConnectionStartEvent extends ConnectionEvent {
  constructor(connectionId, uri, headers) {
    super("ConnectionStartEvent", connectionId), this.privUri = uri, this.privHeaders = headers;
  }
  get uri() {
    return this.privUri;
  }
  get headers() {
    return this.privHeaders;
  }
}
class ConnectionEstablishedEvent extends ConnectionEvent {
  constructor(connectionId) {
    super("ConnectionEstablishedEvent", connectionId);
  }
}
class ConnectionClosedEvent extends ConnectionEvent {
  constructor(connectionId, statusCode, reason) {
    super("ConnectionClosedEvent", connectionId, PlatformEvent_EventType.Debug), this.privReason = reason,
      this.privStatusCode = statusCode;
  }
  get reason() {
    return this.privReason;
  }
  get statusCode() {
    return this.privStatusCode;
  }
}
class ConnectionErrorEvent extends ConnectionEvent {
  constructor(connectionId, message, type) {
    super("ConnectionErrorEvent", connectionId, PlatformEvent_EventType.Debug), this.privMessage = message,
      this.privType = type;
  }
  get message() {
    return this.privMessage;
  }
  get type() {
    return this.privType;
  }
}
class ConnectionEstablishErrorEvent extends ConnectionEvent {
  constructor(connectionId, statuscode, reason) {
    super("ConnectionEstablishErrorEvent", connectionId, PlatformEvent_EventType.Error),
      this.privStatusCode = statuscode, this.privReason = reason;
  }
  get reason() {
    return this.privReason;
  }
  get statusCode() {
    return this.privStatusCode;
  }
}
class ConnectionMessageReceivedEvent extends ConnectionEvent {
  constructor(connectionId, networkReceivedTimeISO, message) {
    super("ConnectionMessageReceivedEvent", connectionId), this.privNetworkReceivedTime = networkReceivedTimeISO,
      this.privMessage = message;
  }
  get networkReceivedTime() {
    return this.privNetworkReceivedTime;
  }
  get message() {
    return this.privMessage;
  }
}
class ConnectionMessageSentEvent extends ConnectionEvent {
  constructor(connectionId, networkSentTimeISO, message) {
    super("ConnectionMessageSentEvent", connectionId), this.privNetworkSentTime = networkSentTimeISO,
      this.privMessage = message;
  }
  get networkSentTime() {
    return this.privNetworkSentTime;
  }
  get message() {
    return this.privMessage;
  }
}
!function (ConnectionState) {
  ConnectionState[ConnectionState.None = 0] = "None", ConnectionState[ConnectionState.Connected = 1] = "Connected",
    ConnectionState[ConnectionState.Connecting = 2] = "Connecting", ConnectionState[ConnectionState.Disconnected = 3] = "Disconnected";
}(ConnectionState || (ConnectionState = {})), function (CancellationReason) {
  CancellationReason[CancellationReason.Error = 0] = "Error", CancellationReason[CancellationReason.EndOfStream = 1] = "EndOfStream";
}(CancellationReason || (CancellationReason = {})), function (CancellationErrorCode) {
  CancellationErrorCode[CancellationErrorCode.NoError = 0] = "NoError", CancellationErrorCode[CancellationErrorCode.AuthenticationFailure = 1] = "AuthenticationFailure",
    CancellationErrorCode[CancellationErrorCode.BadRequestParameters = 2] = "BadRequestParameters",
    CancellationErrorCode[CancellationErrorCode.TooManyRequests = 3] = "TooManyRequests",
    CancellationErrorCode[CancellationErrorCode.ConnectionFailure = 4] = "ConnectionFailure",
    CancellationErrorCode[CancellationErrorCode.ServiceTimeout = 5] = "ServiceTimeout",
    CancellationErrorCode[CancellationErrorCode.ServiceError = 6] = "ServiceError",
    CancellationErrorCode[CancellationErrorCode.RuntimeError = 7] = "RuntimeError",
    CancellationErrorCode[CancellationErrorCode.Forbidden = 8] = "Forbidden";
}(CancellationErrorCode || (CancellationErrorCode = {}));
class SpeechSynthesisEventArgs {
  constructor(result) {
    this.privResult = result;
  }
  get result() {
    return this.privResult;
  }
}
class SynthesisResult {
  constructor(resultId, reason, errorDetails, properties) {
    this.privResultId = resultId, this.privReason = reason, this.privErrorDetails = errorDetails,
      this.privProperties = properties;
  }
  get resultId() {
    return this.privResultId;
  }
  get reason() {
    return this.privReason;
  }
  get errorDetails() {
    return this.privErrorDetails;
  }
  get properties() {
    return this.privProperties;
  }
}
class SpeechSynthesisResult extends SynthesisResult {
  constructor(resultId, reason, audioData, errorDetails, properties, audioDuration) {
    super(resultId, reason, errorDetails, properties), this.privAudioData = audioData,
      this.privAudioDuration = audioDuration;
  }
  get audioData() {
    return this.privAudioData;
  }
  get audioDuration() {
    return this.privAudioDuration;
  }
}