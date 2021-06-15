import { useEffect } from 'react';

import { UIStore } from '../stores/UIStore';
import type { PlaylistItem } from '../../types/playlist';

const useBlurImageUpdater = (playlist: PlaylistItem[] | null, item?: PlaylistItem | null) => {
  useEffect(() => {
    const targetItem = playlist?.[0] || item;

    if (!targetItem?.image) return;

    UIStore.update((state) => {
      state.blurImage = targetItem.image;
    });
  }, [playlist]);

  return (image: string) =>
    image &&
    UIStore.update((state) => {
      state.blurImage = image;
    });
};

export default useBlurImageUpdater;
