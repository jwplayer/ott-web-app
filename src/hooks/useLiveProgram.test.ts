import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import useLiveProgram from '#src/hooks/useLiveProgram';
import epgChannelsFixture from '#test/fixtures/epgChannels.json';
import type { EpgChannel } from '#src/services/epg.service';

const schedule: EpgChannel[] = epgChannelsFixture;

const program = schedule[0].programs[0];
const program2 = schedule[0].programs[1];

describe('useLiveProgram', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should set isLive to true when the program is live', () => {
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:05:00Z'));
    });

    const { result } = renderHook((props) => useLiveProgram(props), { initialProps: { program, catchupHours: 2 } });

    expect(result.current.isLive).toBe(true);
    expect(result.current.isVod).toBe(false);
    expect(result.current.isWatchableFromBeginning).toBe(true);
  });

  test('should switch to isVod when the program is not live anymore', () => {
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:05:00Z'));
    });

    const { result } = renderHook((props) => useLiveProgram(props), { initialProps: { program, catchupHours: 2 } });

    expect(result.current.isLive).toBe(true);
    expect(result.current.isVod).toBe(false);
    expect(result.current.isWatchableFromBeginning).toBe(true);

    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:31:00Z'));
      vi.runOnlyPendingTimers();
    });

    expect(result.current.isLive).toBe(false);
    expect(result.current.isVod).toBe(true);
    expect(result.current.isWatchableFromBeginning).toBe(true);
  });

  test('should return false when the program is not fully watchable anymore', () => {
    // 1 minute before catchup expires (2 hours)
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T11:59:00Z'));
    });

    const { result } = renderHook((props) => useLiveProgram(props), { initialProps: { program, catchupHours: 2 } });

    expect(result.current.isLive).toBe(false);
    expect(result.current.isVod).toBe(true);
    expect(result.current.isWatchableFromBeginning).toBe(true);

    // 1 minute after catchup expiry
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T12:01:00Z'));
      vi.runOnlyPendingTimers();
    });

    expect(result.current.isLive).toBe(false);
    expect(result.current.isVod).toBe(true);
    expect(result.current.isWatchableFromBeginning).toBe(false);
  });

  test('should update values when the program changes', async () => {
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:15:00Z'));
    });

    const { result, rerender } = renderHook((props) => useLiveProgram(props), { initialProps: { program, catchupHours: 2 } });

    expect(result.current.isLive).toBe(true);
    expect(result.current.isVod).toBe(false);
    expect(result.current.isWatchableFromBeginning).toBe(true);

    // update to program 2
    rerender({ program: program2, catchupHours: 2 });

    expect(result.current.isLive).toBe(false);
    expect(result.current.isVod).toBe(false);
    expect(result.current.isWatchableFromBeginning).toBe(true);
  });
});
