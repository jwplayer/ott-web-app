import playlistFixture from '@jwp/ott-testing/fixtures/playlist.json';
import epgChannelsFixture from '@jwp/ott-testing/fixtures/epgChannels.json';

import type { Playlist, PlaylistItem } from '../../types/playlist';
import type { EpgChannel } from '../../types/epg';
import { RELATIVE_PATH_USER_ACCOUNT } from '../paths';

import { createURL, liveChannelsURL, mediaURL, playlistURL, userProfileURL } from './urlFormatting';

describe('createUrl', () => {
  test('valid url from a path, query params', () => {
    const url = createURL('/test', { foo: 'bar' });

    expect(url).toEqual('/test?foo=bar');
  });
  test('valid url from a path including params, query params', async () => {
    const url = createURL('/test?existing-param=1', { foo: 'bar' });

    expect(url).toEqual('/test?existing-param=1&foo=bar');
  });

  test('valid url from a path including params, removing one with a query param', async () => {
    const url = createURL('/test?existing-param=1', { [`existing-param`]: null });

    expect(url).toEqual('/test');
  });
  test('valid redirect url from a location including params, query params', async () => {
    const url = createURL('https://app-preview.jwplayer.com/?existing-param=1&foo=bar', { u: 'payment-method-success' });

    expect(url).toEqual('https://app-preview.jwplayer.com/?existing-param=1&foo=bar&u=payment-method-success');
  });
});

describe('createPath, mediaURL, playlistURL and liveChannelsURL', () => {
  test('valid media path', () => {
    const playlist = playlistFixture as Playlist;
    const media = playlist.playlist[0] as PlaylistItem;
    const url = mediaURL({ media, playlistId: playlist.feedid, play: true });

    expect(url).toEqual('/m/uB8aRnu6/agent-327?r=dGSUzs9o&play=1');
  });
  test('valid playlist path', () => {
    const playlist = playlistFixture as Playlist;
    const url = playlistURL(playlist.feedid || '', playlist.title);

    expect(url).toEqual('/p/dGSUzs9o/all-films');
  });
  test('valid live channel path', () => {
    const playlist = playlistFixture as Playlist;
    const channels: EpgChannel[] = epgChannelsFixture;
    const channel = channels[0];
    const url = liveChannelsURL(playlist.feedid || '', channel.id, true);

    expect(url).toEqual('/p/dGSUzs9o/?channel=channel1&play=1');
  });
  test('valid live channel path', () => {
    const url = userProfileURL('testprofile123');

    expect(url).toEqual('/u/my-profile/testprofile123');
  });
  test('valid nested user path', () => {
    const url = RELATIVE_PATH_USER_ACCOUNT;

    expect(url).toEqual('my-account');
  });
  test('valid nested user profile path', () => {
    const url = userProfileURL('testprofile123', true);

    expect(url).toEqual('my-profile/testprofile123');
  });
});
