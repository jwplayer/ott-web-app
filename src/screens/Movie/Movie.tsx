import React, { useContext } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Helmet } from 'react-helmet';

import { useFavorites } from '../../stores/FavoritesStore';
import { ConfigContext } from '../../providers/ConfigProvider';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { cardUrl, videoUrl } from '../../utils/formatting';
import type { PlaylistItem } from '../../../types/playlist';
import VideoComponent from '../../components/Video/Video';
import Shelf from '../../containers/Shelf/Shelf';
import useMedia from '../../hooks/useMedia';

type MovieRouteParams = {
  id: string;
};

const Movie = (
  {
    match: {
      params: { id },
    },
    location,
  }: RouteComponentProps<MovieRouteParams>): JSX.Element => {
  const config = useContext(ConfigContext);
  const searchParams = new URLSearchParams(location.search);
  const { isLoading, error, data: item } = useMedia(id);

  const history = useHistory();
  const { hasItem, saveItem, removeItem } = useFavorites();
  const play = searchParams.get('play') === '1';
  const posterFading: boolean = config ? config.options.posterFading === true : false;

  useBlurImageUpdater(item);

  const isFavorited = !!item && hasItem(item);

  const startPlay = () => item && history.push(videoUrl(item, searchParams.get('r'), true));
  const goBack = () => item && history.push(videoUrl(item, searchParams.get('r'), false));

  const onCardClick = (item: PlaylistItem) => history.push(cardUrl(item));

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading list</p>;
  if (!item) return <p>Can not find medium</p>;

  return (
    <React.Fragment>
      <Helmet>
        <title>{item.title} - {config.siteName}</title>
        <meta name="description" content={item.description} />
        <meta property="og:description" content={item.description} />
        <meta property="og:title" content={`${item.title} - ${config.siteName}`} />
        <meta property="og:type" content="video.other" />
        {item.image && <meta property="og:image" content={item.image?.replace(/^https:/, 'http:')} />}
        {item.image && <meta property="og:image:secure_url" content={item.image?.replace(/^http:/, 'https:')} />}
        <meta property="og:image:width" content={item.image ? '720' : ''} />
        <meta property="og:image:height" content={item.image ? '406' : ''} />
        <meta name="twitter:title" content={`${item.title} - ${config.siteName}`} />
        <meta name="twitter:description" content={item.description} />
        <meta name="twitter:image" content={item.image} />
        <meta property="og:video" content={window.location.href} />
        <meta property="og:video:secure_url" content={window.location.href} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {item.tags.split(',').map(tag => <meta property="og:video:tag" content={tag} key={tag} />)}
      </Helmet>
      <VideoComponent
        item={item}
        play={play}
        startPlay={startPlay}
        goBack={goBack}
        poster={posterFading ? 'fading' : 'normal'}
        isFavorited={isFavorited}
        onFavoriteButtonClick={() => isFavorited ? removeItem(item) : saveItem(item)}
        relatedShelf={
          config.recommendationsPlaylist ? (
            <Shelf
              playlistId={config.recommendationsPlaylist}
              onCardClick={onCardClick}
              relatedMediaId={item.mediaid}
            />
          ) : undefined
        }
      />
    </React.Fragment>
  );
};

export default Movie;
