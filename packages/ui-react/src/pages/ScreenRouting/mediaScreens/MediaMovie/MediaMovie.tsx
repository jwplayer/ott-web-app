import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import type { ScreenComponent } from '@jwp/ott-ui-react/types/screens';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';

import MediaMovieCinema from './MediaMovieCinema';
import MediaMovieInline from './MediaMovieInline';

const MediaMovie: ScreenComponent<PlaylistItem> = ({ data, isLoading }) => {
  const inlineLayout = useConfigStore((s) => !!s.config?.custom?.inlinePlayer);
  return inlineLayout ? <MediaMovieInline data={data} isLoading={isLoading} /> : <MediaMovieCinema data={data} isLoading={isLoading} />;
};

export default MediaMovie;
