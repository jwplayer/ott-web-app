import React, { Suspense } from 'react';
import { useParams } from 'react-router';

import usePlaylist from '#src/hooks/usePlaylist';
import ErrorPage from '#src/components/ErrorPage/ErrorPage';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';

const GridLayout = React.lazy(() => import('#src/containers/PlaylistGrid/PlaylistGrid'));
const LiveChannelsLayout = React.lazy(() => import('#src/containers/PlaylistLiveChannels/PlaylistLiveChannels'));

function Playlist() {
  const params = useParams();
  const id = params.id || '';
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
