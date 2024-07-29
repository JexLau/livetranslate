import { MessageType, PlatformEvent_EventType } from "../typings";
import { createNoDashGuid } from "../Util";
import { PlatformEvent } from "./PlatformEvent";

// 连接消息类
export class ConnectionMessage {
  private privMessageType: MessageType;
  private privHeaders: { [key: string]: string };
  private privBody: string | ArrayBuffer | null = null;
  private privId: string;
  private privSize: number;

  constructor(messageType: MessageType, body: string | ArrayBuffer | null, headers?: { [key: string]: string }, id?: string) {
      if (messageType === MessageType.Text && body && typeof body !== "string") {
          throw new Error("Payload must be a string");
      }
      if (messageType === MessageType.Binary && body && !(body instanceof ArrayBuffer)) {
          throw new Error("Payload must be ArrayBuffer");
      }

      this.privMessageType = messageType;
      this.privBody = body;
      this.privHeaders = headers || {};
      this.privId = id || createNoDashGuid();

      switch (this.messageType) {
          case MessageType.Binary:
              this.privSize = this.binaryBody !== null ? this.binaryBody.byteLength : 0;
              break;
          case MessageType.Text:
              this.privSize = this.textBody.length;
              break;
      }
  }

  public get messageType(): MessageType {
      return this.privMessageType;
  }

  public get headers(): { [key: string]: string } {
      return this.privHeaders;
  }

  public get body(): string | ArrayBuffer | null {
      return this.privBody;
  }

  public get textBody(): string {
      if (this.privMessageType === MessageType.Binary) {
          throw new Error("Not supported for binary message");
      }
      return this.privBody as string;
  }

  public get binaryBody(): ArrayBuffer | null {
      if (this.privMessageType === MessageType.Text) {
          throw new Error("Not supported for text message");
      }
      return this.privBody as ArrayBuffer | null;
  }

  public get id(): string {
      return this.privId;
  }
}


// 服务事件类
export class ServiceEvent extends PlatformEvent {
  private privJsonResult: string;

  constructor(eventName: string, jsonstring: string, eventType: PlatformEvent_EventType = PlatformEvent_EventType.Info) {
      super(eventName, eventType);
      this.privJsonResult = jsonstring;
  }

  public get jsonString(): string {
      return this.privJsonResult;
  }
}

// 连接事件基类
export class ConnectionEvent extends PlatformEvent {
  private privConnectionId: string;

  constructor(eventName: string, connectionId: string, eventType: PlatformEvent_EventType = PlatformEvent_EventType.Info) {
      super(eventName, eventType);
      this.privConnectionId = connectionId;
  }

  public get connectionId(): string {
      return this.privConnectionId;
  }
}

// 连接开始事件类
export class ConnectionStartEvent extends ConnectionEvent {
  private privUri: string;
  private privHeaders: { [key: string]: string };

  constructor(connectionId: string, uri: string, headers?: { [key: string]: string }) {
      super("ConnectionStartEvent", connectionId);
      this.privUri = uri;
      this.privHeaders = headers || {};
  }

  public get uri(): string {
      return this.privUri;
  }

  public get headers(): { [key: string]: string } {
      return this.privHeaders;
  }
}

// 连接建立事件类
export class ConnectionEstablishedEvent extends ConnectionEvent {
  constructor(connectionId: string) {
      super("ConnectionEstablishedEvent", connectionId);
  }
}

// 连接关闭事件类
export class ConnectionClosedEvent extends ConnectionEvent {
  private privReason: string;
  private privStatusCode: number;

  constructor(connectionId: string, statusCode: number, reason: string) {
      super("ConnectionClosedEvent", connectionId, PlatformEvent_EventType.Debug);
      this.privReason = reason;
      this.privStatusCode = statusCode;
  }

  public get reason(): string {
      return this.privReason;
  }

  public get statusCode(): number {
      return this.privStatusCode;
  }
}

// 连接错误事件类
export class ConnectionErrorEvent extends ConnectionEvent {
  private privMessage: string;
  private privType: string;

  constructor(connectionId: string, message: string, type: string) {
      super("ConnectionErrorEvent", connectionId, PlatformEvent_EventType.Debug);
      this.privMessage = message;
      this.privType = type;
  }

  public get message(): string {
      return this.privMessage;
  }

  public get type(): string {
      return this.privType;
  }
}

// 连接建立错误事件类
export class ConnectionEstablishErrorEvent extends ConnectionEvent {
  private privStatusCode: number;
  private privReason: string;

  constructor(connectionId: string, statuscode: number, reason: string) {
      super("ConnectionEstablishErrorEvent", connectionId, PlatformEvent_EventType.Error);
      this.privStatusCode = statuscode;
      this.privReason = reason;
  }

  public get reason(): string {
      return this.privReason;
  }

  public get statusCode(): number {
      return this.privStatusCode;
  }
}

// 连接消息接收事件类
export class ConnectionMessageReceivedEvent extends ConnectionEvent {
  private privNetworkReceivedTime: string;
  private privMessage: ConnectionMessage;

  constructor(connectionId: string, networkReceivedTimeISO: string, message: ConnectionMessage) {
      super("ConnectionMessageReceivedEvent", connectionId);
      this.privNetworkReceivedTime = networkReceivedTimeISO;
      this.privMessage = message;
  }

  public get networkReceivedTime(): string {
      return this.privNetworkReceivedTime;
  }

  public get message(): ConnectionMessage {
      return this.privMessage;
  }
}

// 连接消息发送事件类
export class ConnectionMessageSentEvent extends ConnectionEvent {
  private privNetworkSentTime: string;
  private privMessage: ConnectionMessage;

  constructor(connectionId: string, networkSentTimeISO: string, message: ConnectionMessage) {
      super("ConnectionMessageSentEvent", connectionId);
      this.privNetworkSentTime = networkSentTimeISO;
      this.privMessage = message;
  }

  public get networkSentTime(): string {
      return this.privNetworkSentTime;
  }

  public get message(): ConnectionMessage {
      return this.privMessage;
  }
}