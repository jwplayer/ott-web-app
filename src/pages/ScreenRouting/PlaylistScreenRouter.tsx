import React from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import Loading from '#src/pages/Loading/Loading';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import usePlaylist from '#src/hooks/usePlaylist';
import type { Playlist } from '#types/playlist';
import PlaylistGrid from '#src/pages/ScreenRouting/playlistScreens/PlaylistGrid/PlaylistGrid';
import PlaylistLiveChannels from '#src/pages/ScreenRouting/playlistScreens/PlaylistLiveChannels/PlaylistLiveChannels';
import { ScreenMap } from '#src/pages/ScreenRouting/ScreenMap';
import { CONTENT_TYPE } from '#src/config';

export const playlistScreenMap = new ScreenMap<Playlist>();

// register playlist screens
playlistScreenMap.registerByContentType(PlaylistLiveChannels, CONTENT_TYPE.live);
playlistScreenMap.registerDefault(PlaylistGrid);

const PlaylistScreenRouter = () => {
  const params = useParams();
  const id = params.id || '';
  const { isLoading, isFetching, error, data } = usePlaylist(id);
  const { t } = useTranslation('error');

  if (isLoading) {
    return <Loading />;
  }

  if (error || !data) {
    return <ErrorPage title={t('playlist_not_found')} />;
  }

  const PlaylistScreen = playlistScreenMap.getScreen(data);

  return <PlaylistScreen data={data} isLoading={isFetching} />;
};

export default PlaylistScreenRouter;
