import { useEffect, useState } from 'react';

import type { Playlist, PlaylistItem } from '#types/playlist';
import type { EpisodeMetadata, Series } from '#types/series';
import { getNextItem } from '#src/utils/series';

export const useNextEpisode = ({
  episode,
  seriesPlaylist,
  series,
  episodeMetadata,
}: {
  episode: PlaylistItem | undefined;
  seriesPlaylist: Playlist;
  series: Series | undefined;
  episodeMetadata: EpisodeMetadata | undefined;
}) => {
  const [nextItem, setNextItem] = useState<PlaylistItem | undefined>(undefined);
  useEffect(() => {
    async function fetchData() {
      const item = await getNextItem(episode, seriesPlaylist, series, episodeMetadata);
      setNextItem(item);
    }
    fetchData();
  }, [episode, seriesPlaylist, series, episodeMetadata]);

  return nextItem;
};
