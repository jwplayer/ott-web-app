import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { createVideoMetadata } from '@jwp/ott-common/src/utils/metadata';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import useMedia from '@jwp/ott-hooks-react/src/useMedia';
import usePlaylist from '@jwp/ott-hooks-react/src/usePlaylist';
import useEntitlement from '@jwp/ott-hooks-react/src/useEntitlement';

export default function useMovieData(data: PlaylistItem, id: string, feedId: string | null) {
  const { t } = useTranslation('common');
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);

  // Config
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { features } = config;
  const isFavoritesEnabled: boolean = Boolean(features?.favoritesList);

  // Media
  const { isLoading: isTrailerLoading, data: trailerItem } = useMedia(data?.trailerId || '');
  const { isLoading: isPlaylistLoading, data: playlist } = usePlaylist(features?.recommendationsPlaylist || '', { related_media_id: id });
  const nextItem = useMemo(() => {
    if (!id || !playlist) return;

    const index = playlist.playlist.findIndex(({ mediaid }) => mediaid === id);
    const nextItem = playlist.playlist[index + 1];

    return nextItem;
  }, [id, playlist]);

  // User, entitlement
  const { isEntitled, mediaOffers } = useEntitlement(data);

  // UI
  const movieURL = mediaURL({ id: data.mediaid, title: data.title, playlistId: feedId, play: false });
  const playUrl = mediaURL({ id: data.mediaid, title: data.title, playlistId: feedId, play: true });
  const hasTrailer = !!trailerItem || isTrailerLoading;
  const primaryMetadata = [
    ...createVideoMetadata(data, {
      hoursAbbreviation: t('common:abbreviation.hours'),
      minutesAbbreviation: t('common:abbreviation.minutes'),
    }),
    ...(data?.contentType ? [data.contentType] : []),
  ];

  return {
    playlist,
    isTrailerLoading,
    isPlaylistLoading,
    mediaOffers,
    movieURL,
    playUrl,
    nextItem,
    trailerItem,
    accessModel,
    hasTrailer,
    isFavoritesEnabled,
    isEntitled,
    playTrailer,
    primaryMetadata,
    setPlayTrailer,
  };
}
