import { IStreamChunk } from "../typings";
import { Stream } from "./Stream";

// 分块ArrayBuffer流类
export class ChunkedArrayBufferStream extends Stream<ArrayBuffer> {
    private privTargetChunkSize: number;
    private privNextBufferToWrite?: ArrayBuffer;
    private privNextBufferStartTime?: number;
    private privNextBufferReadyBytes: number = 0;
  
    constructor(targetChunkSize: number, streamId?: string) {
      super(streamId);
      this.privTargetChunkSize = targetChunkSize;
    }
  
    // 写入流块
    public writeStreamChunk(chunk: IStreamChunk<ArrayBuffer>): void {
      if (chunk.isEnd || (this.privNextBufferReadyBytes === 0 && chunk.buffer?.byteLength === this.privTargetChunkSize)) {
        super.writeStreamChunk(chunk);
        return;
      }
  
      let bytesCopiedFromBuffer = 0;
      while (bytesCopiedFromBuffer < chunk.buffer!.byteLength) {
        if (this.privNextBufferToWrite === undefined) {
          this.privNextBufferToWrite = new ArrayBuffer(this.privTargetChunkSize);
          this.privNextBufferStartTime = chunk.timeReceived;
        }
  
        const bytesToCopy = Math.min(
          chunk.buffer!.byteLength - bytesCopiedFromBuffer,
          this.privTargetChunkSize - this.privNextBufferReadyBytes
        );
  
        const targetView = new Uint8Array(this.privNextBufferToWrite);
        const sourceView = new Uint8Array(chunk.buffer!.slice(bytesCopiedFromBuffer, bytesToCopy + bytesCopiedFromBuffer));
        targetView.set(sourceView, this.privNextBufferReadyBytes);
  
        this.privNextBufferReadyBytes += bytesToCopy;
        bytesCopiedFromBuffer += bytesToCopy;
  
        if (this.privNextBufferReadyBytes === this.privTargetChunkSize) {
          super.writeStreamChunk({
            buffer: this.privNextBufferToWrite,
            isEnd: false,
            timeReceived: this.privNextBufferStartTime!
          });
          this.privNextBufferReadyBytes = 0;
          this.privNextBufferToWrite = undefined;
        }
      }
    }
  
    // 关闭流
    public close(): void {
      if (this.privNextBufferReadyBytes !== 0 && !this.isClosed) {
        super.writeStreamChunk({
          buffer: this.privNextBufferToWrite!.slice(0, this.privNextBufferReadyBytes),
          isEnd: false,
          timeReceived: this.privNextBufferStartTime!
        });
      }
      super.close();
    }
  }
  