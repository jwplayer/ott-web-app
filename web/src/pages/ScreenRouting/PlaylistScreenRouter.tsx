import React from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Playlist } from '@jwplayer/ott-common/types/playlist';
import { CONTENT_TYPE } from '@jwplayer/ott-common/src/constants';

import Loading from '../Loading/Loading';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import usePlaylist from '../../hooks/usePlaylist';

import PlaylistGrid from './playlistScreens/PlaylistGrid/PlaylistGrid';
import PlaylistLiveChannels from './playlistScreens/PlaylistLiveChannels/PlaylistLiveChannels';
import { ScreenMap } from './ScreenMap';

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
