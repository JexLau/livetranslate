export class ObjectDisposedError extends Error {
  message: string;
  constructor(objectName: string, error: string = '') {
      super(error);
      this.name = objectName + "ObjectDisposed", 
      this.message = error;
  }
}