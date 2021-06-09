import { useHistory, useLocation } from 'react-router';
import React, { useContext, useEffect } from 'react';
import type { Config } from 'types/Config';
import type { PlaylistItem } from 'types/playlist';

import { UIStateContext } from '../../providers/uiStateProvider';
import { ConfigContext } from '../../providers/ConfigProvider';
import VideoComponent from '../../components/Video/Video';
import { cardUrl, videoUrl } from '../../utils/formatting';
import usePlaylist, { UsePlaylistResult } from '../../hooks/usePlaylist';
import Shelf from '../Shelf/Shelf';

export type VideoType = 'movie' | 'series';

export type VideoProps = {
  playlistId: string;
  videoType: VideoType;
  episodeId?: string | null;
  mediaId?: string | null;
};

const Video = ({ playlistId, videoType, episodeId, mediaId }: VideoProps): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const { updateBlurImage } = useContext(UIStateContext);
  const play = new URLSearchParams(location.search).get('play') === '1';
  const config: Config = useContext(ConfigContext);
  const posterFading: boolean = config ? config.options.posterFading === true : false;

  const { isLoading, error, data: playlist }: UsePlaylistResult = usePlaylist(playlistId);

  const getMovieItem = () => playlist?.playlist?.find((item) => item.mediaid === mediaId);
  const getSeriesItem = () => playlist?.playlist[0];
  const item = videoType === 'movie' ? getMovieItem() : getSeriesItem();

  const startPlay = () => item && history.push(videoUrl(item, playlistId, true));
  const goBack = () => item && history.push(videoUrl(item, playlistId, false));

  const onCardClick = (item: PlaylistItem) => history.push(cardUrl(item));
  const onCardHover = (item: PlaylistItem) => updateBlurImage(item.image);

  useEffect(() => item && updateBlurImage(item.image), [item, updateBlurImage]);

  //todo: series andere playlist
  //todo: currently playing in recommended

  //temp:
  console.info({ episodeId });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading list</p>;
  if (!playlist) return <p>List not found</p>;
  if (!item) return <p>Can not find medium</p>;

  return (
    <VideoComponent
      item={item}
      play={play}
      startPlay={startPlay}
      goBack={goBack}
      poster={posterFading ? 'fading' : 'normal'}
      relatedShelf={
        config.recommendationsPlaylist ? (
          <Shelf
            playlistId={config.recommendationsPlaylist}
            onCardClick={onCardClick}
            onCardHover={onCardHover}
            relatedMediaId={item.mediaid}
          />
        ) : undefined
      }
    />
  );
};

export default Video;
