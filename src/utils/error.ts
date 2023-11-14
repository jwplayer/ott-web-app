type Payload = {
  title: string;
  description: string;
  helpLink: string;
};

export class AppError extends Error {
  payload: Payload;

  constructor(message: string, payload: Payload) {
    super(message);
    this.name = 'AppError';
    this.payload = payload;
  }
}
