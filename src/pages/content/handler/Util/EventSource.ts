import { ObjectDisposedError } from "../Errors";
import { createNoDashGuid } from "./createNoDashGuid";

// 事件监听器接口
interface EventListener {
    onEvent(event: any): void;
}

// 事件源类
export class EventSource {
    private privEventListeners: { [id: string]: (event: any) => void };
    private privIsDisposed: boolean;
    private privConsoleListener?: { detach: () => Promise<void> };
    private privMetadata?: { [key: string]: string };

    /**
     * 构造函数
     * @param metadata 元数据对象
     */
    constructor(metadata?: { [key: string]: string }) {
        this.privEventListeners = {};
        this.privIsDisposed = false;
        this.privMetadata = metadata;
    }

    /**
     * 触发事件
     * @param event 要触发的事件对象
     */
    public onEvent(event: any): void {
        if (this.isDisposed()) {
            throw new ObjectDisposedError("EventSource");
        }

        // 如果有元数据,将其添加到事件对象中
        if (this.metadata) {
            for (const paramName in this.metadata) {
                if (paramName && event.metadata && !event.metadata[paramName]) {
                    event.metadata[paramName] = this.metadata[paramName];
                }
            }
        }

        // 调用所有注册的事件监听器
        for (const eventId in this.privEventListeners) {
            if (eventId && this.privEventListeners[eventId]) {
                this.privEventListeners[eventId](event);
            }
        }
    }

    /**
     * 附加事件回调
     * @param onEventCallback 事件回调函数
     * @returns 一个对象,包含detach方法用于分离监听器
     */
    public attach(onEventCallback: (event: any) => void): { detach: () => Promise<void> } {
        const id = createNoDashGuid();
        this.privEventListeners[id] = onEventCallback;
        return {
            detach: () => {
                delete this.privEventListeners[id];
                return Promise.resolve();
            }
        };
    }

    /**
     * 附加事件监听器
     * @param listener 事件监听器对象
     * @returns 一个对象,包含detach方法用于分离监听器
     */
    public attachListener(listener: EventListener): { detach: () => Promise<void> } {
        return this.attach((e) => listener.onEvent(e));
    }

    /**
     * 附加控制台监听器
     * @param listener 控制台监听器对象
     * @returns 一个对象,包含detach方法用于分离监听器
     */
    public attachConsoleListener(listener: EventListener): { detach: () => Promise<void> } {
        if (this.privConsoleListener) {
            this.privConsoleListener.detach();
        }
        this.privConsoleListener = this.attach((e) => listener.onEvent(e));
        return this.privConsoleListener;
    }

    /**
     * 检查事件源是否已被释放
     * @returns 如果已释放返回true,否则返回false
     */
    public isDisposed(): boolean {
        return this.privIsDisposed;
    }

    /**
     * 释放事件源
     */
    public dispose(): void {
        this.privEventListeners = null as any;
        this.privIsDisposed = true;
    }

    /**
     * 获取元数据
     */
    public get metadata(): { [key: string]: string } | undefined {
        return this.privMetadata;
    }
}