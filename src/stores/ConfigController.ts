import { getMediaImages, ImageProperty } from '#src/services/image.service';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { Playlist, PlaylistItem } from '#types/playlist';

const getItemImages = (type: ImageProperty, item: PlaylistItem, playlist?: Playlist, width?: number) => {
  const config = useConfigStore.getState().config;

  return getMediaImages(config, type, item, playlist, width);
};

export const getShelfItemImages = (item: PlaylistItem, playlist: Playlist, width: number) => getItemImages('shelfImage', item, playlist, width);
export const getBackgroundItemImages = (item: PlaylistItem, width: number) => getItemImages('backgroundImage', item, undefined, width);
export const getChannelLogoItemImages = (item: PlaylistItem, width: number) => getItemImages('channelLogoImage', item, undefined, width);
