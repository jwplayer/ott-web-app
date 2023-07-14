import { useEffect, useState } from 'react';

import type { PlaylistItem } from '#types/playlist';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';

const useOttAnalytics = (item?: PlaylistItem, feedId: string = '') => {
  const analyticsToken = useConfigStore((s) => s.config.analyticsToken);
  const user = useAccountStore((state) => state.user);
  const { config } = useConfigStore((s) => s);

  // ott app user id (oaid)
  const oaid: number | undefined = user?.id ? Number(user.id) : undefined;
  // app config id (oiid)
  const oiid = config?.id;
  // app version number (av)
  const av = import.meta.env.APP_VERSION;

  const [player, setPlayer] = useState<jwplayer.JWPlayer | null>(null);

  useEffect(() => {
    if (!window.jwpltx || !analyticsToken || !player || !item) {
      return;
    }

    const timeHandler = ({ position, duration }: jwplayer.TimeParam) => {
      window.jwpltx.time(position, duration);
    };

    const seekHandler = ({ offset }: jwplayer.SeekParam) => {
      // TODO: according to JWPlayer typings, the seek param doesn't contain a `duration` property, but it actually does
      window.jwpltx.seek(offset, player.getDuration());
    };

    const seekedHandler = () => {
      window.jwpltx.seeked();
    };

    const playlistItemHandler = () => {
      if (!analyticsToken) return;

      if (!item) {
        return;
      }

      window.jwpltx.ready(analyticsToken, window.location.hostname, feedId, item.mediaid, item.title, oaid, oiid, av);
    };

    const completeHandler = () => {
      window.jwpltx.complete();
    };

    const adImpressionHandler = () => {
      window.jwpltx.adImpression();
    };

    player.on('playlistItem', playlistItemHandler);
    player.on('complete', completeHandler);
    player.on('time', timeHandler);
    player.on('seek', seekHandler);
    player.on('seeked', seekedHandler);
    player.on('adImpression', adImpressionHandler);

    return () => {
      // Fire remaining seconds / minutes watched
      window.jwpltx.remove();
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
