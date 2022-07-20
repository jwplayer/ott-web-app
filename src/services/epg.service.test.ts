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
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  test('getSchedules fetches and validates multiple schedules', async () => {
    const channel1Mock = mockGet('/epg/channel1.json').willResolve(scheduleData);
    const channel2Mock = mockGet('/epg/channel2.json').willResolve([]);
    const channel3Mock = mockGet('/epg/does-not-exist.json').willFail('', 404, 'Not found');

    // getSchedules for multiple playlist items
    const schedules = await epgService.getSchedules(livePlaylist.playlist);

    // make sure we are testing a playlist with three media items
    expect(livePlaylistFixture.playlist.length).toBe(3);

    // all channels have fetched
    expect(channel1Mock).toHaveFetchedTimes(1);
    expect(channel2Mock).toHaveFetchedTimes(1);
    expect(channel3Mock).toHaveFetchedTimes(1);

    // valid schedule with 10 programs
    expect(schedules[0].title).toEqual('Channel 1');
    expect(schedules[0].programs.length).toEqual(14);

    // empty schedule
    expect(schedules[1].title).toEqual('Channel 2');
    expect(schedules[1].programs.length).toEqual(0);

    // failed fetching the schedule request
    expect(schedules[2].title).toEqual('Channel 3');
    expect(schedules[2].programs.length).toEqual(0);
  });

  test('parseSchedule should remove programs where required fields are missing', async () => {
    // missing title
    const schedule1 = await epgService.parseSchedule([
      {
        startTime: '2022-07-19T09:00:00Z',
        endTime: '2022-07-19T12:00:00Z',
      },
    ]);
    // missing startTime
    const schedule2 = await epgService.parseSchedule([
      {
        title: 'The title',
        endTime: '2022-07-19T12:00:00Z',
      },
    ]);
    // missing endTime
    const schedule3 = await epgService.parseSchedule([
      {
        title: 'The title',
        startTime: '2022-07-19T09:00:00Z',
      },
    ]);

    expect(schedule1.length).toEqual(0);
    expect(schedule2.length).toEqual(0);
    expect(schedule3.length).toEqual(0);
  });

  test('parseSchedule should remove programs where the startTime or endTime are not valid ISO8601', async () => {
    // invalid startTime
    const schedule1 = await epgService.parseSchedule([
      {
        title: 'Test item',
        startTime: 'this is not ISO8601',
        endTime: '2022-07-19T12:00:00Z',
      },
    ]);
    // invalid endTime
    const schedule2 = await epgService.parseSchedule([
      {
        title: 'The title',
        startTime: '2022-07-19T09:00:00Z',
        endTime: 'this is not ISO8601',
      },
    ]);

    expect(schedule1.length).toEqual(0);
    expect(schedule2.length).toEqual(0);
  });

  test('parseSchedule should transform valid program entries', async () => {
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
