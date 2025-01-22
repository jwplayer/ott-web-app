import React from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Playlist } from '@jwp/ott-common/types/playlist';
import { APP_CONFIG_ITEM_TYPE, PLAYLIST_CONTENT_TYPE } from '@jwp/ott-common/src/constants';
import { ScreenMap } from '@jwp/ott-common/src/utils/ScreenMap';
import usePlaylist from '@jwp/ott-hooks-react/src/usePlaylist';
import type { AppMenuType } from '@jwp/ott-common/types/config';

import Loading from '../Loading/Loading';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import type { ScreenComponent } from '../../../types/screens';
import Fade from '../../components/Animation/Fade/Fade';

import PlaylistGrid from './playlistScreens/PlaylistGrid/PlaylistGrid';
import PlaylistLiveChannels from './playlistScreens/PlaylistLiveChannels/PlaylistLiveChannels';

export const playlistScreenMap = new ScreenMap<Playlist, ScreenComponent<Playlist>>();
export const contentScreenMap = new ScreenMap<Playlist, ScreenComponent<Playlist>>();

// register playlist screens
playlistScreenMap.registerDefault(PlaylistGrid);
playlistScreenMap.registerByContentType(PlaylistLiveChannels, PLAYLIST_CONTENT_TYPE.live);

// register content list screens
contentScreenMap.registerDefault(PlaylistGrid);

const PlaylistScreenRouter = ({ type }: { type: AppMenuType }) => {
  const params = useParams();
  const id = params.id || '';

  const { isFetching, error, data } = usePlaylist(id, {}, true, true, type);
  const { t } = useTranslation('error');

  if (isFetching) {
    return <Loading />;
  }

  if (error || !data) {
    return <ErrorPage title={t('playlist_not_found')} />;
  }

  if (data.playlist.length === 0) {
    return <ErrorPage title={t('empty_shelves_heading')} message={t('empty_shelves_description')} />;
  }

  const Screen = type === APP_CONFIG_ITEM_TYPE.content_list ? contentScreenMap.getScreen(data) : playlistScreenMap.getScreen(data);

  return (
    <Fade key={id} open>
      <Screen data={data} isLoading={isFetching} />
    </Fade>
  );
};

export default PlaylistScreenRouter;
