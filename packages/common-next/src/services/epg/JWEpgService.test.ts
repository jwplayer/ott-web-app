import { afterEach, beforeEach, describe, expect } from 'vitest';
import { mockFetch, mockGet } from 'vi-fetch';
import { unregister } from 'timezone-mock';
import livePlaylistFixture from '@jwp/ott-testing/fixtures/livePlaylist.json';

import type { Playlist } from '../../../types/playlist';

import JWEpgService from './JWEpgService';

const livePlaylist = livePlaylistFixture as Playlist;
const epgService = new JWEpgService();

describe('JWwEpgService', () => {
  beforeEach(() => {
    mockFetch.clearAll();
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // must be called before `vi.useRealTimers()`
    unregister();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('fetchSchedule performs a request', async () => {
    const mock = mockGet('/epg/jwChannel.json').willResolve([]);
    const data = await epgService.fetchSchedule(livePlaylist.playlist[0]);

    const request = mock.getRouteCalls()[0];
    const requestHeaders = request?.[1]?.headers;

    expect(data).toEqual([]);
    expect(mock).toHaveFetched();
    expect(requestHeaders).toEqual(new Headers()); // no headers expected
  });

  test('fetchSchedule adds authentication token', async () => {
    const mock = mockGet('/epg/jwChannel.json').willResolve([]);
    const item = Object.assign({}, livePlaylist.playlist[0]);

    item.scheduleToken = 'AUTH-TOKEN';
    const data = await epgService.fetchSchedule(item);

    const request = mock.getRouteCalls()[0];
    const requestHeaders = request?.[1]?.headers;

    expect(data).toEqual([]);
    expect(mock).toHaveFetched();
    expect(requestHeaders).toEqual(new Headers({ 'API-KEY': 'AUTH-TOKEN' }));
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
      cardImage: undefined,
      backgroundImage: undefined,
    });

    expect(program2).toEqual({
      id: '1234-1234-1234-1234',
      title: 'Test item 2',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
      description: undefined,
      image: undefined,
      cardImage: undefined,
      backgroundImage: undefined,
    });

    expect(program3).toEqual({
      id: '1234-1234-1234-1234',
      title: 'Test item 3',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
      description: 'A description',
      cardImage: 'https://cdn.jwplayer/logo.jpg',
      backgroundImage: 'https://cdn.jwplayer/logo.jpg',
    });
  });

  test('transformProgram should reject invalid entries', async () => {
    // missing title
    await epgService
      .transformProgram({
        id: '1234-1234-1234-1234-1234',
        startTime: '2022-07-19T09:00:00Z',
        endTime: '2022-07-19T12:00:00Z',
      })
      .then((res) => expect(res).toBeUndefined())
      .catch((err) => expect(err).toBeDefined());

    // missing startTime
    await epgService
      .transformProgram({
        id: '1234-1234-1234-1234-1234',
        title: 'The title',
        endTime: '2022-07-19T12:00:00Z',
      })
      .then((res) => expect(res).toBeUndefined())
      .catch((err) => expect(err).toBeDefined());

    // missing endTime
    await epgService
      .transformProgram({
        id: '1234-1234-1234-1234-1234',
        title: 'The title',
        startTime: '2022-07-19T09:00:00Z',
      })
      .then((res) => expect(res).toBeUndefined())
      .catch((err) => expect(err).toBeDefined());

    // missing id
    await epgService
      .transformProgram({
        title: 'The title',
        startTime: '2022-07-19T09:00:00Z',
        endTime: '2022-07-19T12:00:00Z',
      })
      .then((res) => expect(res).toBeUndefined())
      .catch((err) => expect(err).toBeDefined());
  });
});
