import { createNanoEvents, Emitter } from 'nanoevents';

interface EndpointRuntime {
  onMessage: (channel: string, callback: (msg: any) => void) => void;
  sendMessage: (channel: string, data: any, endpoint: string) => void;
}

interface StreamInfo {
  streamId: string;
  endpoint: string;
}

interface StreamTransferMessage {
  streamId: string;
  streamTransfer: any;
  action: 'transfer' | 'close';
}

class Stream {
  private static initDone: boolean = false;
  private static openStreams: Map<string, Stream> = new Map();

  private endpointRuntime: EndpointRuntime;
  private streamInfo: StreamInfo;
  private emitter: Emitter;
  private isClosed: boolean = false;

  constructor(endpointRuntime: EndpointRuntime, streamInfo: StreamInfo) {
    this.endpointRuntime = endpointRuntime;
    this.streamInfo = streamInfo;
    this.emitter = createNanoEvents();

    if (!Stream.initDone) {
      endpointRuntime.onMessage("__crx_bridge_stream_transfer__", (msg: any) => {
        const { streamId, streamTransfer, action } = msg.data;
        const stream = Stream.openStreams.get(streamId);
        if (stream && !stream.isClosed) {
          if (action === "transfer") {
            stream.emitter.emit("message", streamTransfer);
          } else if (action === "close") {
            Stream.openStreams.delete(streamId);
            stream.handleStreamClose();
          }
        }
      });
      Stream.initDone = true;
    }

    Stream.openStreams.set(this.streamInfo.streamId, this);
  }

  get info(): StreamInfo {
    return this.streamInfo;
  }

  send(msg: any): void {
    if (this.isClosed) {
      throw new Error("Attempting to send a message over closed stream. Use stream.onClose(<callback>) to keep an eye on stream status");
    }
    this.endpointRuntime.sendMessage("__crx_bridge_stream_transfer__", {
      streamId: this.streamInfo.streamId,
      streamTransfer: msg,
      action: "transfer"
    }, this.streamInfo.endpoint);
  }

  close(msg?: any): void {
    if (msg) {
      this.send(msg);
    }
    this.handleStreamClose();
    this.endpointRuntime.sendMessage("__crx_bridge_stream_transfer__", {
      streamId: this.streamInfo.streamId,
      streamTransfer: null,
      action: "close"
    }, this.streamInfo.endpoint);
  }

  onMessage(callback: (msg: any) => void): { dispose: () => void; close: () => void; } {
    return this.getDisposable("message", callback);
  }

  onClose(callback: (closed: boolean) => void): { dispose: () => void; close: () => void; } {
    return this.getDisposable("closed", callback);
  }

  private handleStreamClose = (): void => {
    if (!this.isClosed) {
      this.isClosed = true;
      this.emitter.emit("closed", true);
      (this.emitter as any).events = {};
    }
  };

  private getDisposable(event: string, callback: (...args: any) => void): { dispose: () => void; close: () => void; } {
    const off = this.emitter.on(event, callback);
    return {
      dispose: off,
      close: off
    };
  }
}

export default Stream;
