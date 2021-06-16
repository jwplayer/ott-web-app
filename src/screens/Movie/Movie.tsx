import React, { useContext, useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Helmet } from 'react-helmet';

import { useFavorites } from '../../stores/FavoritesStore';
import { ConfigContext } from '../../providers/ConfigProvider';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { cardUrl, movieURL, videoUrl } from '../../utils/formatting';
import type { PlaylistItem } from '../../../types/playlist';
import VideoComponent from '../../components/Video/Video';
import Shelf from '../../containers/Shelf/Shelf';
import useMedia from '../../hooks/useMedia';
import { generateMovieJSONLD } from '../../utils/structuredData';
import { copyToClipboard } from '../../utils/dom';

type MovieRouteParams = {
  id: string;
};

const Movie = ({
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

  const [hasShared, setHasShared] = useState<boolean>(false);
  const enableSharing: boolean = config.options.enableSharing === true;

  useBlurImageUpdater(item);

  const isFavorited = !!item && hasItem(item);

  const startPlay = () => item && history.push(videoUrl(item, searchParams.get('r'), true));
  const goBack = () => item && history.push(videoUrl(item, searchParams.get('r'), false));

  const onCardClick = (item: PlaylistItem) => history.push(cardUrl(item));

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
  if (!item) return <p>Can not find medium</p>;

  const pageTitle = `${item.title} - ${config.siteName}`;
  const canonicalUrl = item ? `${window.location.origin}${movieURL(item)}` : window.location.href;

  return (
    <React.Fragment>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={item.description} />
        <meta property="og:description" content={item.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content="video.other" />
        {item.image && <meta property="og:image" content={item.image?.replace(/^https:/, 'http:')} />}
        {item.image && <meta property="og:image:secure_url" content={item.image?.replace(/^http:/, 'https:')} />}
        <meta property="og:image:width" content={item.image ? '720' : ''} />
        <meta property="og:image:height" content={item.image ? '406' : ''} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={item.description} />
        <meta name="twitter:image" content={item.image} />
        <meta property="og:video" content={canonicalUrl.replace(/^https:/, 'http:')} />
        <meta property="og:video:secure_url" content={canonicalUrl.replace(/^http:/, 'https:')} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {item.tags.split(',').map(tag => <meta property="og:video:tag" content={tag} key={tag} />)}
        {item ? <script type="application/ld+json">{generateMovieJSONLD(item)}</script> : null}
      </Helmet>
      <VideoComponent
        item={item}
        play={play}
        startPlay={startPlay}
        goBack={goBack}
        poster={posterFading ? 'fading' : 'normal'}
        enableSharing={enableSharing}
        hasShared={hasShared}
        onShareClick={onShareClick}
        isFavorited={isFavorited}
        onFavoriteButtonClick={() => (isFavorited ? removeItem(item) : saveItem(item))}
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
