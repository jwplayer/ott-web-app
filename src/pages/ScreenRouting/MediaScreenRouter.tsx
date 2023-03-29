import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import React from 'react';

import MediaStaticPage from './mediaScreens/MediaStaticPage/MediaStaticPage';

import useMedia from '#src/hooks/useMedia';
import Loading from '#src/pages/Loading/Loading';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import type { PlaylistItem } from '#types/playlist';
import { isEpisode, isSeriesPlaceholder } from '#src/utils/media';
import MediaMovie from '#src/pages/ScreenRouting/mediaScreens/MediaMovie/MediaMovie';
import MediaSeries from '#src/pages/ScreenRouting/mediaScreens/MediaSeries/MediaSeries';
import MediaSeriesEpisode from '#src/pages/ScreenRouting/mediaScreens/MediaSeriesEpisode/MediaSeriesEpisode';
import MediaLiveChannel from '#src/pages/ScreenRouting/mediaScreens/MediaLiveChannel/MediaLiveChannel';
import { ScreenMap } from '#src/pages/ScreenRouting/ScreenMap';

export const mediaScreenMap = new ScreenMap<PlaylistItem>();

// register media screens
mediaScreenMap.registerByContentType(MediaSeries, 'series');
mediaScreenMap.registerByContentType(MediaSeriesEpisode, 'episode');
mediaScreenMap.registerByContentType(MediaLiveChannel, 'livechannel');
mediaScreenMap.registerByContentType(MediaStaticPage, 'page');
mediaScreenMap.registerDefault(MediaMovie);

// register legacy series and episode screens when `contentType` is missing
mediaScreenMap.register(MediaSeriesEpisode, (item) => !!item && isEpisode(item));
mediaScreenMap.register(MediaSeries, (item) => !!item && isSeriesPlaceholder(item));

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
