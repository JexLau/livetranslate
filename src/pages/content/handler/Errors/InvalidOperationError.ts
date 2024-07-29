export class InvalidOperationError extends Error {
  constructor(error: string) {
      super(error), this.name = "InvalidOperation", this.message = error;
  }
}