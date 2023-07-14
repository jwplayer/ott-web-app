import { PromiseQueue } from './promiseQueue';

describe('promise queue', () => {
  test('should resolve all enqueued promises when `resolve` is called', async () => {
    const queue = new PromiseQueue<string>();
    const promise1 = queue.enqueue();
    const promise2 = queue.enqueue();

    await queue.resolve('data');

    await expect(promise1).resolves.toMatch('data');
    await expect(promise2).resolves.toMatch('data');
  });

  test('should resolve all enqueued promises when `resolve` is called without data', async () => {
    const queue = new PromiseQueue();
    const promise1 = queue.enqueue();
    const promise2 = queue.enqueue();

    await queue.resolve();

    await expect(promise1).resolves.toBeUndefined();
    await expect(promise2).resolves.toBeUndefined();
  });

  test('should reject all enqueued promises when `reject` is called', async () => {
    const queue = new PromiseQueue();
    const promise1 = queue.enqueue();
    const promise2 = queue.enqueue();

    await queue.reject();

    await expect(promise1).rejects.toBeUndefined();
    await expect(promise2).rejects.toBeUndefined();
  });

  test('should reject all enqueued promises when `reject` is called with a reason', async () => {
    const queue = new PromiseQueue();
    const promise1 = queue.enqueue();
    const promise2 = queue.enqueue();

    await queue.reject('This is bad...');

    await expect(promise1).rejects.toMatch('This is bad...');
    await expect(promise2).rejects.toMatch('This is bad...');
  });

  test('should empty the queue when `resolve` is called', async () => {
    expect.assertions(2);

    const queue = new PromiseQueue();
    queue.enqueue();
    queue.enqueue();

    expect(queue.getLength()).toEqual(2);
    await queue.resolve();
    expect(queue.getLength()).toEqual(0);
  });
});
