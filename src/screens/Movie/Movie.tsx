import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import { useFavorites } from '../../stores/FavoritesStore';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { cardUrl, movieURL, videoUrl } from '../../utils/formatting';
import type { PlaylistItem } from '../../../types/playlist';
import VideoComponent from '../../components/Video/Video';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import CardGrid from '../../components/CardGrid/CardGrid';
import useMedia from '../../hooks/useMedia';
import { generateMovieJSONLD } from '../../utils/structuredData';
import { copyToClipboard } from '../../utils/dom';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import useRecommendedPlaylist from '../../hooks/useRecommendationsPlaylist';
import { watchHistoryStore } from '../../stores/WatchHistoryStore';
import { VideoProgressMinMax } from '../../config';
import { ConfigStore } from '../../stores/ConfigStore';
import { useAccountStore } from '../../stores/AccountStore';
import { addQueryParam } from '../../utils/history';
import { isAllowedToWatch } from '../../utils/cleeng';
import { addConfigParamToUrl } from '../../utils/configOverride';

import styles from './Movie.module.scss';

type MovieRouteParams = {
  id: string;
};

const Movie = ({ match, location }: RouteComponentProps<MovieRouteParams>): JSX.Element => {
  // Routing
  const history = useHistory();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const id = match?.params.id;
  const play = searchParams.get('play') === '1';
  const feedId = searchParams.get('l');

  // Config
  const { options, recommendationsPlaylist, siteName } = ConfigStore.useState((s) => s.config);
  const accessModel = ConfigStore.useState((s) => s.accessModel);
  const posterFading: boolean = options?.posterFading === true;
  const enableSharing: boolean = options?.enableSharing === true;

  const { t } = useTranslation('video');

  // Media
  const { isLoading, error, data: item } = useMedia(id);
  const itemRequiresSubscription = item?.requiresSubscription !== 'false';
  useBlurImageUpdater(item);
  const { data: trailerItem } = useMedia(item?.trailerId || '');
  const { data: playlist } = useRecommendedPlaylist(recommendationsPlaylist || '', item);

  const { hasItem, saveItem, removeItem } = useFavorites();

  const watchHistory = watchHistoryStore.useState((s) => s.watchHistory);
  const watchHistoryItem =
    item &&
    watchHistory.find(({ mediaid, progress }) => {
      return mediaid === item.mediaid && progress > VideoProgressMinMax.Min && progress < VideoProgressMinMax.Max;
    });
  const progress = watchHistoryItem?.progress;

  // General state
  const isFavorited = !!item && hasItem(item);
  const [hasShared, setHasShared] = useState<boolean>(false);
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);

  // User
  const user = useAccountStore((state) => state.user);
  const subscription = useAccountStore((state) => state.subscription);
  const allowedToWatch = isAllowedToWatch(accessModel, !!user, itemRequiresSubscription, !!subscription);

  // Handlers
  const goBack = () => item && history.push(videoUrl(item, searchParams.get('r'), false));
  const onCardClick = (item: PlaylistItem) => history.push(cardUrl(item));
  const onShareClick = (): void => {
    if (!item) return;

    if (typeof navigator.share === 'function') {
      navigator.share({ title: item.title, text: item.description, url: window.location.href });
      return;
    }

    copyToClipboard(addConfigParamToUrl(window.location.href));
    setHasShared(true);
    setTimeout(() => setHasShared(false), 2000);
  };
  const handleComplete = useCallback(() => {
    if (!id || !playlist) return;

    const index = playlist.playlist.findIndex(({ mediaid }) => mediaid === id);
    const nextItem = playlist.playlist[index + 1];

    return nextItem && history.push(videoUrl(nextItem, searchParams.get('r'), true));
  }, [history, id, playlist, searchParams]);

  const formatStartWatchingLabel = (): string => {
    if (!allowedToWatch && !user) return t('sign_up_to_start_watching');
    if (!allowedToWatch && !subscription) return t('complete_your_subscription');
    return typeof progress === 'number' ? t('continue_watching') : t('start_watching');
  };

  const handleStartWatchingClick = useCallback(() => {
    if (!allowedToWatch && !user) return history.push(addQueryParam(history, 'u', 'create-account'));
    if (!allowedToWatch && !subscription) return history.push('/u/payments');

    return item && history.push(videoUrl(item, searchParams.get('r'), true));
  }, [allowedToWatch, user, subscription, history, item, searchParams]);

  // Effects
  useEffect(() => {
    document.body.style.overflowY = play ? 'hidden' : '';
    return () => {
      document.body.style.overflowY = '';
    };
  }, [play]);

  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0, behavior: 'smooth' });
  }, [id]);

  // UI
  if (isLoading && !item) return <LoadingOverlay />;
  if ((!isLoading && error) || !item) return <ErrorPage title={t('video_not_found')} />;

  const pageTitle = `${item.title} - ${siteName}`;
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
        {item.tags?.split(',').map((tag) => (
          <meta property="og:video:tag" content={tag} key={tag} />
        ))}
        {item ? <script type="application/ld+json">{generateMovieJSONLD(item)}</script> : null}
      </Helmet>
      <VideoComponent
        title={item.title}
        item={item}
        feedId={feedId ?? undefined}
        trailerItem={trailerItem}
        play={play && allowedToWatch}
        allowedToWatch={allowedToWatch}
        startWatchingLabel={formatStartWatchingLabel()}
        onStartWatchingClick={handleStartWatchingClick}
        goBack={goBack}
        onComplete={handleComplete}
        progress={progress}
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
        {playlist ? (
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
              enableCardTitles={options.shelfTitles}
              accessModel={accessModel}
              isLoggedIn={!!user}
              hasSubscription={!!subscription}
            />
          </>
        ) : undefined}
      </VideoComponent>
    </React.Fragment>
  );
};

export default Movie;
