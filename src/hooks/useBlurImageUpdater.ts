import { useCallback, useEffect } from 'react';

import { UIStore } from '../stores/UIStore';
import type { PlaylistItem } from '../../types/playlist';

const useBlurImageUpdater = (data?: PlaylistItem[] | PlaylistItem) => {
  useEffect(() => {
    const targetItem = Array.isArray(data) ? data?.[0] : data;

    if (!targetItem?.image) return;

    UIStore.update((state) => {
      state.blurImage = targetItem.image;
    });
  }, [data]);

  return useCallback((image: string) => {
    if (image) {
      UIStore.update((state) => {
        state.blurImage = image;
      });
    }
  }, []);
};

export default useBlurImageUpdater;
