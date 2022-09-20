import type { Playlist, PlaylistItem } from '#types/playlist';
import { findPlaylistImageForWidth } from '#src/utils/collection';
import type { Config } from '#types/Config';

export type ImageProperty = 'shelfImage' | 'backgroundImage' | 'channelLogoImage';

export const generateAlternateImageURL = (mediaid: string, imageLabel: string, width: number) =>
  `https://img.jwplayer.com/v1/media/${mediaid}/images/${imageLabel}.jpg?width=${width}`;

export const getAlternateImageLabel = (config: Config, propertyName: ImageProperty, item: PlaylistItem, playlist?: Playlist) => {
  const alternateImageLabel = propertyName === 'shelfImage' ? playlist?.[propertyName] : item[propertyName];
  const configImageLabel = config.custom?.[propertyName];

  // image label override from playlist or playlist item
  if (typeof alternateImageLabel === 'string') {
    return alternateImageLabel;
  }

  // image label override from config
  if (typeof configImageLabel === 'string') {
    return configImageLabel;
  }
};

export const getMediaImages = (config: Config, propertyName: ImageProperty, item: PlaylistItem, playlist?: Playlist, width = 640) => {
  const posterImage = findPlaylistImageForWidth(item, width);
  const alternateImageLabel = getAlternateImageLabel(config, propertyName, item, playlist);

  if (alternateImageLabel) {
    return [generateAlternateImageURL(item.mediaid, alternateImageLabel, width), posterImage];
  }

  return [posterImage];
};
