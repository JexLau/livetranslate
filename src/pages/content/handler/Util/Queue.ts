import { Deferred } from './Deferred';
import { InvalidOperationError, ObjectDisposedError } from '../Errors'; 
import { List } from './List';
import { ISubscriber, SubscriberType } from '../typings';

/** 这个 Queue 类实现了一个异步队列,主要功能包括:

入队操作 (enqueue 和 enqueueFromPromise)
出队操作 (dequeue)
查看队首元素 (peek)
获取队列长度 (length)
队列释放和清理 (dispose 和 drainAndDispose)

该实现使用了 List 类来存储队列元素,并使用 Deferred 来处理异步操作。它还包含了一个订阅者系统,允许多个消费者等待队列中的元素。
主要的复杂性在于处理队列的释放过程,确保所有待处理的项目都得到适当的处理,并清理所有相关资源。
这个实现适用于需要异步处理队列元素的场景,特别是在处理流数据或需要控制处理速率的情况下。
 */
// 队列类
export class Queue<T> {
    private privPromiseStore: List<Promise<T>>;
    private privIsDrainInProgress: boolean = false;
    private privIsDisposing: boolean = false;
    private privDisposeReason: string | null = null;
    private privList: List<T>;
    private privDetachables: { detach: () => Promise<void> }[];
    private privSubscribers: List<ISubscriber> | null;

    constructor(list?: List<T>) {
        this.privPromiseStore = new List<Promise<T>>();
        this.privList = list || new List<T>();
        this.privDetachables = [];
        this.privSubscribers = new List<ISubscriber>();

        // 监听 list 的 onAdded 事件，当有新元素添加时触发 drain
        this.privDetachables.push(this.privList.onAdded(() => this.drain()));
    }

    // 将元素入队
    public enqueue(item: T): void {
        this.throwIfDispose();
        this.enqueueFromPromise(Promise.resolve(item));
    }

    // 将 Promise 入队
    public enqueueFromPromise(promise: Promise<T>): void {
        this.throwIfDispose();
        promise.then(
            (val) => {
                this.privList.add(val);
            },
            () => {} // 忽略错误
        );
    }

    // 元素出队
    public dequeue(): Promise<T> {
        this.throwIfDispose();
        const deferredSubscriber = new Deferred<T>();
        if (this.privSubscribers) {
            this.privSubscribers.add({
                deferral: deferredSubscriber,
                type: SubscriberType.Dequeue
            });
            this.drain();
        }
        return deferredSubscriber.promise;
    }

    // 查看队首元素
    public peek(): Promise<T> {
        this.throwIfDispose();
        const deferredSubscriber = new Deferred<T>();
        if (this.privSubscribers) {
            this.privSubscribers.add({
                deferral: deferredSubscriber,
                type: SubscriberType.Peek
            });
            this.drain();
        }
        return deferredSubscriber.promise;
    }

    // 获取队列长度
    public length(): number {
        this.throwIfDispose();
        return this.privList.length();
    }

    // 检查队列是否已释放
    public isDisposed(): boolean {
        return this.privSubscribers === null;
    }

    // 清空并释放队列
    public async drainAndDispose(pendingItemProcessor?: (item: T) => void, reason?: string): Promise<void> {
        if (!this.isDisposed() && !this.privIsDisposing) {
            this.privDisposeReason = reason || null;
            this.privIsDisposing = true;

            const subs = this.privSubscribers;
            if (subs) {
                while (subs.length() > 0) {
                    subs.removeFirst().deferral.resolve(undefined);
                }
                if (this.privSubscribers === subs) {
                    this.privSubscribers = subs;
                }
            }

            for (const detachable of this.privDetachables) {
                await detachable.detach();
            }

            if (this.privPromiseStore.length() > 0 && pendingItemProcessor) {
                const promiseArray: Promise<T>[] = [];
                this.privPromiseStore.toArray().forEach((wrapper) => {
                    promiseArray.push(wrapper);
                });

                return Promise.all(promiseArray).finally(() => {
                    this.privSubscribers = null;
                    this.privList!.forEach((item) => {
                        pendingItemProcessor(item);
                    });
                    this.privList = null as any;
                }).then();
            }

            this.privSubscribers = null;
            this.privList = null as any;
        }
    }

    // 释放队列
    public async dispose(reason?: string): Promise<void> {
        await this.drainAndDispose(undefined, reason);
    }

    // 处理队列中的元素
    private drain(): void {
        if (!this.privIsDrainInProgress && !this.privIsDisposing) {
            this.privIsDrainInProgress = true;

            const subs = this.privSubscribers;
            const lists = this.privList;

            if (subs && lists) {
                while (lists.length() > 0 && subs.length() > 0 && !this.privIsDisposing) {
                    const subscriber = subs.removeFirst();
                    if (subscriber.type === SubscriberType.Peek) {
                        subscriber.deferral.resolve(lists.first());
                    } else {
                        const dequeuedItem = lists.removeFirst();
                        subscriber.deferral.resolve(dequeuedItem);
                    }
                }

                if (this.privSubscribers === subs) {
                    this.privSubscribers = subs;
                }
                if (this.privList === lists) {
                    this.privList = lists;
                }
            }

            this.privIsDrainInProgress = false;
        }
    }

    // 检查队列是否已释放，如果已释放则抛出异常
    private throwIfDispose(): void {
        if (this.isDisposed()) {
            if (this.privDisposeReason) {
                throw new InvalidOperationError(this.privDisposeReason);
            }
            throw new ObjectDisposedError("Queue");
        }
        if (this.privIsDisposing) {
            throw new InvalidOperationError("Queue disposing");
        }
    }
}

export default Queue;