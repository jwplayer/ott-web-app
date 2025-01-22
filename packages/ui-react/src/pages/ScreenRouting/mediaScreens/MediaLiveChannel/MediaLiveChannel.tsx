import { Navigate } from 'react-router-dom';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { liveChannelsURL } from '@jwp/ott-common/src/utils/urlFormatting';

import type { ScreenComponent } from '../../../../../types/screens';
import Loading from '../../../Loading/Loading';
import MediaMovie from '../MediaMovie/MediaMovie';

const MediaLiveChannel: ScreenComponent<PlaylistItem> = ({ data, isLoading }) => {
  const liveChannelsId = data.liveChannelsId;

  if (isLoading) {
    return <Loading />;
  }

  // this live channel is part of a live channels (TV Guide) page
  if (liveChannelsId) {
    return <Navigate to={liveChannelsURL(liveChannelsId, data.mediaid)} replace={true}></Navigate>;
  }

  // this live channel is "just" a media item
  return <MediaMovie data={data} isLoading={isLoading} />;
};

export default MediaLiveChannel;
