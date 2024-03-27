import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { Playlist } from '@jwp/ott-common/types/playlist';
import type { EpgChannel } from '@jwp/ott-common/types/epg';
import livePlaylistFixture from '@jwp/ott-testing/fixtures/livePlaylist.json';
import epgChannelsFixture from '@jwp/ott-testing/fixtures/epgChannels.json';
import epgChannelsUpdateFixture from '@jwp/ott-testing/fixtures/epgChannelsUpdate.json';
import { mockService } from '@jwp/ott-common/test/mockService';
import EpgController from '@jwp/ott-common/src/controllers/EpgController';

import { queryClientWrapper, waitForWithFakeTimers } from './testUtils';
import useLiveChannels from './useLiveChannels';

const livePlaylist: Playlist = livePlaylistFixture;
const schedule: EpgChannel[] = epgChannelsFixture;
const scheduleUpdate: EpgChannel[] = epgChannelsUpdateFixture;

describe('useLiveChannels', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('gets the date using the EPG service getSchedules method', async () => {
    const { getSchedules } = mockService(EpgController, {
      getSchedules: vi.fn().mockResolvedValue(schedule),
    });

    const { result } = renderHook((props) => useLiveChannels(props), {
      wrapper: queryClientWrapper(),
      initialProps: { playlist: livePlaylist.playlist, initialChannelId: '' },
    });

    // initial empty channels
    expect(result.current.channels).toEqual([]);
    expect(result.current.channel).toBeUndefined();
    expect(result.current.program).toBeUndefined();

    await waitForWithFakeTimers();

    expect(getSchedules).toHaveBeenCalledWith(livePlaylist.playlist);
    // channels are set in state
    expect(result.current.channels).toEqual(schedule);
    // first channel selected
    expect(result.current.channel).toEqual(schedule[0]);
  });

  test('selects the initial channel based of the initialChannelId', async () => {
    const { getSchedules } = mockService(EpgController, {
      getSchedules: vi.fn().mockResolvedValue(schedule),
    });

    const { result } = renderHook((props) => useLiveChannels(props), {
      wrapper: queryClientWrapper(),
      initialProps: { playlist: livePlaylist.playlist, initialChannelId: 'channel2' },
    });

    await waitForWithFakeTimers();

    expect(getSchedules).toHaveBeenCalledOnce();
    expect(getSchedules).toHaveBeenCalledWith(livePlaylist.playlist);
    // second channel selected (initial channel id)
    expect(result.current.channel).toEqual(schedule[1]);
  });

  test('selects the live program of the current channel', async () => {
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:45:00Z'));
    });

    mockService(EpgController, {
      getSchedules: vi.fn().mockResolvedValue(schedule),
    });

    const { result } = renderHook((props) => useLiveChannels(props), {
      wrapper: queryClientWrapper(),
      initialProps: { playlist: livePlaylist.playlist, initialChannelId: undefined },
    });

    await waitForWithFakeTimers();

    // select live program on first channel
    expect(result.current.program).toMatchObject({ id: 'program2' });
  });

  test('updates the program automatically when no program was found', async () => {
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T09:00:00Z'));
    });

    mockService(EpgController, {
      getSchedules: vi.fn().mockResolvedValue(schedule),
    });

    const { result, rerender } = renderHook((props) => useLiveChannels(props), {
      wrapper: queryClientWrapper(),
      initialProps: { playlist: livePlaylist.playlist, initialChannelId: undefined },
    });

    // no program is selected
    // update time to next program
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:01:00Z'));
    });

    rerender({ playlist: livePlaylist.playlist, initialChannelId: undefined });

    await waitForWithFakeTimers();

    expect(result.current.program).toMatchObject({ id: 'program1' });
  });

  test('updates the program automatically when being live', async () => {
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:15:00Z'));
    });

    mockService(EpgController, {
      getSchedules: vi.fn().mockResolvedValue(schedule),
    });

    const { result } = renderHook((props) => useLiveChannels(props), {
      wrapper: queryClientWrapper(),
      initialProps: { playlist: livePlaylist.playlist, initialChannelId: undefined },
    });

    await waitForWithFakeTimers();
    // first program is selected
    expect(result.current.program).toMatchObject({ id: 'program1' });

    // update time to next program
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:31:00Z'));
      vi.advanceTimersToNextTimer();
    });

    await waitForWithFakeTimers();

    expect(result.current.program).toMatchObject({ id: 'program2' });
  });

  test("doesn't update the program automatically when not being live", async () => {
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:15:00Z'));
    });

    mockService(EpgController, {
      getSchedules: vi.fn().mockResolvedValue(schedule),
    });

    const { result } = renderHook((props) => useLiveChannels(props), {
      wrapper: queryClientWrapper(),
      initialProps: { playlist: livePlaylist.playlist, initialChannelId: undefined },
    });

    // first program is selected
    await waitForWithFakeTimers();
    expect(result.current.program).toMatchObject({ id: 'program1' });

    // update time to next program
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:31:00Z'));
      vi.advanceTimersToNextTimer();
    });

    await waitForWithFakeTimers();
    expect(result.current.program).toMatchObject({ id: 'program2' });
  });

  test('updates the channel and program when using the `setChannel` function', async () => {
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:15:00Z'));
    });

    mockService(EpgController, {
      getSchedules: vi.fn().mockResolvedValue(schedule),
    });

    const { result } = renderHook((props) => useLiveChannels(props), {
      wrapper: queryClientWrapper(),
      initialProps: { playlist: livePlaylist.playlist, initialChannelId: undefined },
    });

    // first program is selected
    await waitForWithFakeTimers();
    expect(result.current.program).toMatchObject({ id: 'program1' });

    act(() => {
      result.current.setActiveChannel('channel2');
    });

    // channel 2 should be selected and program 3 which is live
    expect(result.current.channel).toMatchObject({ id: 'channel2' });
    expect(result.current.program).toMatchObject({ id: 'program3' });

    // update channel and program
    act(() => {
      result.current.setActiveChannel('channel1', 'program2');
    });

    expect(result.current.channel).toMatchObject({ id: 'channel1' });
    expect(result.current.program).toMatchObject({ id: 'program2' });
  });

  test("doesn't update the channel or program when using the `setChannel` function with an invalid channelId ", async () => {
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:15:00Z'));
    });

    mockService(EpgController, {
      getSchedules: vi.fn().mockResolvedValue(schedule),
    });

    const { result } = renderHook((props) => useLiveChannels(props), {
      wrapper: queryClientWrapper(),
      initialProps: { playlist: livePlaylist.playlist, initialChannelId: undefined },
    });

    // first program is selected
    await waitForWithFakeTimers();
    await expect(result.current.program).toMatchObject({ id: 'program1' });

    act(() => {
      result.current.setActiveChannel('channel3', 'program5');
    });

    // channel 1 should still be selected
    expect(result.current.channel).toMatchObject({ id: 'channel1' });
    expect(result.current.program).toMatchObject({ id: 'program1' });
  });

  test('updates the channel and program when the data changes', async () => {
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T10:15:00Z'));
    });

    const { getSchedules } = mockService(EpgController, {
      getSchedules: vi.fn().mockResolvedValue(schedule),
    });

    const { result } = renderHook((props) => useLiveChannels(props), {
      wrapper: queryClientWrapper(),
      initialProps: { playlist: livePlaylist.playlist, initialChannelId: undefined },
    });

    // first program is selected
    await waitForWithFakeTimers();
    expect(result.current.program).toMatchObject({ id: 'program1' });
    expect(result.current.channel?.programs.length).toBe(2);
    expect(getSchedules).toHaveBeenCalledTimes(1);

    getSchedules.mockResolvedValueOnce(scheduleUpdate);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    await waitForWithFakeTimers();
    // the endTime for program1 should be changed
    expect(getSchedules).toHaveBeenCalledTimes(2);
    expect(result.current.channel?.programs.length).toBe(3);
    expect(result.current.program).toMatchObject({ id: 'program1', endTime: '2022-07-15T10:45:00Z' });
  });

  test('updates the channel and program when the data changes', async () => {
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T11:05:00Z'));
    });

    const { getSchedules } = mockService(EpgController, {
      getSchedules: vi.fn().mockResolvedValue(schedule),
    });

    const { result } = renderHook((props) => useLiveChannels(props), {
      wrapper: queryClientWrapper(),
      initialProps: { playlist: livePlaylist.playlist, initialChannelId: undefined },
    });

    // no program is selected (we have an outdated schedule)
    await waitForWithFakeTimers();

    expect(result.current.program).toBeUndefined();
    expect(getSchedules).toHaveBeenCalledTimes(1);

    getSchedules.mockResolvedValue(scheduleUpdate);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    await waitForWithFakeTimers();
    // the program should be updated to the live program with the updated data
    expect(getSchedules).toHaveBeenCalledTimes(2);
    expect(result.current.program).toMatchObject({ id: 'program5' });
  });

  test("clears the program when the current program get's removed from the data", async () => {
    act(() => {
      vi.setSystemTime(new Date('2022-07-15T11:05:00Z'));
    });

    // start with update schedule (which has more programs)
    const { getSchedules } = mockService(EpgController, {
      getSchedules: vi.fn().mockResolvedValue(scheduleUpdate),
    });

    const { result } = renderHook((props) => useLiveChannels(props), {
      wrapper: queryClientWrapper(),
      initialProps: { playlist: livePlaylist.playlist, initialChannelId: undefined },
    });

    // program 5 is selected
    await waitForWithFakeTimers();
    expect(result.current.program).toMatchObject({ id: 'program5' });

    // we use the default schedule data which doesn't have program5
    getSchedules.mockResolvedValue(schedule);
    act(() => {
      vi.runOnlyPendingTimers();
    });

    await waitForWithFakeTimers();
    // the program should be undefined since it couldn't be found in the latest data
    expect(getSchedules).toHaveBeenCalledTimes(2);
    expect(result.current.program).toBeUndefined();
  });
});
