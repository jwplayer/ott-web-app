import { useEffect, useState } from 'react';

import type { PlaylistItem } from '#types/playlist';
import { useConfigStore } from '#src/stores/ConfigStore';

const useOttAnalytics = (item?: PlaylistItem, feedId: string = '') => {
  const analyticsToken = useConfigStore((s) => s.config.analyticsToken);
  const [player, setPlayer] = useState<jwplayer.JWPlayer | null>(null);

  useEffect(() => {
    if (!window.jwpltx || !analyticsToken || !player || !item) {
      return;
    }

    const playlistItemHandler = () => {
      if (!analyticsToken) return;

      window.jwpltx.ready(analyticsToken, window.location.hostname, feedId, item.mediaid, item.title);
    };

    const completeHandler = () => {
      window.jwpltx.complete();
    };

    const timeHandler = ({ position, duration }: jwplayer.TimeParam) => {
      window.jwpltx.time(position, duration);
    };

    const adImpressionHandler = () => {
      window.jwpltx.adImpression();
    };

    player.on('playlistItem', playlistItemHandler);
    player.on('complete', completeHandler);
    player.on('time', timeHandler);
    player.on('adImpression', adImpressionHandler);

    return () => {
      player.off('playlistItem', playlistItemHandler);
      player.off('complete', completeHandler);
      player.off('time', timeHandler);
      player.off('adImpression', adImpressionHandler);
    };
  }, [player]);

  return setPlayer;
};

export default useOttAnalytics;
