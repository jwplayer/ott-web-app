import { afterEach, beforeEach, describe, expect } from 'vitest';
import { mockFetch, mockGet } from 'vi-fetch';
import { unregister } from 'timezone-mock';
import viewNexaChannel from '@jwp/ott-testing/epg/viewNexaChannel.xml?raw';
import livePlaylistFixture from '@jwp/ott-testing/fixtures/livePlaylist.json';

import type { Playlist } from '../../../types/playlist';
import { EPG_TYPE } from '../../constants';

import ViewNexaEpgService from './ViewNexaEpgService';

const livePlaylist = livePlaylistFixture as Playlist;
const epgService = new ViewNexaEpgService();

describe('ViewNexaEpgService', () => {
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
    const mock = mockGet('/epg/viewNexaChannel.xml').willResolveOnce([]);
    const data = await epgService.fetchSchedule({ ...livePlaylist.playlist[0], scheduleUrl: '/epg/viewNexaChannel.xml', scheduleType: EPG_TYPE.viewNexa });

    expect(mock).toHaveFetched();
    expect(data).toEqual([]);
  });

  test('fetchSchedule parses xml content', async () => {
    const mock = mockGet('/epg/viewNexaChannel.xml').willResolveOnce(viewNexaChannel);
    const data = await epgService.fetchSchedule({ ...livePlaylist.playlist[0], scheduleUrl: '/epg/viewNexaChannel.xml', scheduleType: EPG_TYPE.viewNexa });

    expect(mock).toHaveFetched();
    expect(data[0]).toEqual({
      channel: 'dc4b6b04-7c6f-49f1-aac1-1ff61cb7d089',
      date: 20231120,
      desc: {
        '#text':
          'Tears of Steel (code-named Project Mango) is a short science fiction film by producer Ton Roosendaal and director/writer Ian Hubert. The film is both live-action and CGI; it was made using new enhancements to the visual effects capabilities of Blender, a free and open-source 3D computer graphics app. Set in a dystopian future, the short film features a group of warriors and scientists who gather at the Oude Kerk in Amsterdam in a desperate attempt to save the world from destructive robots.',
        lang: 'en',
      },
      'episode-num': {
        '#text': '5a66fb0a-7ad7-4429-a736-168862df98e5',
        system: 'assetId',
      },
      genre: {
        '#text': 'action',
        lang: 'en',
      },
      icon: {
        height: '720',
        src: 'https://fueltools-prod01-public.fuelmedia.io/4523afd9-82d5-45ae-9496-786451f2b517/20230330/5a66fb0a-7ad7-4429-a736-168862df98e5/thumbnail_20230330012948467.jpg',
        width: '1728',
      },
      length: {
        '#text': 734.192,
        units: 'seconds',
      },
      rating: {
        system: 'bfcc',
        value: 'CC-BY',
      },
      start: '20231120073000 +0000',
      stop: '20231120105014 +0000',
      title: {
        '#text': 'Tears of Steel',
        lang: 'en',
      },
    });
  });

  test('transformProgram should transform valid program entries', async () => {
    const program1 = await epgService.transformProgram({
      'episode-num': {
        '#text': '1234-1234-1234-1234',
      },
      title: {
        '#text': 'Test item',
      },
      desc: {
        '#text': 'Test desc',
      },
      start: '20231120073000 +0000',
      stop: '20231120105014 +0000',
    });

    const program2 = await epgService.transformProgram({
      'episode-num': {
        '#text': '1234-1234-1234-1234',
      },
      title: {
        '#text': 'Test item 2',
      },
      desc: {
        '#text': 'Test desc',
      },
      start: '20231120073000 +0000',
      stop: '20231120105014 +0000',
    });

    const program3 = await epgService.transformProgram({
      'episode-num': {
        '#text': '1234-1234-1234-1234',
      },
      title: {
        '#text': 'Test item 3',
      },
      desc: {
        '#text': 'A description',
      },
      icon: {
        src: 'https://cdn.jwplayer/logo.jpg',
      },
      start: '20231120073000 +0000',
      stop: '20231120105014 +0000',
    });

    expect(program1).toEqual({
      id: '1234-1234-1234-1234',
      title: 'Test item',
      startTime: '2023-11-20T07:30:00.000Z',
      endTime: '2023-11-20T10:50:14.000Z',
      description: 'Test desc',
      cardImage: undefined,
      backgroundImage: undefined,
    });

    expect(program2).toEqual({
      id: '1234-1234-1234-1234',
      title: 'Test item 2',
      startTime: '2023-11-20T07:30:00.000Z',
      endTime: '2023-11-20T10:50:14.000Z',
      description: 'Test desc',
      cardImage: undefined,
      backgroundImage: undefined,
    });

    expect(program3).toEqual({
      id: '1234-1234-1234-1234',
      title: 'Test item 3',
      startTime: '2023-11-20T07:30:00.000Z',
      endTime: '2023-11-20T10:50:14.000Z',
      description: 'A description',
      cardImage: 'https://cdn.jwplayer/logo.jpg',
      backgroundImage: 'https://cdn.jwplayer/logo.jpg',
    });
  });

  test('transformProgram should reject invalid entries', async () => {
    // missing title
    await epgService
      .transformProgram({
        'episode-num': {
          '#text': '1234-1234-1234-1234',
        },
        desc: {
          '#text': 'A description',
        },
        icon: {
          src: 'https://cdn.jwplayer/logo.jpg',
        },
        start: '20231120073000 +0000',
        stop: '20231120105014 +0000',
      })
      .then((res) => expect(res).toBeUndefined())
      .catch((err) => expect(err).toBeDefined());

    // missing startTime
    await epgService
      .transformProgram({
        'episode-num': {
          '#text': '1234-1234-1234-1234',
        },
        title: {
          '#text': 'Test item 3',
        },
        desc: {
          '#text': 'A description',
        },
        icon: {
          src: 'https://cdn.jwplayer/logo.jpg',
        },
        stop: '20231120105014 +0000',
      })
      .then((res) => expect(res).toBeUndefined())
      .catch((err) => expect(err).toBeDefined());

    // missing endTime
    await epgService
      .transformProgram({
        'episode-num': {
          '#text': '1234-1234-1234-1234',
        },
        title: {
          '#text': 'Test item 3',
        },
        desc: {
          '#text': 'A description',
        },
        icon: {
          src: 'https://cdn.jwplayer/logo.jpg',
        },
        start: '20231120073000 +0000',
      })
      .then((res) => expect(res).toBeUndefined())
      .catch((err) => expect(err).toBeDefined());

    // missing id
    await epgService
      .transformProgram({
        'episode-num': {
          '#text': '1234-1234-1234-1234',
        },
        title: {
          '#text': 'Test item 3',
        },
        desc: {
          '#text': 'A description',
        },
        icon: {
          src: 'https://cdn.jwplayer/logo.jpg',
        },
        start: '20231120073000 +0000',
        stop: '20231120105014 +0000',
      })
      .then((res) => expect(res).toBeUndefined())
      .catch((err) => expect(err).toBeDefined());
  });
});
