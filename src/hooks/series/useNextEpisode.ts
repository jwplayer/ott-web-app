import { useEffect, useState } from 'react';

import type { PlaylistItem } from '#types/playlist';
import type { EpisodeMetadata, Series } from '#types/series';
import { getNextItem } from '#src/utils/series';

export const useNextEpisode = ({ series, episodeMetadata }: { series: Series | undefined; episodeMetadata: EpisodeMetadata | undefined }) => {
  const [nextItem, setNextItem] = useState<PlaylistItem | undefined>(undefined);
  useEffect(() => {
    async function fetchData() {
      const item = await getNextItem(series, episodeMetadata);
      setNextItem(item);
    }
    fetchData();
  }, [series, episodeMetadata]);

  return nextItem;
};
