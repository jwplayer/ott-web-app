import { generateAlternateImageURL, getAlternateImageLabel, getMediaImages } from './image.service';

import configFixture from '#src/fixtures/config.json';
import playlistFixture from '#src/fixtures/playlist.json';
import type { Config } from '#types/Config';
import type { Playlist } from '#types/playlist';

const config = configFixture as Config;
const playlist = playlistFixture as Playlist;

describe('imageService', () => {
  describe('getAlternateImageLabel - shelfImage', () => {
    test('return undefined when no shelfImage is set', () => {
      const label = getAlternateImageLabel(config, 'shelfImage', playlist.playlist[0], playlist);

      expect(label).toBeUndefined();
    });

    test('get the correct shelf image label from a playlist', () => {
      const playlistWithProperty = Object.assign({ shelfImage: 'playlist_label' }, playlist);

      const label1 = getAlternateImageLabel(config, 'shelfImage', playlist.playlist[0], playlistWithProperty);
      const label2 = getAlternateImageLabel(config, 'shelfImage', playlist.playlist[1], playlistWithProperty);

      expect(label1).toEqual('playlist_label');
      expect(label2).toEqual('playlist_label');
    });

    test('get the correct shelf image label from the config', () => {
      const configWithProperty = Object.assign({ custom: { shelfImage: 'config_label' } });

      const label1 = getAlternateImageLabel(configWithProperty, 'shelfImage', playlist.playlist[0], playlist);
      const label2 = getAlternateImageLabel(configWithProperty, 'shelfImage', playlist.playlist[1], playlist);

      expect(label1).toEqual('config_label');
      expect(label2).toEqual('config_label');
    });

    test('overrules the config shelf image label when playlist has a shelfImage property', () => {
      const playlistWithProperty = Object.assign({ shelfImage: 'playlist_label' }, playlist);
      const configWithProperty = Object.assign({ custom: { shelfImage: 'config_label' } });

      const label1 = getAlternateImageLabel(configWithProperty, 'shelfImage', playlist.playlist[0], playlistWithProperty);
      const label2 = getAlternateImageLabel(configWithProperty, 'shelfImage', playlist.playlist[1], playlistWithProperty);

      expect(label1).toEqual('playlist_label');
      expect(label2).toEqual('playlist_label');
    });
  });

  describe('getAlternateImageLabel - backgroundImage', () => {
    test('return undefined when no backgroundImage is set', () => {
      const label = getAlternateImageLabel(config, 'backgroundImage', playlist.playlist[0]);

      expect(label).toBeUndefined();
    });

    test('get the correct background image label from a playlist item', () => {
      const playlistItem1WithProperty = Object.assign({ backgroundImage: 'playlist_item_label' }, playlist.playlist[0]);
      const playlistItem2WithProperty = Object.assign({ backgroundImage: 'playlist_item_label' }, playlist.playlist[1]);

      const label1 = getAlternateImageLabel(config, 'backgroundImage', playlistItem1WithProperty);
      const label2 = getAlternateImageLabel(config, 'backgroundImage', playlistItem2WithProperty);

      expect(label1).toEqual('playlist_item_label');
      expect(label2).toEqual('playlist_item_label');
    });

    test('get the correct background image label from the config', () => {
      const configWithProperty = Object.assign({ custom: { backgroundImage: 'config_label' } });

      const label1 = getAlternateImageLabel(configWithProperty, 'backgroundImage', playlist.playlist[0]);
      const label2 = getAlternateImageLabel(configWithProperty, 'backgroundImage', playlist.playlist[1]);

      expect(label1).toEqual('config_label');
      expect(label2).toEqual('config_label');
    });

    test('overrules the config background image label when playlist item has a backgroundImage property', () => {
      const configWithProperty = Object.assign({ custom: { backgroundImage: 'config_label' } });
      const playlistItem1WithProperty = Object.assign({ backgroundImage: 'playlist_item_label' }, playlist.playlist[0]);

      const label1 = getAlternateImageLabel(configWithProperty, 'backgroundImage', playlistItem1WithProperty);
      const label2 = getAlternateImageLabel(configWithProperty, 'backgroundImage', playlist.playlist[1]);

      expect(label1).toEqual('playlist_item_label');
      expect(label2).toEqual('config_label');
    });
  });

  describe('getAlternateImageLabel - channelLogoImage', () => {
    test('return undefined when no channelLogoImage is set', () => {
      const label = getAlternateImageLabel(config, 'channelLogoImage', playlist.playlist[0]);

      expect(label).toBeUndefined();
    });

    test('get the correct channel logo image label from a playlist item', () => {
      const playlistItem1WithProperty = Object.assign({ channelLogoImage: 'playlist_item_label' }, playlist.playlist[0]);
      const playlistItem2WithProperty = Object.assign({ channelLogoImage: 'playlist_item_label' }, playlist.playlist[1]);

      const label1 = getAlternateImageLabel(config, 'channelLogoImage', playlistItem1WithProperty);
      const label2 = getAlternateImageLabel(config, 'channelLogoImage', playlistItem2WithProperty);

      expect(label1).toEqual('playlist_item_label');
      expect(label2).toEqual('playlist_item_label');
    });

    test('get the correct channel logo image label from the config', () => {
      const configWithProperty = Object.assign({ custom: { channelLogoImage: 'config_label' } });

      const label1 = getAlternateImageLabel(configWithProperty, 'channelLogoImage', playlist.playlist[0]);
      const label2 = getAlternateImageLabel(configWithProperty, 'channelLogoImage', playlist.playlist[1]);

      expect(label1).toEqual('config_label');
      expect(label2).toEqual('config_label');
    });

    test('overrules the config channel logo image label when playlist item has a channelLogoImage property', () => {
      const configWithProperty = Object.assign({ custom: { channelLogoImage: 'config_label' } });
      const playlistItem1WithProperty = Object.assign({ channelLogoImage: 'playlist_item_label' }, playlist.playlist[0]);

      const label1 = getAlternateImageLabel(configWithProperty, 'channelLogoImage', playlistItem1WithProperty);
      const label2 = getAlternateImageLabel(configWithProperty, 'channelLogoImage', playlist.playlist[1]);

      expect(label1).toEqual('playlist_item_label');
      expect(label2).toEqual('config_label');
    });
  });

  describe('getMediaImages', () => {
    test('should only return the poster image URL when no alternate image is set', () => {
      const images = getMediaImages(config, 'shelfImage', playlist.playlist[0], playlist);

      expect(images).toEqual(['https://cdn.jwplayer.com/v2/media/uB8aRnu6/poster.jpg?width=640']);
    });

    test('should return the alternate image and poster image url when alternate image is set', () => {
      const playlistWithProperty = Object.assign({ shelfImage: 'playlist_label' }, playlist);
      const images = getMediaImages(config, 'shelfImage', playlist.playlist[0], playlistWithProperty);

      expect(images).toEqual([
        'https://img.jwplayer.com/v1/media/uB8aRnu6/images/playlist_label.jpg?width=640',
        'https://cdn.jwplayer.com/v2/media/uB8aRnu6/poster.jpg?width=640',
      ]);
    });

    test('should use the width param for the generated image URLs', () => {
      const playlistWithProperty = Object.assign({ shelfImage: 'playlist_label' }, playlist);
      const images = getMediaImages(config, 'shelfImage', playlist.playlist[0], playlistWithProperty, 1280);

      expect(images).toEqual([
        'https://img.jwplayer.com/v1/media/uB8aRnu6/images/playlist_label.jpg?width=1280',
        'https://cdn.jwplayer.com/v2/media/uB8aRnu6/poster.jpg?width=1280',
      ]);
    });
  });

  describe('generateAlternateImageURL', () => {
    test('generates a correct image URL', () => {
      expect(generateAlternateImageURL('123456', 'label', 640)).toEqual('https://img.jwplayer.com/v1/media/123456/images/label.jpg?width=640');
      expect(generateAlternateImageURL('654321', 'shelf', 1280)).toEqual('https://img.jwplayer.com/v1/media/654321/images/shelf.jpg?width=1280');
    });
  });
});
