import { useCallback, useEffect } from 'react';

import { useUIStore } from '#src/stores/UIStore';
import type { PlaylistItem } from '#types/playlist';

const useBlurImageUpdater = (data?: PlaylistItem[] | PlaylistItem) => {
  useEffect(() => {
    const targetItem = Array.isArray(data) ? data?.[0] : data;

    if (!targetItem) return;

    useUIStore.setState({
      blurImage: targetItem.backgroundImage,
    });
  }, [data]);

  return useCallback((item: PlaylistItem | string) => {
    if (typeof item === 'string') {
      return useUIStore.setState({
        blurImage: { image: item, fallbackImage: item },
      });
    }

    useUIStore.setState({
      blurImage: item.backgroundImage,
    });
  }, []);
};

export default useBlurImageUpdater;
