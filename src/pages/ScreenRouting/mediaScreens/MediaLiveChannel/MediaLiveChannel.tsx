import { Navigate } from 'react-router-dom';

import type { ScreenComponent } from '#types/screens';
import { isLiveChannel } from '#src/utils/media';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import { liveChannelsURL } from '#src/utils/formatting';
import type { PlaylistItem } from '#types/playlist';
import Loading from '#src/pages/Loading/Loading';

const MediaLiveChannel: ScreenComponent<PlaylistItem> = ({ data, isLoading }) => {
  const liveChannelsId = isLiveChannel(data) ? data.liveChannelsId : undefined;

  if (!liveChannelsId) {
    return <ErrorPage title="Live channel not found" />;
  }

  // prevent rendering the Navigate component multiple times when we are loading data
  if (isLoading) {
    return <Loading />;
  }

  return <Navigate to={liveChannelsURL(liveChannelsId, data.mediaid)} replace />;
};

export default MediaLiveChannel;
