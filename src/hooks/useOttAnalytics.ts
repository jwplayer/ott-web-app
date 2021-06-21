import { useContext, useEffect, useState } from 'react';

import { ConfigContext } from '../providers/ConfigProvider';
import type { PlaylistItem } from '../../types/playlist';

const useOttAnalytics = (item?: PlaylistItem, feedId: string = '') => {
  const config = useContext(ConfigContext);
  const [player, setPlayer] = useState<jwplayer.JWPlayer | null>(null);

  useEffect(() => {
    if (!window.jwpltx || !config.analyticsToken || !player || !item) {
      return;
    }

    const playlistItemHandler = () => {
      if (!config.analyticsToken) return;

      window.jwpltx.ready(
        config.analyticsToken,
        window.location.hostname,
        feedId,
        item.mediaid,
        item.title
      );
    }

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
    }
  }, [player]);

  return setPlayer;
};

export default useOttAnalytics;
