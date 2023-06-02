import jwtDecode from 'jwt-decode';
import { object, string } from 'yup';

import { removeItem, getItem, setItem } from '#src/utils/persist';
import { Broadcaster } from '#src/utils/broadcaster';
import { IS_DEVELOPMENT_BUILD, logDev } from '#src/utils/common';
import { PromiseQueue } from '#src/utils/promiseQueue';
import { post } from '#src/services/cleeng.service';

const AUTH_PERSIST_KEY = 'auth';

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type MessageAction = 'refreshing' | 'resolved' | 'rejected';

type MessageData = {
  action: MessageAction;
  tokens?: Tokens;
};

type JWTPayload = {
  exp?: number;
};

const tokensSchema = object().shape({
  accessToken: string().required(),
  refreshToken: string().required(),
});

/**
 * Validate the given input if it confirms to the tokenSchema
 */
function isValidTokens(candidate: unknown): candidate is Tokens {
  return tokensSchema.isValidSync(candidate);
}

/**
 * Given an JWT, return token expiration in milliseconds. Returns -1 when the token is invalid.
 */
function getTokenExpiration(token: string) {
  try {
    const decodedToken: JWTPayload = jwtDecode(token);

    if (typeof decodedToken.exp === 'number') {
      return decodedToken.exp * 1000;
    }
  } catch (error: unknown) {
    // failed to parse the JWT string
  }

  return -1;
}

/**
 * Persist the given token in the storage. Removes the token when the given token is `null`.
 */
async function persistInStorage(tokens: Tokens | null) {
  if (tokens) {
    setItem(AUTH_PERSIST_KEY, JSON.stringify(tokens));
  } else {
    removeItem(AUTH_PERSIST_KEY);
  }
}

/**
 * The AuthService is responsible for managing JWT access tokens and refresh tokens.
 *
 * Once an access token and refresh token is set, it will automatically refresh the access token when it is about to
 * expire.
 *
 * It uses a PromiseQueue to prevent multiple instances refreshing the same token which fails.
 *
 * The Broadcaster ensures that all potential browser tabs are notified about the updated token. This prevents
 * race-conditions when the user has multiple tabs open (but also very helpful while developing).
 */
class AuthService {
  private readonly channel: Broadcaster<MessageData>;
  private readonly queue = new PromiseQueue();
  private isRefreshing = false;
  private expiration = -1;
  private sandbox = false;
  tokens: Tokens | null = null;

  /**
   * The `logoutCallback` is a delegate that can be set to handle what should happen when the token is expired or not
   * valid anymore. Since this service shouldn't care about the UI or Zustand state, a controller can use this delegate
   * to update the UI and clear the logged in state. Alternatively, this could dispatch an event, but a delegate is
   * easier to align with the InPlayer integration.
   */
  private logoutCallback?: () => Promise<void>;

  /**
   * This function does the actual refresh of the access token by calling the `refreshToken` endpoint in the Cleeng
   * service.
   */
  private getNewTokens: (tokens: Tokens) => Promise<Tokens | null> = async ({ refreshToken }) => {
    try {
      const { responseData: newTokens } = await post(this.sandbox, '/auths/refresh_token', JSON.stringify({ refreshToken }));

      return {
        accessToken: newTokens.jwt,
        refreshToken: newTokens.refreshToken,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        logDev('Failed to refresh accessToken', error);

        // only logout when the token is expired or invalid, this prevents logging out users when the request failed due to a
        // network error or for aborted requests
        if (error.message.includes('Refresh token is expired or does not exist') || error.message.includes('Missing or invalid parameter')) {
          if (!this.logoutCallback) logDev('logoutCallback is not set');
          await this.logoutCallback?.();
        }
      }

      throw error;
    }
  };

  /**
   * This function is called when a broadcast message is received from another browser tab (same origin)
   */
  private handleBroadcastMessage = async (data: MessageData) => {
    this.isRefreshing = data.action === 'refreshing';

    if (data.tokens) {
      await this.setTokens(data.tokens);
    }

    if (data.action === 'resolved') {
      await this.queue.resolve();
    } else if (data.action === 'rejected') {
      await this.queue.reject();
    }
  };

  /**
   * Notify other browser tabs about a change in the auth state
   */
  private sendBroadcastMessage = (state: MessageAction, tokens?: Tokens) => {
    const message: MessageData = {
      action: state,
      tokens,
    };

    this.channel.broadcastMessage(message);
  };

  constructor() {
    this.channel = new Broadcaster<MessageData>('jwp-refresh-token-channel');
    this.channel.addMessageListener(this.handleBroadcastMessage);
  }

  /**
   * Initialize the auth service and try to restore the session from the storage.
   *
   * When a valid session is found, it refreshes the access token when needed.
   *
   * For development builds, a small random delay is added to prevent all open tabs refreshing the same token when
   * being fully refreshed.
   */
  async initialize(sandbox: boolean, logoutCallback: () => Promise<void>) {
    this.sandbox = sandbox;
    this.logoutCallback = logoutCallback;

    await this.restoreTokensFromStorage();

    // wait a random time to prevent refresh token race-conditions when multiple tabs are open
    // this is only needed when dealing with a live reload environment
    if (IS_DEVELOPMENT_BUILD) {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 500));
    }

    await this.maybeRefreshAccessToken();
  }

  /**
   * Set tokens and persist the tokens in the storage
   */
  async setTokens(tokens: Tokens) {
    this.tokens = tokens;
    this.expiration = getTokenExpiration(tokens.accessToken);

    await persistInStorage(this.tokens);
  }

  /**
   * Remove tokens and clear the storage
   */
  async clearTokens() {
    this.tokens = null;

    await persistInStorage(null);
  }

  /**
   * Try to restore tokens from the storage and overwrite the current when they are newer.
   */
  async restoreTokensFromStorage() {
    const tokensString = await getItem(AUTH_PERSIST_KEY);
    let tokens;

    if (typeof tokensString !== 'string') return;

    try {
      tokens = JSON.parse(tokensString);

      if (!isValidTokens(tokens)) return;
    } catch {
      return;
    }

    const expires = getTokenExpiration(tokens.accessToken);

    // verify if the token from storage is newer than the one we have in the current session
    if (expires > this.expiration) {
      this.tokens = tokens;
      this.expiration = expires;
    }
  }

  /**
   * Returns true when the current access token is expired
   */
  accessTokenIsExpired = () => {
    if (!this.tokens) return false;

    return this.expiration > -1 && Date.now() - this.expiration > 0;
  };

  hasTokens = () => {
    return !!this.tokens;
  };

  /**
   * Don't use this method directly, but use the `maybeRefreshAccessToken` method instead.
   * This function will fetch new tokens and updates the isRefreshing state. It also resolves or rejects the promise
   * queue.
   */
  private async refreshTokens(tokens: Tokens) {
    this.sendBroadcastMessage('refreshing');
    this.isRefreshing = true;

    try {
      const newTokens = await this.getNewTokens(tokens);

      if (newTokens) {
        await this.setTokens(newTokens);
        this.isRefreshing = false;
        this.sendBroadcastMessage('resolved', newTokens);
        await this.queue.resolve();

        return;
      }
    } catch (error: unknown) {
      logDev('Failed to refresh tokens', error);
    }

    // if we are here, we didn't receive new tokens
    await this.clearTokens();
    this.isRefreshing = false;
    this.sendBroadcastMessage('rejected');
    await this.queue.reject();
  }

  /**
   * Use this function ensure that the access token is not expired. If the current token is expired, it will request
   * new tokens. When another session is already refreshing the tokens it will wait in queue instead and use the same
   * results.
   */
  async maybeRefreshAccessToken() {
    try {
      // token is already refreshing, let's wait for it
      if (this.isRefreshing) {
        logDev('Token is already refreshing, waiting in queue...');
        return await this.queue.enqueue();
      }

      // token is not expired or there is no session
      if (!this.accessTokenIsExpired() || !this.tokens) {
        return;
      }

      await this.refreshTokens(this.tokens);
    } catch (error: unknown) {
      logDev('Error caught while refreshing the access token', error);
    }
  }

  /**
   * Get access optional token
   */
  async getAccessToken() {
    await this.maybeRefreshAccessToken();

    // fallback to always "syncing" the tokens from storage in case the broadcast channel isn't supported
    await this.restoreTokensFromStorage();

    return this.tokens?.accessToken;
  }

  /**
   * Get access token or throw an error
   */
  async getAccessTokenOrThrow() {
    const accessToken = await this.getAccessToken();

    if (!accessToken) {
      throw new Error('Access token is missing');
    }

    return accessToken;
  }
}

export default new AuthService();
