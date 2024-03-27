import { Navigate } from 'react-router-dom';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { isLiveChannel } from '@jwp/ott-common/src/utils/media';
import { liveChannelsURL } from '@jwp/ott-common/src/utils/urlFormatting';

import type { ScreenComponent } from '../../../../../types/screens';
import ErrorPage from '../../../../components/ErrorPage/ErrorPage';
import Loading from '../../../Loading/Loading';

const MediaLiveChannel: ScreenComponent<PlaylistItem> = ({ data, isLoading }) => {
  const liveChannelsId = isLiveChannel(data) ? data.liveChannelsId : undefined;

  if (data && !isLoading && liveChannelsId) {
    return <Navigate to={liveChannelsURL(liveChannelsId, data.mediaid)} replace={true}></Navigate>;
  }

  if (!liveChannelsId) {
    return <ErrorPage title="Live channel not found" />;
  }

  return <Loading />;
};

export default MediaLiveChannel;
