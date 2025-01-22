import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import React from 'react';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { isEpisode, isLegacySeriesFlow } from '@jwp/ott-common/src/utils/media';
import { MEDIA_CONTENT_TYPE } from '@jwp/ott-common/src/constants';
import { ScreenMap } from '@jwp/ott-common/src/utils/ScreenMap';
import useMedia from '@jwp/ott-hooks-react/src/useMedia';

import type { ScreenComponent } from '../../../types/screens';
import Loading from '../Loading/Loading';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import Fade from '../../components/Animation/Fade/Fade';

import MediaStaticPage from './mediaScreens/MediaStaticPage/MediaStaticPage';
import MediaMovie from './mediaScreens/MediaMovie/MediaMovie';
import MediaSeries from './mediaScreens/MediaSeries/MediaSeries';
import MediaLiveChannel from './mediaScreens/MediaLiveChannel/MediaLiveChannel';
import MediaEpisode from './mediaScreens/MediaEpisode/MediaEpisode';
import MediaEvent from './mediaScreens/MediaEvent/MediaEvent';

export const mediaScreenMap = new ScreenMap<PlaylistItem, ScreenComponent<PlaylistItem>>();

// Register media screens
mediaScreenMap.registerByContentType(MediaSeries, MEDIA_CONTENT_TYPE.series);
mediaScreenMap.registerByContentType(MediaEpisode, MEDIA_CONTENT_TYPE.episode);
mediaScreenMap.registerByContentType(MediaLiveChannel, MEDIA_CONTENT_TYPE.liveChannel);
mediaScreenMap.registerByContentType(MediaEvent, MEDIA_CONTENT_TYPE.liveEvent);
mediaScreenMap.registerByContentType(MediaStaticPage, MEDIA_CONTENT_TYPE.page);
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

  return (
    <Fade open>
      <MediaScreen data={data} isLoading={isFetching} />
    </Fade>
  );
};

export default MediaScreenRouter;
