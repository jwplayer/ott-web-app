import type { PlaylistItem } from '../../types/playlist';

import { getLegacySeriesPlaylistId, isEpisode } from './media';

const episodeWithoutSeries = { mediaid: 'abcd1234', title: 'Episode', episodeNumber: '2', seasonNumber: '2025' } as PlaylistItem;

describe('getLegacySeriesPlaylistId', () => {
  test('returns undefined for an episode without a series reference', () => {
    expect(isEpisode(episodeWithoutSeries)).toBe(true);
    expect(getLegacySeriesPlaylistId(episodeWithoutSeries)).toBeUndefined();
  });

  test('returns the series playlist id from custom params', () => {
    expect(getLegacySeriesPlaylistId({ ...episodeWithoutSeries, seriesId: 'SeRiEs01' })).toBe('SeRiEs01');
  });

  test('returns the series playlist id from episode tags', () => {
    expect(getLegacySeriesPlaylistId({ ...episodeWithoutSeries, tags: 'Episode,seriesid_SeRiEs02' })).toBe('SeRiEs02');
  });
});
