import { useHistory, useLocation } from 'react-router';
import React from 'react';

import VideoComponent from '../../components/Video/Video';
import { videoUrl } from '../../utils/formatting';
import usePlaylist, { UsePlaylistResult } from '../../hooks/usePlaylist';

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
  const play = new URLSearchParams(location.search).get('play') === '1';

  const { isLoading, error, data: playlist }: UsePlaylistResult = usePlaylist(playlistId);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading list</p>;
  if (!playlist) return <p>List not found</p>;

  const getMovieItem = () => playlist.playlist.find((item) => item.mediaid === mediaId);
  const getSeriesItem = () => playlist.playlist[0];
  const item = videoType === 'movie' ? getMovieItem() : getSeriesItem();

  if (!item) return <p>Can not find medium</p>;

  const startPlay = () => history.push(videoUrl(item, playlistId, true));
  const goBack = () => history.push(videoUrl(item, playlistId, false));

  console.info({ videoType, play, episodeId });

  return <VideoComponent item={item} play={play} startPlay={startPlay} goBack={goBack} />;
};

export default Video;
