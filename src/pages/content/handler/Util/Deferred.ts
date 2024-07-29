/**
 * Deferred 实现了一个延迟对象,用于处理异步操作。
提供了 resolve 和 reject 方法来控制内部 Promise 的状态。
通过 promise 属性暴露内部 Promise。
 */
export class Deferred<T> {
  private privPromise: Promise<T>;
  private privResolve!: (value: T | PromiseLike<T>) => void;
  private privReject!: (reason?: any) => void;

  constructor() {
      // 创建一个新的 Promise，并获取它的 resolve 和 reject 函数
      this.privPromise = new Promise<T>((resolve, reject) => {
          this.privResolve = resolve;
          this.privReject = reject;
      });

      // 绑定 resolve 和 reject 方法到当前实例
      this.resolve = this.resolve.bind(this);
      this.reject = this.reject.bind(this);
  }

  // 解决 Promise
  public resolve(result: T): Deferred<T> {
      this.privResolve(result);
      return this;
  }

  // 拒绝 Promise
  public reject(error: any): Deferred<T> {
      this.privReject(error);
      return this;
  }

  // 获取内部 Promise
  public get promise(): Promise<T> {
      return this.privPromise;
  }
}