import { ObjectDisposedError } from "../Errors";

/** 实现了一个可订阅的泛型列表。
提供了多种操作方法,如添加、删除、查找、排序等。
支持事件订阅,包括添加、删除和释放事件。
实现了 dispose 方法用于资源释放。 */
export class List<T> {
  private privList: T[] = [];
  private privSubscriptionIdCounter: number = 0;
  private privAddSubscriptions: { [id: number]: () => void } = {};
  private privRemoveSubscriptions: { [id: number]: () => void } = {};
  private privDisposedSubscriptions: { [id: number]: () => void } = {};
  private privDisposeReason: string = '';

  constructor(list?: T[]) {
      if (list) {
          for (const item of list) {
              this.privList.push(item);
          }
      }
  }

  // 获取指定索引的元素
  public get(itemIndex: number): T {
      this.throwIfDisposed();
      return this.privList[itemIndex];
  }

  // 获取第一个元素
  public first(): T {
      return this.get(0);
  }

  // 获取最后一个元素
  public last(): T {
      return this.get(this.length() - 1);
  }

  // 添加元素到列表末尾
  public add(item: T): void {
      this.throwIfDisposed();
      this.insertAt(this.privList.length, item);
  }

  // 在指定索引插入元素
  public insertAt(index: number, item: T): void {
      this.throwIfDisposed();
      if (index === 0) {
          this.privList.unshift(item);
      } else if (index === this.privList.length) {
          this.privList.push(item);
      } else {
          this.privList.splice(index, 0, item);
      }
      this.triggerSubscriptions(this.privAddSubscriptions);
  }

  // 移除并返回第一个元素
  public removeFirst(): T {
      this.throwIfDisposed();
      return this.removeAt(0);
  }

  // 移除并返回最后一个元素
  public removeLast(): T {
      this.throwIfDisposed();
      return this.removeAt(this.length() - 1);
  }

  // 移除并返回指定索引的元素
  public removeAt(index: number): T {
      this.throwIfDisposed();
      return this.remove(index, 1)[0];
  }

  // 移除指定范围的元素
  public remove(index: number, count: number): T[] {
      this.throwIfDisposed();
      const removedElements = this.privList.splice(index, count);
      this.triggerSubscriptions(this.privRemoveSubscriptions);
      return removedElements;
  }

  // 清空列表
  public clear(): void {
      this.throwIfDisposed();
      this.remove(0, this.length());
  }

  // 获取列表长度
  public length(): number {
      this.throwIfDisposed();
      return this.privList.length;
  }

  // 订阅添加事件
  public onAdded(addedCallback: () => void): { detach: () => Promise<void> } {
      this.throwIfDisposed();
      const subscriptionId = this.privSubscriptionIdCounter++;
      this.privAddSubscriptions[subscriptionId] = addedCallback;
      return {
          detach: () => {
              delete this.privAddSubscriptions[subscriptionId];
              return Promise.resolve();
          }
      };
  }

  // 订阅移除事件
  public onRemoved(removedCallback: () => void): { detach: () => Promise<void> } {
      this.throwIfDisposed();
      const subscriptionId = this.privSubscriptionIdCounter++;
      this.privRemoveSubscriptions[subscriptionId] = removedCallback;
      return {
          detach: () => {
              delete this.privRemoveSubscriptions[subscriptionId];
              return Promise.resolve();
          }
      };
  }

  // 订阅释放事件
  public onDisposed(disposedCallback: () => void): { detach: () => Promise<void> } {
      this.throwIfDisposed();
      const subscriptionId = this.privSubscriptionIdCounter++;
      this.privDisposedSubscriptions[subscriptionId] = disposedCallback;
      return {
          detach: () => {
              delete this.privDisposedSubscriptions[subscriptionId];
              return Promise.resolve();
          }
      };
  }

  // 将列表元素连接成字符串
  public join(separator: string): string {
      this.throwIfDisposed();
      return this.privList.join(separator);
  }

  // 转换为数组
  public toArray(): T[] {
      const cloneCopy: T[] = [];
      this.privList.forEach((val) => {
          cloneCopy.push(val);
      });
      return cloneCopy;
  }

  // 检查是否存在满足条件的元素
  public any(callback?: (item: T, index: number) => boolean): boolean {
      this.throwIfDisposed();
      return callback ? this.where(callback).length() > 0 : this.length() > 0;
  }

  // 检查是否所有元素都满足条件
  public all(callback: (item: T, index: number) => boolean): boolean {
      this.throwIfDisposed();
      return this.where(callback).length() === this.length();
  }

  // 遍历列表
  public forEach(callback: (item: T, index: number) => void): void {
      this.throwIfDisposed();
      for (let i = 0; i < this.length(); i++) {
          callback(this.privList[i], i);
      }
  }

  // 映射列表元素
  public select<U>(callback: (item: T, index: number) => U): List<U> {
      this.throwIfDisposed();
      const selectList: U[] = [];
      for (let i = 0; i < this.privList.length; i++) {
          selectList.push(callback(this.privList[i], i));
      }
      return new List(selectList);
  }

  // 过滤列表元素
  public where(callback: (item: T, index: number) => boolean): List<T> {
      this.throwIfDisposed();
      const filteredList = new List<T>();
      for (let i = 0; i < this.privList.length; i++) {
          if (callback(this.privList[i], i)) {
              filteredList.add(this.privList[i]);
          }
      }
      return filteredList;
  }

  // 排序列表
  public orderBy(compareFn: (a: T, b: T) => number): List<T> {
      this.throwIfDisposed();
      const orderedArray = this.toArray().sort(compareFn);
      return new List(orderedArray);
  }

  // 降序排序列表
  public orderByDesc(compareFn: (a: T, b: T) => number): List<T> {
      this.throwIfDisposed();
      return this.orderBy((a, b) => compareFn(b, a));
  }

  // 克隆列表
  public clone(): List<T> {
      this.throwIfDisposed();
      return new List(this.toArray());
  }

  // 连接另一个List
  public concat(list: List<T>): List<T> {
      this.throwIfDisposed();
      return new List(this.privList.concat(list.toArray()));
  }

  // 连接数组
  public concatArray(array: T[]): List<T> {
      this.throwIfDisposed();
      return new List(this.privList.concat(array));
  }

  // 检查是否已释放
  public isDisposed(): boolean {
      return this.privList == null;
  }

  // 释放列表
  public dispose(reason: string): void {
      if (this.isDisposed()) {
          return;
      }
      this.privDisposeReason = reason;
      this.privList = null as any;
      this.privAddSubscriptions = null as any;
      this.privRemoveSubscriptions = null as any;
      this.triggerSubscriptions(this.privDisposedSubscriptions);
  }

  // 如果已释放则抛出异常
  private throwIfDisposed(): void {
      if (this.isDisposed()) {
          throw new ObjectDisposedError("List", this.privDisposeReason);
      }
  }

  // 触发订阅事件
  private triggerSubscriptions(subscriptions: { [id: number]: () => void } | null): void {
      if (subscriptions) {
          for (const subscriptionId in subscriptions) {
              if (subscriptionId) {
                  subscriptions[subscriptionId]();
              }
          }
      }
  }
}