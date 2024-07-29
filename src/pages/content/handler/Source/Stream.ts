import { IStreamChunk } from "../typings";
import { createNoDashGuid, Queue } from "../Util";

// 基础流类
export class Stream<T> {
  private privId: string;
  private privReaderQueue: Queue<IStreamChunk<T>>;
  private privIsWriteEnded: boolean = false;
  private privIsReadEnded: boolean = false;

  constructor(streamId?: string) {
    this.privId = streamId || createNoDashGuid();
    this.privReaderQueue = new Queue<IStreamChunk<T>>();
  }

  // 获取流是否已关闭
  public get isClosed(): boolean {
    return this.privIsWriteEnded;
  }

  // 获取流是否已读取结束
  public get isReadEnded(): boolean {
    return this.privIsReadEnded;
  }

  // 获取流ID
  public get id(): string {
    return this.privId;
  }

  // 关闭流
  public close(): void {
    if (!this.privIsWriteEnded) {
      this.writeStreamChunk({
        buffer: null,
        isEnd: true,
        timeReceived: Date.now()
      });
      this.privIsWriteEnded = true;
    }
  }

  // 写入流块
  public writeStreamChunk(streamChunk: IStreamChunk<T>): void {
    this.throwIfClosed();
    if (!this.privReaderQueue.isDisposed()) {
      try {
        this.privReaderQueue.enqueue(streamChunk);
      } catch (e) {
        // 忽略错误
      }
    }
  }

  // 读取流
  public async read(): Promise<IStreamChunk<T>> {
    if (this.privIsReadEnded) {
      throw new Error("Stream read has already finished");
    }

    const streamChunk = await this.privReaderQueue.dequeue();
    if (streamChunk === undefined || streamChunk.isEnd) {
      await this.privReaderQueue.dispose("End of stream reached");
    }
    return streamChunk;
  }

  // 标记读取结束
  public readEnded(): void {
    this.privIsReadEnded = true;
    this.privReaderQueue = new Queue<IStreamChunk<T>>();
  }

  // 检查流是否已关闭
  private throwIfClosed(): void {
    if (this.privIsWriteEnded) {
      throw new Error("Stream closed");
    }
  }
}

