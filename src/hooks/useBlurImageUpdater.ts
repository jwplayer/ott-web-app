import { useEffect } from 'react';

import { UIStore } from '../state/UIStore';
import type { PlaylistItem } from '../../types/playlist';

const useBlurImageUpdater = (playlist: PlaylistItem[]) => {
  useEffect(() => {
    if (!playlist.length) return;

    const { image } = playlist?.[0];

    if (image) {
      UIStore.update((state) => {
        state.blurImage = image;
      });
    }
  }, [playlist]);

  return (image: string) =>
    image &&
    UIStore.update((state) => {
      state.blurImage = image;
    });
};

export default useBlurImageUpdater;
