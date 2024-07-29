// 事件源接口
export interface IEventSource {
  onEvent(event: any): void;
}

// 事件类
export class Events {
  private static privInstance: IEventSource;

  public static setEventSource(eventSource: IEventSource): void {
      if (!eventSource) {
          throw new Error("eventSource is null");
      }
      Events.privInstance = eventSource;
  }

  public static get instance(): IEventSource {
      return Events.privInstance;
  }
}

// 初始化默认事件源
// Events.privInstance = new EventSource();