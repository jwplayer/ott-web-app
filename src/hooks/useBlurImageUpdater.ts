import { useCallback, useEffect } from 'react';

import { useUIStore } from '#src/stores/UIStore';
import type { PlaylistItem } from '#types/playlist';
import { getBackgroundItemImages } from '#src/stores/ConfigController';

const useBlurImageUpdater = (data?: PlaylistItem[] | PlaylistItem) => {
  useEffect(() => {
    const targetItem = Array.isArray(data) ? data?.[0] : data;

    if (!targetItem?.image) return;

    const [image, fallbackImage] = getBackgroundItemImages(targetItem, 720);

    useUIStore.setState({
      blurImage: image,
      blurFallbackImage: fallbackImage,
    });
  }, [data]);

  return useCallback((item: PlaylistItem | string) => {
    if (typeof item === 'string') {
      return useUIStore.setState({
        blurImage: item,
        blurFallbackImage: undefined,
      });
    }

    const [image, fallbackImage] = getBackgroundItemImages(item, 720);

    useUIStore.setState({
      blurImage: image,
      blurFallbackImage: fallbackImage,
    });
  }, []);
};

export default useBlurImageUpdater;
