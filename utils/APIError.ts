
export class APIError extends Error {
  status: number;
  safe: boolean;
  
  constructor(message: string, status: number, safe: boolean) {
    super(message)
    this.status = status;
    this.safe = safe
  }
}