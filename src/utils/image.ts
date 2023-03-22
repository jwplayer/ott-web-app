import type { Config } from '#types/Config';
import type { Playlist, PlaylistItem } from '#types/playlist';
import { findPlaylistImageForWidth } from '#src/utils/collection';

export const generateAlternateImageURL = (mediaid: string, imageLabel: string, width: number) =>
  `https://img.jwplayer.com/v1/media/${mediaid}/images/${imageLabel}.webp?width=${width}`;

export const generateImageData = (config: Config, propertyName: string, item: PlaylistItem, playlist?: Playlist, width = 640) => {
  const posterImage = findPlaylistImageForWidth(item, width);
  // when a playlist is given, get the alternate image label from the playlist instead
  const contentImageLabel = playlist ? playlist[propertyName] : item[propertyName];
  const configImageLabel = config.custom?.[propertyName];
  const imageLabel = contentImageLabel || configImageLabel;

  return {
    image: typeof imageLabel === 'string' ? generateAlternateImageURL(item.mediaid, imageLabel, width) : posterImage,
    fallbackImage: imageLabel ? posterImage : undefined,
  };
};
