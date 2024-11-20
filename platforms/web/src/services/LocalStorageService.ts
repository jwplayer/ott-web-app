import { injectable } from '@jwp/ott-common/src/modules/container';
import StorageService from '@jwp/ott-common/src/services/StorageService';
import { logError } from '@jwp/ott-common/src/logger';

@injectable()
export class LocalStorageService extends StorageService {
  prefix: string = 'jwapp';

  initialize(prefix: string) {
    this.prefix = prefix;
  }

  getStorageKey(key: string, usePrefix = true) {
    return usePrefix ? `${this.prefix}.${key}` : key;
  }

  async getItem(key: string, parse: boolean, usePrefix = true) {
    try {
      const value = window.localStorage.getItem(usePrefix ? this.getStorageKey(key) : key);

      return value && parse ? JSON.parse(value) : value;
    } catch (error: unknown) {
      logError('LocalStorageService', 'Failed to parse localStorage entry', { error });
    }
  }

  async setItem(key: string, value: string, usePrefix = true) {
    try {
      window.localStorage.setItem(usePrefix ? this.getStorageKey(key) : key, value);
    } catch (error: unknown) {
      logError('LocalStorageService', 'Failed to store localStorage entry', { error });
    }
  }

  async removeItem(key: string, usePrefix = true) {
    try {
      window.localStorage.removeItem(this.getStorageKey(key, usePrefix));
    } catch (error: unknown) {
      logError('LocalStorageService', 'Failed to remove localStorage entry', { error });
    }
  }

  // helper functions for encoding and decoding Base64 strings
  // this might end up in a different service
  base64Encode(input: string): string {
    return window.btoa(input);
  }

  base64Decode(input: string): string {
    return window.atob(input);
  }
}
