type EventContext = 'message' | 'internal' | 'leader';
type OnMessageHandler<T> = ((this: unknown, ev: T) => unknown) | null;

export type BroadcastChannel<T> = {
  postMessage(msg: T): Promise<void>;

  addEventListener(type: EventContext, handler: OnMessageHandler<T>): void;
  removeEventListener(type: EventContext, handler: OnMessageHandler<T>): void;
};
