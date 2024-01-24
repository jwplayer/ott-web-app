import { useEffect, useState } from 'react';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import env from '@jwp/ott-common/src/env';
import type { Jwpltx } from '@jwp/ott-common/types/jwpltx';

const useOttAnalytics = (item?: PlaylistItem, feedId: string = '') => {
  const analyticsToken = useConfigStore((s) => s.config.analyticsToken);
  const user = useAccountStore((state) => state.user);
  const { config } = useConfigStore((s) => s);

  // ott app user id (oaid)
  const oaid: number | undefined = user?.id ? Number(user.id) : undefined;
  // app config id (oiid)
  const oiid = config?.id;
  // app version number (av)
  const av = env.APP_VERSION;

  const [player, setPlayer] = useState<jwplayer.JWPlayer | null>(null);

  useEffect(() => {
    const jwpltx = 'jwpltx' in window ? (window.jwpltx as Jwpltx) : undefined;

    if (!jwpltx || !analyticsToken || !player || !item) {
      return;
    }

    const timeHandler = ({ position, duration }: jwplayer.TimeParam) => {
      jwpltx.time(position, duration);
    };

    const seekHandler = ({ offset }: jwplayer.SeekParam) => {
      // TODO: according to JWPlayer typings, the seek param doesn't contain a `duration` property, but it actually does
      jwpltx.seek(offset, player.getDuration());
    };

    const seekedHandler = () => {
      jwpltx.seeked();
    };

    const playlistItemHandler = () => {
      if (!analyticsToken) return;

      if (!item) {
        return;
      }

      jwpltx.ready(analyticsToken, window.location.hostname, feedId, item.mediaid, item.title, oaid, oiid, av);
    };

    const completeHandler = () => {
      jwpltx.complete();
    };

    const adImpressionHandler = () => {
      jwpltx.adImpression();
    };

    player.on('playlistItem', playlistItemHandler);
    player.on('complete', completeHandler);
    player.on('time', timeHandler);
    player.on('seek', seekHandler);
    player.on('seeked', seekedHandler);
    player.on('adImpression', adImpressionHandler);

    return () => {
      // Fire remaining seconds / minutes watched
      jwpltx.remove();
      player.off('playlistItem', playlistItemHandler);
      player.off('complete', completeHandler);
      player.off('time', timeHandler);
      player.off('seek', seekHandler);
      player.off('seeked', seekedHandler);
      player.off('adImpression', adImpressionHandler);
    };
  }, [player, item, analyticsToken, feedId, oaid, oiid, av]);

  return setPlayer;
};

export default useOttAnalytics;
