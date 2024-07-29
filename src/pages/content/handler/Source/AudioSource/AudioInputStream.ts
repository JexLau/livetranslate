import { createNoDashGuid, EventSource, Events } from "../../Util";
import { AudioStreamFormat, AudioStreamFormatImpl } from "./AudioStreamFormatImpl";
import { ChunkedArrayBufferStream } from "../ChunkedArrayBufferStream";
import { AudioSourceInitializingEvent, AudioSourceReadyEvent, AudioSourceEvent } from "./AudioSourceEvent";
import { AudioStreamNodeAttachingEvent, AudioStreamNodeAttachedEvent, AudioStreamNodeDetachedEvent } from "./AudioStreamNodeEvent";
import { connectivity, IAudioSourceDeviceInfo, IAudioStreamNode, type } from "../../typings";


// 拉取音频输入流回调接口
interface PullAudioInputStreamCallback {
    read(buffer: ArrayBuffer): number;
    close(): void;
}

// 音频输入流基类
abstract class AudioInputStream {
    // 创建推送流
    public static createPushStream(format?: AudioStreamFormatImpl): PushAudioInputStream {
        return PushAudioInputStream.create(format);
    }

    // 创建拉取流
    public static createPullStream(callback: PullAudioInputStreamCallback, format?: AudioStreamFormatImpl): PullAudioInputStream {
        return PullAudioInputStream.create(callback, format);
    }
}

// 推送音频输入流类
class PushAudioInputStream extends AudioInputStream {
    public static create(format?: AudioStreamFormatImpl): PushAudioInputStream {
        return new PushAudioInputStreamImpl(format);
    }
}

// 推送音频输入流实现类
class PushAudioInputStreamImpl extends PushAudioInputStream {
    private privFormat: AudioStreamFormatImpl;
    private privEvents: EventSource;
    private privId: string;
    private privStream: ChunkedArrayBufferStream;

    constructor(format?: AudioStreamFormatImpl) {
        super();
        this.privFormat = format === undefined ? AudioStreamFormatImpl.getDefaultInputFormat() : format;
        this.privEvents = new EventSource();
        this.privId = createNoDashGuid();
        this.privStream = new ChunkedArrayBufferStream(this.privFormat.avgBytesPerSec / 10);
    }

    public get format(): Promise<AudioStreamFormat> {
        return Promise.resolve(this.privFormat);
    }

    public write(dataBuffer: ArrayBuffer): void {
        this.privStream.writeStreamChunk({
            buffer: dataBuffer,
            isEnd: false,
            timeReceived: Date.now()
        });
    }

    public close(): void {
        this.privStream.close();
    }

    public id(): string {
        return this.privId;
    }

    public get blob(): Promise<Blob | Buffer> {
        return this.attach("id").then((audioNode) => {
            const data: ArrayBuffer[] = [];
            let bufferData = Buffer.from("");
            const readCycle = (): Promise<Blob | Buffer> => audioNode.read().then((audioStreamChunk) => {
                if (!audioStreamChunk || audioStreamChunk.isEnd) {
                    if (typeof XMLHttpRequest !== "undefined" && typeof Blob !== "undefined") {
                        return Promise.resolve(new Blob(data));
                    } else {
                        return Promise.resolve(Buffer.from(bufferData));
                    }
                } else {
                    if (typeof Blob !== "undefined") {
                        data.push(audioStreamChunk.buffer!);
                    } else {
                        bufferData = Buffer.concat([bufferData, this.toBuffer(audioStreamChunk.buffer!)]);
                    }
                    return readCycle();
                }
            });
            return readCycle();
        });
    }

    public turnOn(): void {
        this.onEvent(new AudioSourceInitializingEvent(this.privId));
        this.onEvent(new AudioSourceReadyEvent(this.privId));
    }

    public async attach(audioNodeId: string): Promise<IAudioStreamNode> {
        this.onEvent(new AudioStreamNodeAttachingEvent(this.privId, audioNodeId));
        await this.turnOn();
        const stream = this.privStream;
        this.onEvent(new AudioStreamNodeAttachedEvent(this.privId, audioNodeId));
        return {
            detach: async () => {
                this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
                return this.turnOff();
            },
            id: () => audioNodeId,
            read: () => stream.read()
        };
    }

    public detach(audioNodeId: string): void {
        this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
    }

    public turnOff(): void { }

    public get events(): EventSource {
        return this.privEvents;
    }

    public get deviceInfo(): Promise<IAudioSourceDeviceInfo> {
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

    private onEvent(event: AudioSourceEvent): void {
        this.privEvents.onEvent(event);
        Events.instance.onEvent(event);
    }

    private toBuffer(arrayBuffer: ArrayBuffer): Buffer {
        const buf = Buffer.alloc(arrayBuffer.byteLength);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }
}

// 拉取音频输入流类
class PullAudioInputStream extends AudioInputStream {
    public static create(callback: PullAudioInputStreamCallback, format?: AudioStreamFormatImpl): PullAudioInputStream {
        return new PullAudioInputStreamImpl(callback, format);
    }
}

// 拉取音频输入流实现类
class PullAudioInputStreamImpl extends PullAudioInputStream {
    private privFormat: AudioStreamFormatImpl;
    private privEvents: EventSource;
    private privId: string;
    private privCallback: PullAudioInputStreamCallback;
    private privIsClosed: boolean = false;
    private privBufferSize: number;

    constructor(callback: PullAudioInputStreamCallback, format?: AudioStreamFormatImpl) {
        super();
        this.privFormat = format === undefined ? AudioStreamFormat.getDefaultInputFormat() : format;
        this.privEvents = new EventSource();
        this.privId = createNoDashGuid();
        this.privCallback = callback;
        this.privBufferSize = this.privFormat.avgBytesPerSec / 10;
    }

    public get format(): Promise<AudioStreamFormat> {
        return Promise.resolve(this.privFormat);
    }

    public close(): void {
        this.privIsClosed = true;
        this.privCallback.close();
    }

    public id(): string {
        return this.privId;
    }

    public get blob(): Promise<never> {
        return Promise.reject("Not implemented");
    }

    public turnOn(): void {
        this.onEvent(new AudioSourceInitializingEvent(this.privId));
        this.onEvent(new AudioSourceReadyEvent(this.privId));
    }

    public async attach(audioNodeId: string): Promise<IAudioStreamNode> {
        this.onEvent(new AudioStreamNodeAttachingEvent(this.privId, audioNodeId));
        await this.turnOn();
        this.onEvent(new AudioStreamNodeAttachedEvent(this.privId, audioNodeId));
        return {
            detach: () => {
                this.privCallback.close();
                this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
                return this.turnOff();
            },
            id: () => audioNodeId,
            read: () => {
                let transmitBuff: ArrayBuffer | undefined;
                let totalBytes = 0;
                while (totalBytes < this.privBufferSize) {
                    const readBuff = new ArrayBuffer(this.privBufferSize - totalBytes);
                    const pulledBytes = this.privCallback.read(readBuff);
                    if (transmitBuff === undefined) {
                        transmitBuff = readBuff;
                    } else {
                        new Int8Array(transmitBuff).set(new Int8Array(readBuff), totalBytes);
                    }
                    if (pulledBytes === 0) {
                        break;
                    }
                    totalBytes += pulledBytes;
                }
                return Promise.resolve({
                    buffer: transmitBuff!.slice(0, totalBytes),
                    isEnd: this.privIsClosed || totalBytes === 0,
                    timeReceived: Date.now()
                });
            }
        };
    }

    public detach(audioNodeId: string): void {
        this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
    }

    public turnOff(): void { }

    public get events(): EventSource {
        return this.privEvents;
    }

    public get deviceInfo(): Promise<IAudioSourceDeviceInfo> {
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

    private onEvent(event: AudioSourceEvent): void {
        this.privEvents.onEvent(event);
        Events.instance.onEvent(event);
    }
}

// 导出类
export { AudioInputStream, PushAudioInputStream, PullAudioInputStream, PullAudioInputStreamCallback };