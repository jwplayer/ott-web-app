import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useNavigate } from 'react-router';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';

export default function useMovieHandlers(nextItem: PlaylistItem | undefined, url: string) {
  const { config } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { features } = config;

  const navigate = useNavigate();
  const handleBack = () => navigate(url);

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
