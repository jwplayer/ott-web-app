import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import React from 'react';
import type { PlaylistItem } from '@jwplayer/ott-common/types/playlist';
import { isEpisode, isLegacySeriesFlow } from '@jwplayer/ott-common/src/utils/media';
import { CONTENT_TYPE } from '@jwplayer/ott-common/src/constants';

import useMedia from '../../hooks/useMedia';
import Loading from '../Loading/Loading';
import ErrorPage from '../../components/ErrorPage/ErrorPage';

import MediaStaticPage from './mediaScreens/MediaStaticPage/MediaStaticPage';
import MediaMovie from './mediaScreens/MediaMovie/MediaMovie';
import MediaSeries from './mediaScreens/MediaSeries/MediaSeries';
import MediaLiveChannel from './mediaScreens/MediaLiveChannel/MediaLiveChannel';
import MediaEpisode from './mediaScreens/MediaEpisode/MediaEpisode';
import { ScreenMap } from './ScreenMap';

export const mediaScreenMap = new ScreenMap<PlaylistItem>();

// Register media screens
mediaScreenMap.registerByContentType(MediaSeries, CONTENT_TYPE.series);
mediaScreenMap.registerByContentType(MediaEpisode, CONTENT_TYPE.episode);
mediaScreenMap.registerByContentType(MediaLiveChannel, CONTENT_TYPE.livechannel);
mediaScreenMap.registerByContentType(MediaStaticPage, CONTENT_TYPE.page);
mediaScreenMap.registerDefault(MediaMovie);

// Register legacy series and episode screens when `contentType` is missing
mediaScreenMap.register(MediaEpisode, (item) => !!item && isEpisode(item));
mediaScreenMap.register(MediaSeries, (item) => !!item && isLegacySeriesFlow(item));

const MediaScreenRouter = () => {
  const params = useParams();
  const id = params.id || '';
  const { isLoading, isFetching, error, data } = useMedia(id);
  const { t } = useTranslation('error');

  if (isLoading) {
    return <Loading />;
  }

  if (error || !data) {
    return <ErrorPage title={t('video_not_found')} />;
  }

  const MediaScreen = mediaScreenMap.getScreen(data);

  return <MediaScreen data={data} isLoading={isFetching} />;
};

export default MediaScreenRouter;
