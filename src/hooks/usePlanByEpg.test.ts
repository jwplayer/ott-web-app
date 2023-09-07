import * as planby from 'planby';
import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import usePlanByEpg, { makeTheme, formatChannel, formatProgram } from '#src/hooks/usePlanByEpg';
import epgChannelsFixture from '#test/fixtures/epgChannels.json';
import type { EpgChannel } from '#src/services/epg.service';

const schedule: EpgChannel[] = epgChannelsFixture;

describe('usePlanByEpg', () => {
  beforeEach(() => {
    vi.mock('planby', () => ({
      useEpg: vi.fn(),
    }));
    vi.useFakeTimers();
    vi.setSystemTime('2022-07-26T16:30:20.543Z');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  test('calls the `useEpg` hook with the correct parameters', () => {
    renderHook((props) => usePlanByEpg(props), { initialProps: { channels: schedule, sidebarWidth: 100, itemHeight: 80 } });

    expect(planby.useEpg).toBeCalled();
    expect(planby.useEpg).toHaveBeenCalledWith({
      channels: schedule.map(formatChannel),
      epg: schedule.flatMap((channel) => channel.programs.map((program) => formatProgram(channel.id, program))),
      dayWidth: 7200,
      sidebarWidth: 100,
      itemHeight: 80,
      isSidebar: true,
      isTimeline: true,
      isLine: true,
      isBaseTimeFormat: false,
      startDate: new Date('2022-07-26T00:00:00.000Z'),
      endDate: new Date('2022-07-27T00:00:00.000Z'),
      theme: makeTheme(),
    });
  });

  test('updates the startDate and endDate only when the date changes', () => {
    const mockFn = vi.spyOn(planby, 'useEpg');

    const { rerender } = renderHook((props) => usePlanByEpg(props), { initialProps: { channels: schedule, sidebarWidth: 100, itemHeight: 80 } });

    expect(mockFn).toHaveBeenCalled();
    expect(mockFn.mock.calls[0][0]).toMatchObject({
      startDate: new Date('2022-07-26T00:00:00.000Z'),
      endDate: new Date('2022-07-27T00:00:00.000Z'),
    });

    const startDate = mockFn.mock.calls[0][0].startDate;
    const endDate = mockFn.mock.calls[0][0].endDate;

    // 15 minutes later
    vi.setSystemTime('2022-07-26T16:45:20.543Z');
    rerender({ channels: schedule, sidebarWidth: 100, itemHeight: 80 });

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn.mock.calls[1][0]).toMatchObject({
      startDate: new Date('2022-07-26T00:00:00.000Z'),
      endDate: new Date('2022-07-27T00:00:00.000Z'),
    });

    // date instances should be the same
    expect(mockFn.mock.calls[1][0].startDate).toStrictEqual(startDate);
    expect(mockFn.mock.calls[1][0].endDate).toStrictEqual(endDate);

    // next day
    vi.setSystemTime('2022-07-27T16:30:20.543Z');
    rerender({ channels: schedule, sidebarWidth: 100, itemHeight: 80 });

    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(mockFn.mock.calls[2][0]).toMatchObject({
      startDate: new Date('2022-07-27T00:00:00.000Z'),
      endDate: new Date('2022-07-28T00:00:00.000Z'),
    });
  });

  test('transforms the channels and programs according to planby types', () => {
    const mockFn = vi.spyOn(planby, 'useEpg');

    renderHook((props) => usePlanByEpg(props), { initialProps: { channels: schedule, sidebarWidth: 100, itemHeight: 80 } });

    expect(mockFn.mock.calls[0][0].channels[0]).toMatchObject({
      uuid: 'channel1',
      logo: '',
    });

    expect(mockFn.mock.calls[0][0].epg[0]).toMatchObject({
      id: 'program1',
      channelUuid: 'channel1',
      title: 'Program 1',
      description: '',
      image: '',
      since: '2022-07-15T10:00:00Z',
      till: '2022-07-15T10:30:00Z',
    });
  });
});
