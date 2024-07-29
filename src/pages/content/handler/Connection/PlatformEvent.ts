import { PlatformEvent_EventType } from "../typings";
import { createNoDashGuid } from "../Util";

/** 表示一个平台事件,包含事件名称、ID、时间、类型和元数据。 */
export class PlatformEvent {
  private privName: string;
  private privEventId: string;
  private privEventTime: string;
  private privEventType: PlatformEvent_EventType;
  private privMetadata: { [key: string]: string };

  constructor(eventName: string, eventType: PlatformEvent_EventType) {
      this.privName = eventName;
      this.privEventId = createNoDashGuid(); // 假设 createNoDashGuid 函数已在其他地方定义
      this.privEventTime = new Date().toISOString();
      this.privEventType = eventType;
      this.privMetadata = {};
  }

  public get name(): string {
      return this.privName;
  }

  public get eventId(): string {
      return this.privEventId;
  }

  public get eventTime(): string {
      return this.privEventTime;
  }

  public get eventType(): PlatformEvent_EventType {
      return this.privEventType;
  }

  public get metadata(): { [key: string]: string } {
      return this.privMetadata;
  }
}