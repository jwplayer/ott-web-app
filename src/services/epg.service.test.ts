import { afterEach, beforeEach, describe, expect } from 'vitest';
import { mockFetch, mockGet } from 'vi-fetch';

import epgService, { EpgProgram } from '#src/services/epg.service';
import scheduleFixture from '#src/fixtures/schedule.json';
import livePlaylistFixture from '#src/fixtures/livePlaylist.json';
import type { Playlist } from '#types/playlist';

const livePlaylist = livePlaylistFixture as Playlist;
const scheduleData = scheduleFixture as EpgProgram[];

describe('epgService', () => {
  beforeEach(() => {
    mockFetch.clearAll();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('fetchSchedule performs a request', async () => {
    const mock = mockGet('/epg/channel1.json').willResolve([]);
    const data = await epgService.fetchSchedule(livePlaylist.playlist[0]);

    const request = mock.getRouteCalls()[0];
    const requestHeaders = request?.[1]?.headers;

    expect(data).toEqual([]);
    expect(mock).toHaveFetched();
    expect(requestHeaders).toEqual(new Headers()); // no headers expected
  });

  test('fetchSchedule adds authentication token', async () => {
    const mock = mockGet('/epg/channel1.json').willResolve([]);
    const item = Object.assign({}, livePlaylist.playlist[0]);

    item.scheduleToken = 'AUTH-TOKEN';
    const data = await epgService.fetchSchedule(item);

    const request = mock.getRouteCalls()[0];
    const requestHeaders = request?.[1]?.headers;

    expect(data).toEqual([]);
    expect(mock).toHaveFetched();
    expect(requestHeaders).toEqual(new Headers({ 'API-KEY': 'AUTH-TOKEN' }));
  });

  test('getSchedule fetches and validates a valid schedule', async () => {
    const mock = mockGet('/epg/channel1.json').willResolve(scheduleData);
    const schedule = await epgService.getSchedule(livePlaylist.playlist[0]);

    expect(mock).toHaveFetched();
    expect(schedule.title).toEqual('Channel 1');
    expect(schedule.programs.length).toEqual(14);
  });

  test('getSchedule adds a static program when the schedule is empty or fails', async () => {
    const mock1 = mockGet('/epg/channel2.json').willResolve([]);
    const mock2 = mockGet('/epg/does-not-exist.json').willFail('', 404, 'Not found');
    const mock3 = mockGet('/epg/network-error.json').willThrow(new Error('Network error'));

    // mock the date
    vi.setSystemTime(new Date(2022, 1, 1, 14, 30, 10, 500));

    const emptySchedule = await epgService.getSchedule(livePlaylist.playlist[1]);
    const failedSchedule = await epgService.getSchedule(livePlaylist.playlist[2]);
    const networkErrorSchedule = await epgService.getSchedule(livePlaylist.playlist[3]);

    expect(mock1).toHaveFetched();
    expect(emptySchedule.title).toEqual('Channel 2');
    expect(emptySchedule.programs.length).toEqual(1);
    expect(emptySchedule.programs[0]).toMatchObject({
      id: 'no-program-NS2Q213',
      title: 'epg:empty_schedule_program.title',
      description: 'epg:empty_schedule_program.description',
      startTime: '2022-01-31T00:00:00.000Z',
      endTime: '2022-02-02T23:59:59.999Z',
      image: undefined,
    });

    expect(mock2).toHaveFetched();
    expect(failedSchedule.title).toEqual('Channel 3');
    expect(failedSchedule.programs.length).toEqual(1);
    expect(failedSchedule.programs[0]).toMatchObject({
      id: 'no-program-JDODS53',
      title: 'epg:failed_schedule_program.title',
      description: 'epg:failed_schedule_program.description',
      startTime: '2022-01-31T00:00:00.000Z',
      endTime: '2022-02-02T23:59:59.999Z',
      image: undefined,
    });

    expect(mock3).toHaveFetched();
    expect(networkErrorSchedule.title).toEqual('Channel 4');
    expect(networkErrorSchedule.programs.length).toEqual(1);
    expect(networkErrorSchedule.programs[0]).toMatchObject({
      id: 'no-program-SDF23CJ',
      title: 'epg:failed_schedule_program.title',
      description: 'epg:failed_schedule_program.description',
      startTime: '2022-01-31T00:00:00.000Z',
      endTime: '2022-02-02T23:59:59.999Z',
      image: undefined,
    });
  });

  test('getSchedule enabled demo mode when scheduleDemo is set', async () => {
    const mock = mockGet('/epg/channel1.json').willResolve(scheduleData);

    // mock the date
    vi.setSystemTime(new Date(2036, 5, 3, 14, 30, 10, 500));

    const item = Object.assign({}, livePlaylist.playlist[0]);
    item.scheduleDemo = '1';

    const schedule = await epgService.getSchedule(item);

    expect(mock).toHaveFetched();
    expect(schedule.title).toEqual('Channel 1');
    // first program
    expect(schedule.programs[0].startTime).toEqual('2036-06-03T23:50:00.000Z');
    expect(schedule.programs[0].endTime).toEqual('2036-06-04T00:55:00.000Z');

    // last program
    expect(schedule.programs[13].startTime).toEqual('2036-06-04T07:00:00.000Z');
    expect(schedule.programs[13].endTime).toEqual('2036-06-04T07:40:00.000Z');
  });

  test('getSchedules fetches and validates multiple schedules', async () => {
    const channel1Mock = mockGet('/epg/channel1.json').willResolve(scheduleData);
    const channel2Mock = mockGet('/epg/channel2.json').willResolve([]);
    const channel3Mock = mockGet('/epg/does-not-exist.json').willFail('', 404, 'Not found');
    const channel4Mock = mockGet('/epg/network-error.json').willThrow(new Error('Network error'));

    // getSchedules for multiple playlist items
    const schedules = await epgService.getSchedules(livePlaylist.playlist);

    // make sure we are testing a playlist with four media items
    expect(livePlaylistFixture.playlist.length).toBe(4);

    // all channels have fetched
    expect(channel1Mock).toHaveFetchedTimes(1);
    expect(channel2Mock).toHaveFetchedTimes(1);
    expect(channel3Mock).toHaveFetchedTimes(1);
    expect(channel4Mock).toHaveFetchedTimes(1);

    // valid schedule with 10 programs
    expect(schedules[0].title).toEqual('Channel 1');
    expect(schedules[0].programs.length).toEqual(14);

    // empty schedule (with static program)
    expect(schedules[1].title).toEqual('Channel 2');
    expect(schedules[1].programs.length).toEqual(1);
    expect(schedules[1].programs[0].title).toEqual('epg:empty_schedule_program.title');

    // failed fetching the schedule request (with static program)
    expect(schedules[2].title).toEqual('Channel 3');
    expect(schedules[2].programs.length).toEqual(1);
    expect(schedules[2].programs[0].title).toEqual('epg:failed_schedule_program.title');

    // network error (with static program)
    expect(schedules[3].title).toEqual('Channel 4');
    expect(schedules[3].programs.length).toEqual(1);
    expect(schedules[3].programs[0].title).toEqual('epg:failed_schedule_program.title');
  });

  test('parseSchedule should remove programs where required fields are missing', async () => {
    // missing title
    const schedule1 = await epgService.parseSchedule([
      {
        id: '1234-1234-1234-1234-1234',
        startTime: '2022-07-19T09:00:00Z',
        endTime: '2022-07-19T12:00:00Z',
      },
    ]);
    // missing startTime
    const schedule2 = await epgService.parseSchedule([
      {
        id: '1234-1234-1234-1234-1234',
        title: 'The title',
        endTime: '2022-07-19T12:00:00Z',
      },
    ]);
    // missing endTime
    const schedule3 = await epgService.parseSchedule([
      {
        id: '1234-1234-1234-1234-1234',
        title: 'The title',
        startTime: '2022-07-19T09:00:00Z',
      },
    ]);
    // missing id
    const schedule4 = await epgService.parseSchedule([
      {
        title: 'The title',
        startTime: '2022-07-19T09:00:00Z',
        endTime: '2022-07-19T12:00:00Z',
      },
    ]);

    expect(schedule1.length).toEqual(0);
    expect(schedule2.length).toEqual(0);
    expect(schedule3.length).toEqual(0);
    expect(schedule4.length).toEqual(0);
  });

  test('parseSchedule should remove programs where the startTime or endTime are not valid ISO8601', async () => {
    // invalid startTime
    const schedule1 = await epgService.parseSchedule([
      {
        id: '1234-1234-1234-1234-1234',
        title: 'Test item',
        startTime: 'this is not ISO8601',
        endTime: '2022-07-19T12:00:00Z',
      },
    ]);
    // invalid endTime
    const schedule2 = await epgService.parseSchedule([
      {
        id: '1234-1234-1234-1234-1234',
        title: 'The title',
        startTime: '2022-07-19T09:00:00Z',
        endTime: 'this is not ISO8601',
      },
    ]);

    expect(schedule1.length).toEqual(0);
    expect(schedule2.length).toEqual(0);
  });

  test('parseSchedule should update the start and end time when demo is enabled', async () => {
    // some date in the far future
    vi.setSystemTime(new Date(2036, 5, 3, 14, 30, 10, 500));

    const schedule = await epgService.parseSchedule(
      [
        {
          id: '1234-1234-1234-1234-1234',
          title: 'Test item 1',
          startTime: '2022-07-19T12:00:00Z',
          endTime: '2022-07-19T17:00:00Z',
        },
        {
          id: '1234-1234-1234-1234-1234',
          title: 'Test item 2',
          startTime: '2022-07-19T17:00:00Z',
          endTime: '2022-07-19T23:00:00Z',
        },
        {
          id: '1234-1234-1234-1234-1234',
          title: 'Test item 3',
          startTime: '2022-07-19T23:00:00Z',
          endTime: '2022-07-20T05:30:00Z',
        },
        {
          id: '1234-1234-1234-1234-1234',
          title: 'Test item 4',
          startTime: '2022-07-20T05:30:00Z',
          endTime: '2022-07-20T12:00:00Z',
        },
      ],
      true,
    );

    expect(schedule.length).toEqual(4);

    expect(schedule[0].startTime).toEqual('2036-06-03T12:00:00.000Z');
    expect(schedule[0].endTime).toEqual('2036-06-03T17:00:00.000Z');

    expect(schedule[1].startTime).toEqual('2036-06-03T17:00:00.000Z');
    expect(schedule[1].endTime).toEqual('2036-06-03T23:00:00.000Z');

    expect(schedule[2].startTime).toEqual('2036-06-03T23:00:00.000Z');
    expect(schedule[2].endTime).toEqual('2036-06-04T05:30:00.000Z');

    expect(schedule[3].startTime).toEqual('2036-06-04T05:30:00.000Z');
    expect(schedule[3].endTime).toEqual('2036-06-04T12:00:00.000Z');
  });

  test('transformProgram should transform valid program entries', async () => {
    const program1 = await epgService.transformProgram({
      id: '1234-1234-1234-1234',
      title: 'Test item',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
    });
    const program2 = await epgService.transformProgram({
      id: '1234-1234-1234-1234',
      title: 'Test item 2',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
      chapterPointCustomProperties: [],
    });
    const program3 = await epgService.transformProgram({
      id: '1234-1234-1234-1234',
      title: 'Test item 3',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
      chapterPointCustomProperties: [
        {
          key: 'description',
          value: 'A description',
        },
        {
          key: 'image',
          value: 'https://cdn.jwplayer/logo.jpg',
        },
        {
          key: 'other-key',
          value: 'this property should be ignored',
        },
      ],
    });

    expect(program1).toEqual({
      id: '1234-1234-1234-1234',
      title: 'Test item',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
      description: undefined,
      image: undefined,
    });

    expect(program2).toEqual({
      id: '1234-1234-1234-1234',
      title: 'Test item 2',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
      description: undefined,
      image: undefined,
    });

    expect(program3).toEqual({
      id: '1234-1234-1234-1234',
      title: 'Test item 3',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
      description: 'A description',
      image: 'https://cdn.jwplayer/logo.jpg',
    });
  });
});
