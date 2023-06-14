import { logDev } from '#src/utils/common';

type BroadcastEventHandler<T> = (event: T) => void;

/**
 * The Broadcaster class can be used to create a broadcast channel between multiple browser tabs using the same origin.
 */
export class Broadcaster<T> {
  private readonly channelName: string;
  private channel: BroadcastChannel | null = null;
  private listeners: BroadcastEventHandler<T>[] = [];

  opened = false;

  /**
   * This function is called when the BroadcastChannel receives a message event
   */
  private handleBroadcastChannelMessage = (event: MessageEvent<string>) => {
    let message: T | null = null;

    try {
      // we can "safely" assume that the only message we receive are of type T in this broadcast channel.
      message = JSON.parse(event.data) as T;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logDev('Error while JSON parsing the broadcast message', error, event.data);
      }
    }

    if (!message) {
      return;
    }

    for (let index = 0; index < this.listeners.length; index++) {
      try {
        this.listeners[index](message);
      } catch (error: unknown) {
        logDev('Error while handling broadcast message', error);
      }
    }
  };

  constructor(channelName: string, autoOpen = true) {
    this.channelName = channelName;

    if (autoOpen) this.open();
  }

  /**
   * Open the broadcast channel
   */
  open() {
    if (this.channel) {
      throw new Error('Broadcaster is already enabled');
    }

    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.addEventListener('message', this.handleBroadcastChannelMessage);
      this.opened = true;
    } else {
      logDev('BroadcastChannel not supported');
    }
  }

  /**
   * Close the broadcast channel, but keep the listeners. This allows to re-open the channel without needing to re-add
   * all listeners.
   */
  close() {
    if (this.channel) {
      this.channel.removeEventListener('message', this.handleBroadcastChannelMessage);
      this.channel.close();

      this.channel = null;
      this.opened = false;
    }
  }

  /**
   * Add a message listener
   */
  addMessageListener(handler: (message: T) => void) {
    this.listeners.push(handler);
  }

  /**
   * Remove a message listener
   */
  removeMessageListener(handler: (message: T) => void) {
    this.listeners = this.listeners.filter((current) => current != handler);
  }

  /**
   * Broadcast a message to all listeners outside the current session (browser tab). When the channel isn't open,
   * the broadcast is ignored.
   */
  broadcastMessage(message: T) {
    if (this.channel) {
      this.channel.postMessage(JSON.stringify(message));
    }
  }
}
