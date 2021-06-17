import { useContext, useEffect, useState } from 'react';

import { ConfigContext } from '../providers/ConfigProvider';
import type { PlaylistItem } from '../../types/playlist';

const useOttAnalytics = (item?: PlaylistItem) => {
  const config = useContext(ConfigContext);
  const [player, setPlayer] = useState<jwplayer.JWPlayer>();

  useEffect(() => {
    if (!window.jwpltx || !config.analyticsToken || !player || !item) {
      return;
    }

    player.on('ready', () => {
      if (!config.analyticsToken) return;

      window.jwpltx.ready(
        config.analyticsToken,
        window.location.hostname,
        item.feedid,
        item.mediaid,
        item.title
      );
    });

    player.on('ready', () => {
      if (!config.analyticsToken) return;

      window.jwpltx.ready(
        config.analyticsToken,
        window.location.hostname,
        item.feedid,
        item.mediaid,
        item.title
      );
    });

    player.on('complete', () => {
      window.jwpltx.complete();
    });

    player.on('time', ({ position, duration  }) => {
      window.jwpltx.time(position, duration);
    });

    player.on('adImpression', () => {
      window.jwpltx.adImpression();
    });
  }, [player]);

  return setPlayer;
};

export default useOttAnalytics;
