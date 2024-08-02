
interface APIErrorOptions {
  message: string;
  status: number;
  safe: boolean;
  errors?: Record<string, string>;
}

export class APIError extends Error {
  status: number;
  safe: boolean;
  errors?: Record<string, string>;

  constructor({ message, status, safe, errors }: APIErrorOptions) {
    super(message);
    this.status = status;
    this.safe = safe;
    this.errors = errors;
  }
}