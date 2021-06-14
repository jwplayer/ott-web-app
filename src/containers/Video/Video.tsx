import { useHistory, useLocation } from 'react-router';
import React, { useContext, useState } from 'react';
import type { Config } from 'types/Config';
import type { PlaylistItem } from 'types/playlist';

import useMedia from '../../hooks/useMedia';
import { copyToClipboard } from '../../utils/dom';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { ConfigContext } from '../../providers/ConfigProvider';
import VideoComponent from '../../components/Video/Video';
import { cardUrl, videoUrl } from '../../utils/formatting';
import usePlaylist from '../../hooks/usePlaylist';
import CardGrid from '../../components/CardGrid/CardGrid';

export type VideoType = 'movie' | 'series';

export type VideoProps = {
  mediaId: string;
  videoType: VideoType;
  playlistId?: string;
  episodeId?: string | null;
};

const Video = ({ mediaId, playlistId, videoType, episodeId }: VideoProps): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const play = new URLSearchParams(location.search).get('play') === '1';
  const config: Config = useContext(ConfigContext);
  const [hasShared, setHasShared] = useState<boolean>(false);
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);
  const enableSharing: boolean = config.options.enableSharing === true;
  const posterFading: boolean = config.options.posterFading === true;

  const { isLoading, error, data: media } = useMedia(mediaId);
  const item: PlaylistItem = media?.playlist?.[0];

  const { data: trailerMedia } = useMedia(item?.trailerId || '');
  const trailerItem: PlaylistItem = trailerMedia?.playlist[0];

  const { data: { playlist } = { playlist: [] } } = usePlaylist(config.recommendationsPlaylist || '', mediaId);
  const updateBlurImage = useBlurImageUpdater(playlist);

  const startPlay = () => item && history.push(videoUrl(item, playlistId, true));
  const goBack = () => item && history.push(videoUrl(item, playlistId, false));

  const onCardClick = (item: PlaylistItem) => history.push(cardUrl(item));
  const onCardHover = (item: PlaylistItem) => updateBlurImage(item.image);

  const onShareClick = (): void => {
    if (!item) return;

    if (typeof navigator.share === 'function') {
      navigator.share({ title: item.title, text: item.description, url: window.location.href });
    } else {
      copyToClipboard(window.location.href);
    }
    setHasShared(true);
    setTimeout(() => setHasShared(false), 2000);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading list</p>;
  if (!playlist) return <p>List not found</p>;
  if (!item) return <p>Can not find medium</p>;

  if (episodeId || videoType) {
    //todo
  }

  return (
    <VideoComponent
      item={item}
      trailerItem={trailerItem}
      play={play}
      startPlay={startPlay}
      goBack={goBack}
      poster={posterFading ? 'fading' : 'normal'}
      enableSharing={enableSharing}
      hasShared={hasShared}
      onShareClick={onShareClick}
      playTrailer={playTrailer}
      onTrailerClick={() => setPlayTrailer(true)}
      onTrailerClose={() => setPlayTrailer(false)}
      relatedShelf={
        config.recommendationsPlaylist ? (
          <CardGrid playlist={playlist} onCardClick={onCardClick} onCardHover={onCardHover} isLoading={isLoading} />
        ) : undefined
      }
    />
  );
};

export default Video;
