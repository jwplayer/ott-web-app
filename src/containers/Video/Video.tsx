import { useHistory, useLocation } from 'react-router';
import React, { useContext } from 'react';
import type { Config } from 'types/Config';
import type { PlaylistItem } from 'types/playlist';

import { PersonalShelf, PersonalShelves } from '../../enum/PersonalShelf';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { ConfigContext } from '../../providers/ConfigProvider';
import VideoComponent from '../../components/Video/Video';
import { cardUrl, videoUrl } from '../../utils/formatting';
import usePlaylist from '../../hooks/usePlaylist';
import Shelf from '../Shelf/Shelf';
import { useFavorites } from '../../stores/FavoritesStore';

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
  const { hasItem, saveItem, removeItem } = useFavorites();
  const isAlternativeShelf = PersonalShelves.includes(playlistId as PersonalShelf);
  const play = new URLSearchParams(location.search).get('play') === '1';
  const config: Config = useContext(ConfigContext);
  const posterFading: boolean = config ? config.options.posterFading === true : false;

  const { isLoading, error, data: { playlist } = { playlist: [] } } = usePlaylist(
    playlistId,
    undefined,
    !isAlternativeShelf,
  );

  const updateBlurImage = useBlurImageUpdater(playlist);

  const getMovieItem = () => playlist.find((item) => item.mediaid === mediaId);
  const getSeriesItem = () => playlist[0];
  const item = videoType === 'movie' ? getMovieItem() : getSeriesItem();
  const isFavorited = !!item && hasItem(item);

  const startPlay = () => item && history.push(videoUrl(item, playlistId, true));
  const goBack = () => item && history.push(videoUrl(item, playlistId, false));

  const onCardClick = (item: PlaylistItem) => history.push(cardUrl(item));
  const onCardHover = (item: PlaylistItem) => updateBlurImage(item.image);

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
      isFavorited={isFavorited}
      onFavoriteButtonClick={() => (isFavorited ? removeItem(item) : saveItem(item))}
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
