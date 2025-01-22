export default abstract class StorageService {
  abstract initialize(prefix: string): void;

  abstract getItem<T>(key: string, parse: boolean, usePrefix?: boolean): Promise<T | null>;

  abstract setItem(key: string, value: string, usePrefix?: boolean): Promise<void>;

  abstract removeItem(key: string, usePrefix?: boolean): Promise<void>;

  abstract base64Decode(input: string): string;

  abstract base64Encode(input: string): string;
}
