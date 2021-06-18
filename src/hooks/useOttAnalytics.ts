import { useContext, useEffect, useState } from 'react';

import { ConfigContext } from '../providers/ConfigProvider';
import type { PlaylistItem } from '../../types/playlist';

const useOttAnalytics = (item?: PlaylistItem, feedId: string = '') => {
  const config = useContext(ConfigContext);
  const [player, setPlayer] = useState<jwplayer.JWPlayer>();

  useEffect(() => {
    if (!window.jwpltx || !config.analyticsToken || !player || !item) {
      return;
    }

    const readyHandler = () => {
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

    player.on('ready', readyHandler);
    player.on('complete', completeHandler);
    player.on('time', timeHandler);
    player.on('adImpression', adImpressionHandler);

    return () => {
      player.off('ready', readyHandler);
      player.off('complete', completeHandler);
      player.off('time', timeHandler);
      player.off('adImpression', adImpressionHandler);
    }
  }, [player]);

  return setPlayer;
};

export default useOttAnalytics;
