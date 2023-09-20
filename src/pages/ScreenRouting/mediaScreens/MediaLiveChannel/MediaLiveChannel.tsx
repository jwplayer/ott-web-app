import { useNavigate } from 'react-router';

import type { ScreenComponent } from '#types/screens';
import { isLiveChannel } from '#src/utils/media';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import { liveChannelsURL } from '#src/utils/formatting';
import type { PlaylistItem } from '#types/playlist';
import Loading from '#src/pages/Loading/Loading';

const MediaLiveChannel: ScreenComponent<PlaylistItem> = ({ data, isLoading }) => {
  const liveChannelsId = isLiveChannel(data) ? data.liveChannelsId : undefined;
  const navigate = useNavigate();

  if (!liveChannelsId) {
    return <ErrorPage title="Live channel not found" />;
  }

  if (data && !isLoading) {
    navigate(liveChannelsURL(liveChannelsId, data.mediaid), { replace: true });
  }

  return <Loading />;
};

export default MediaLiveChannel;
