import { vitest } from 'vitest';

import { Broadcaster } from '#src/utils/broadcaster';

type TestEvent = { text: string; digit: number };

describe('broadcaster', () => {
  test('it should auto open a broadcast channel by default', () => {
    const broadcaster = new Broadcaster('test-channel');

    expect(broadcaster.opened).toBeTruthy();
  });

  test('it should not open the broadcast channel when passing `false` to the constructor', () => {
    const broadcaster = new Broadcaster('test-channel', false);

    expect(broadcaster.opened).toBeFalsy();
  });

  test('it should be possible to open the channel', () => {
    const broadcaster = new Broadcaster('test-channel', false);

    expect(broadcaster.opened).toBeFalsy();
    broadcaster.open();
    expect(broadcaster.opened).toBeTruthy();
  });

  test('it should be possible to close the channel', () => {
    const broadcaster = new Broadcaster('test-channel');

    expect(broadcaster.opened).toBeTruthy();
    broadcaster.close();
    expect(broadcaster.opened).toBeFalsy();
  });

  test('it should be able to broadcast and receive a message', () => {
    const broadcaster = new Broadcaster<TestEvent>('test-channel');

    const listener1 = vitest.fn();
    const listener2 = vitest.fn();

    broadcaster.addMessageListener(listener1);
    broadcaster.addMessageListener(listener2);

    broadcaster.broadcastMessage({ text: 'a string', digit: 123456 });

    expect(listener1).toBeCalledWith({ text: 'a string', digit: 123456 });
    expect(listener2).toBeCalledWith({ text: 'a string', digit: 123456 });
  });

  test('it should not broadcast messages when the channel is closed', () => {
    const broadcaster = new Broadcaster<TestEvent>('test-channel', false);

    const listener1 = vitest.fn();
    const listener2 = vitest.fn();

    broadcaster.addMessageListener(listener1);
    broadcaster.addMessageListener(listener2);
    broadcaster.broadcastMessage({ text: 'a string', digit: 123456 });

    expect(listener1).not.toBeCalled();
    expect(listener2).not.toBeCalled();
  });

  test('it should broadcast messages when the channel is opened later', () => {
    const broadcaster = new Broadcaster<TestEvent>('test-channel', false);

    const listener1 = vitest.fn();
    const listener2 = vitest.fn();

    broadcaster.addMessageListener(listener1);
    broadcaster.addMessageListener(listener2);

    broadcaster.open();

    broadcaster.broadcastMessage({ text: 'a string', digit: 123456 });

    expect(listener1).toBeCalledWith({ text: 'a string', digit: 123456 });
    expect(listener2).toBeCalledWith({ text: 'a string', digit: 123456 });
  });
});
