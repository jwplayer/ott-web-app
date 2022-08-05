import React, { Suspense } from 'react';
import type { RouteComponentProps } from 'react-router-dom';

import usePlaylist from '#src/hooks/usePlaylist';
import ErrorPage from '#src/components/ErrorPage/ErrorPage';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';

const GridLayout = React.lazy(() => import('#src/containers/PlaylistGrid/PlaylistGrid'));
const LiveChannelsLayout = React.lazy(() => import('#src/containers/PlaylistLiveChannels/PlaylistLiveChannels'));

type PlaylistRouteParams = {
  id: string;
};

function Playlist({
  match: {
    params: { id },
  },
}: RouteComponentProps<PlaylistRouteParams>) {
  const { isLoading, isPlaceholderData, error, data: playlist } = usePlaylist(id);

  if (isLoading || isPlaceholderData) {
    return <LoadingOverlay transparentBackground />;
  }

  if (error || !playlist) {
    return <ErrorPage title="Playlist not found!" />;
  }

  // routing
  const layout = playlist.contentType === 'Live' ? <LiveChannelsLayout playlist={playlist} /> : <GridLayout playlist={playlist} />;

  return <Suspense fallback={<LoadingOverlay transparentBackground />}>{layout}</Suspense>;
}

export default Playlist;
