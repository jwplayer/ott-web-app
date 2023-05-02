import { useCallback, useEffect, useState } from 'react';

import type { PlaylistItem } from '#types/playlist';
import { useConfigStore } from '#src/stores/ConfigStore';

const useOttAnalytics = (item?: PlaylistItem, feedId: string = '') => {
  const analyticsToken = useConfigStore((s) => s.config.analyticsToken);
  const [player, setPlayer] = useState<jwplayer.JWPlayer | null>(null);

  const timeHandler = useCallback(({ position, duration }: jwplayer.TimeParam) => {
    window.jwpltx.time(position, duration, feedId);
  }, []);

  const seekHandler = useCallback(({ offset, duration }) => {
    window.jwpltx.seek(offset, duration);
  }, []);

  const seekedHandler = useCallback(() => {
    window.jwpltx.seeked();
  }, []);

  const playlistItemHandler = useCallback(() => {
    if (!analyticsToken) return;

    if (!item) {
      return;
    }

    window.jwpltx.ready(analyticsToken, window.location.hostname, feedId, item.mediaid, item.title);
  }, [item]);

  const completeHandler = useCallback(() => {
    window.jwpltx.complete();
  }, []);

  const adImpressionHandler = useCallback(() => {
    window.jwpltx.adImpression();
  }, []);

  useEffect(() => {
    if (!window.jwpltx || !analyticsToken || !player || !item) {
      return;
    }

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
  }, [player, item]);

  return setPlayer;
};

export default useOttAnalytics;
