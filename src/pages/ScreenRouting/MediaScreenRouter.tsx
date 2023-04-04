import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import React from 'react';

import MediaStaticPage from './mediaScreens/MediaStaticPage/MediaStaticPage';

import useMedia from '#src/hooks/useMedia';
import Loading from '#src/pages/Loading/Loading';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import type { PlaylistItem } from '#types/playlist';
import { isEpisode, isDeprecatedSeriesFlow } from '#src/utils/media';
import MediaMovie from '#src/pages/ScreenRouting/mediaScreens/MediaMovie/MediaMovie';
import MediaSeries from '#src/pages/ScreenRouting/mediaScreens/MediaSeries/MediaSeries';
import MediaSeriesEpisode from '#src/pages/ScreenRouting/mediaScreens/MediaSeriesEpisode/MediaSeriesEpisode';
import MediaLiveChannel from '#src/pages/ScreenRouting/mediaScreens/MediaLiveChannel/MediaLiveChannel';
import { ScreenMap } from '#src/pages/ScreenRouting/ScreenMap';
import { CONTENT_TYPE, SERIES_CONTENT_TYPE } from '#src/config';

export const mediaScreenMap = new ScreenMap<PlaylistItem>();

// Register media screens

// Register all series screens
Object.keys(SERIES_CONTENT_TYPE).forEach((type) => {
  mediaScreenMap.registerByContentType(MediaSeries, type);
});
mediaScreenMap.registerByContentType(MediaSeriesEpisode, CONTENT_TYPE.episode);
mediaScreenMap.registerByContentType(MediaLiveChannel, CONTENT_TYPE.livechannel);
mediaScreenMap.registerByContentType(MediaStaticPage, CONTENT_TYPE.page);
mediaScreenMap.registerDefault(MediaMovie);

// Register legacy series and episode screens when `contentType` is missing
mediaScreenMap.register(MediaSeriesEpisode, (item) => !!item && isEpisode(item));
mediaScreenMap.register(MediaSeries, (item) => !!item && isDeprecatedSeriesFlow(item));

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
