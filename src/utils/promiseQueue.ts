type QueueItem<T> = {
  resolve: (data?: T) => void;
  reject: (reason?: unknown) => void;
};

/**
 * A really simple promise queue implementation that can be used to enqueue a promise to be resolved later from within
 * the same context.
 *
 * For example, when a request needs to refresh an access token but multiple requests are called parallel (without
 * knowing from each other), a promise queue can be used to wait for the main process to be resolved.
 *
 * So the first request decides the access token needs to be refreshed and enqueues a request to the refresh endpoint.
 * The next request that is performed also sees that access token needs to be refreshed, but since the first request
 * already is performing the refresh, it is added to the promise queue and waits until the main promise is resolved
 * (or rejected).
 */
export class PromiseQueue<T = undefined> {
  private queue: QueueItem<T>[] = [];

  getLength() {
    return this.queue.length;
  }

  /**
   * Enqueues a promise and wait for the promise to be resolved (or rejected).
   */
  async enqueue() {
    return new Promise<T | undefined>((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  }

  /**
   * Resolve all promises and clear the queue. Optionally pas in data confirming to the type.
   */
  async resolve(data?: T) {
    const promises = this.queue.map(({ resolve }) => resolve(data));
    this.queue = [];

    // optionally wait for all promises
    await Promise.allSettled(promises);
  }

  /**
   * Reject all promises and clear the queue. Optionally pas in a reason.
   */
  async reject(reason?: unknown) {
    const promises = this.queue.map(({ reject }) => reject(reason));
    this.queue = [];

    // optionally wait for all promises
    await Promise.allSettled(promises);
  }
}
