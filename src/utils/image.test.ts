import { generateAlternateImageURL, generateImageData } from './image';

import configFixture from '#test/fixtures/config.json';
import playlistFixture from '#test/fixtures/playlist.json';
import type { Config } from '#types/Config';
import type { Playlist } from '#types/playlist';

const config = configFixture as Config;
const playlist = playlistFixture as Playlist;

describe('image utils', () => {
  describe('generateImageData', () => {
    test('should only return the poster image URL when no alternate image is set', () => {
      const images = generateImageData(config, 'shelfImage', playlist.playlist[0], playlist);

      expect(images).toEqual({ image: 'https://cdn.jwplayer.com/v2/media/uB8aRnu6/poster.jpg?width=640' });
    });

    test('should return the alternate image and poster image url when alternate image is set', () => {
      const playlistWithProperty = Object.assign({ shelfImage: 'playlist_label' }, playlist);
      const images = generateImageData(config, 'shelfImage', playlist.playlist[0], playlistWithProperty);

      expect(images).toEqual({
        image: 'https://img.jwplayer.com/v1/media/uB8aRnu6/images/playlist_label.webp?width=640',
        fallbackImage: 'https://cdn.jwplayer.com/v2/media/uB8aRnu6/poster.jpg?width=640',
      });
    });

    test('should use the width param for the generated image URLs', () => {
      const playlistWithProperty = Object.assign({ shelfImage: 'playlist_label' }, playlist);
      const images = generateImageData(config, 'shelfImage', playlist.playlist[0], playlistWithProperty, 1280);

      expect(images).toEqual({
        image: 'https://img.jwplayer.com/v1/media/uB8aRnu6/images/playlist_label.webp?width=1280',
        fallbackImage: 'https://cdn.jwplayer.com/v2/media/uB8aRnu6/poster.jpg?width=1280',
      });
    });
  });

  describe('generateAlternateImageURL', () => {
    test('generates a correct image URL', () => {
      expect(generateAlternateImageURL('123456', 'label', 640)).toEqual('https://img.jwplayer.com/v1/media/123456/images/label.webp?width=640');
      expect(generateAlternateImageURL('654321', 'shelf', 1280)).toEqual('https://img.jwplayer.com/v1/media/654321/images/shelf.webp?width=1280');
    });
  });
});
