import React, { useContext, useEffect, useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import PlaylistContainer from '../../containers/Playlist/PlaylistContainer';
import { useFavorites } from '../../stores/FavoritesStore';
import { ConfigContext } from '../../providers/ConfigProvider';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { cardUrl, movieURL, videoUrl } from '../../utils/formatting';
import type { PlaylistItem } from '../../../types/playlist';
import VideoComponent from '../../components/Video/Video';
import CardGrid from '../../components/CardGrid/CardGrid';
import useMedia from '../../hooks/useMedia';
import { generateMovieJSONLD } from '../../utils/structuredData';
import { copyToClipboard } from '../../utils/dom';

import styles from './Movie.module.scss';

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
  const history = useHistory();
  const { t } = useTranslation('video');
  const searchParams = new URLSearchParams(location.search);
  const { isLoading, error, data: item } = useMedia(id);
  const { data: trailerItem } = useMedia(item?.trailerId || '');

  const { hasItem, saveItem, removeItem } = useFavorites();
  const play = searchParams.get('play') === '1';
  const feedId = searchParams.get('l');
  const posterFading: boolean = config ? config.options.posterFading === true : false;

  const [hasShared, setHasShared] = useState<boolean>(false);
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);
  const enableSharing: boolean = config.options.enableSharing === true;

  useBlurImageUpdater(item);

  const isFavorited = !!item && hasItem(item);

  const startPlay = () => item && history.push(videoUrl(item, searchParams.get('r'), true));
  const goBack = () => item && history.push(videoUrl(item, searchParams.get('r'), false));

  const onCardClick = (item: PlaylistItem) => history.push(cardUrl(item));

  const playNext = (playlist: PlaylistItem[] | null) => {
    if (!item || !playlist) return;

    const index = playlist.findIndex(({ mediaid }) => mediaid === item.mediaid);
    const nextItem = playlist[index + 1];

    return nextItem && history.push(videoUrl(nextItem, searchParams.get('r'), true));
  };

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

  useEffect(() => {
    if (play) document.body.style.overflowY = 'hidden';
    return () => {
      if (play) document.body.style.overflowY = 'auto';
    };
  }, [play]);

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
        {item.tags.split(',').map((tag) => (
          <meta property="og:video:tag" content={tag} key={tag} />
        ))}
        {item ? <script type="application/ld+json">{generateMovieJSONLD(item)}</script> : null}
      </Helmet>
      <PlaylistContainer playlistId={config?.recommendationsPlaylist || ''} relatedItem={item}>
        {({ playlist, isLoading }) => (
          <VideoComponent
            title={item.title}
            item={item}
            feedId={feedId ?? undefined}
            trailerItem={trailerItem}
            play={play}
            startPlay={startPlay}
            goBack={goBack}
            onComplete={() => playNext(playlist.playlist)}
            poster={posterFading ? 'fading' : 'normal'}
            enableSharing={enableSharing}
            hasShared={hasShared}
            onShareClick={onShareClick}
            playTrailer={playTrailer}
            onTrailerClick={() => setPlayTrailer(true)}
            onTrailerClose={() => setPlayTrailer(false)}
            isFavorited={isFavorited}
            onFavoriteButtonClick={() => (isFavorited ? removeItem(item) : saveItem(item))}
          >
            {config.recommendationsPlaylist ? (
              <>
                <div className={styles.related}>
                  <h3>{playlist.title}</h3>
                </div>
                <CardGrid
                  playlist={playlist.playlist}
                  onCardClick={onCardClick}
                  isLoading={isLoading}
                  currentCardItem={item}
                  currentCardLabel={t('currently_playing')}
                />
              </>
            ) : undefined}
          </VideoComponent>
        )}
      </PlaylistContainer>
    </React.Fragment>
  );
};

export default Movie;
