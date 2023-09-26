import { useNavigate } from 'react-router';
import { useEffect } from 'react';

import type { ScreenComponent } from '#types/screens';
import { isLiveChannel } from '#src/utils/media';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import { liveChannelsURL } from '#src/utils/formatting';
import type { PlaylistItem } from '#types/playlist';
import Loading from '#src/pages/Loading/Loading';

const MediaLiveChannel: ScreenComponent<PlaylistItem> = ({ data, isLoading }) => {
  const liveChannelsId = isLiveChannel(data) ? data.liveChannelsId : undefined;
  const navigate = useNavigate();

  useEffect(() => {
    if (data && !isLoading && liveChannelsId) {
      navigate(liveChannelsURL(liveChannelsId, data.mediaid), { replace: true });
    }
  }, [data, isLoading, liveChannelsId, navigate]);

  if (!liveChannelsId) {
    return <ErrorPage title="Live channel not found" />;
  }

  return <Loading />;
};

export default MediaLiveChannel;
