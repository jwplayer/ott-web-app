import type { PlaylistItem } from '@jwp/ott-common-next/types/playlist';
import { shallow } from '@jwp/ott-common-next/src/utils/compare';
import { useConfigStore } from '@jwp/ott-common-next/src/stores/ConfigStore';
import { mediaURL } from '@jwp/ott-common-next/src/utils/urlFormatting';
import useEventCallback from '@jwp/ott-hooks-react-next/src/useEventCallback';
import { useRouter } from 'next/navigation';

export default function useMovieHandlers(nextItem: PlaylistItem | undefined) {
  const { config } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { features } = config;

  const router = useRouter();
  const navigate = router.push;
  const handleBack = router.back;

  const handleComplete = useEventCallback(() => {
    if (nextItem) {
      navigate(mediaURL({ id: nextItem.mediaid, title: nextItem.title, playlistId: features?.recommendationsPlaylist, play: true }));
    }
  });

  return {
    handleBack,
    handleComplete,
  };
}
