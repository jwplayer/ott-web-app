import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import CardGrid from '../../components/CardGrid/CardGrid';
import { useFavorites } from '../../stores/FavoritesStore';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { episodeURL } from '../../utils/formatting';
import Filter from '../../components/Filter/Filter';
import type { PlaylistItem } from '../../../types/playlist';
import VideoComponent from '../../components/Video/Video';
import useMedia from '../../hooks/useMedia';
import usePlaylist from '../../hooks/usePlaylist';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import { generateEpisodeJSONLD } from '../../utils/structuredData';
import { copyToClipboard } from '../../utils/dom';
import { filterSeries, getFiltersFromSeries } from '../../utils/collection';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { useWatchHistory, watchHistoryStore } from '../../stores/WatchHistoryStore';
import { VideoProgressMinMax } from '../../config';
import { useConfigStore } from '../../stores/ConfigStore';
import { isAllowedToWatch } from '../../utils/cleeng';
import { useAccountStore } from '../../stores/AccountStore';
import { addQueryParam } from '../../utils/history';

import styles from './Series.module.scss';

type SeriesRouteParams = {
  id: string;
};

const Series = ({ match, location }: RouteComponentProps<SeriesRouteParams>): JSX.Element => {
  // Routing
  const history = useHistory();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const id = match?.params.id;
  const episodeId = searchParams.get('e') || '';
  const play = searchParams.get('play') === '1';
  const feedId = searchParams.get('l');

  // Config
  const { options, siteName } = useConfigStore((s) => s.config);
  const accessModel = useConfigStore((s) => s.accessModel);
  const posterFading: boolean = options?.posterFading === true;
  const enableSharing: boolean = options?.enableSharing === true;

  const { t } = useTranslation('video');

  // Media
  const { isLoading, error, data: item } = useMedia(episodeId);
  const itemRequiresSubscription = item?.requiresSubscription !== 'false';
  useBlurImageUpdater(item);
  const { data: trailerItem } = useMedia(item?.trailerId || '');
  const { isLoading: playlistIsLoading, error: playlistError, data: seriesPlaylist = { title: '', playlist: [] } } = usePlaylist(id, undefined, true, false);
  const [seasonFilter, setSeasonFilter] = useState<string>('');
  const filters = getFiltersFromSeries(seriesPlaylist.playlist);
  const filteredPlaylist = useMemo(() => filterSeries(seriesPlaylist.playlist, seasonFilter), [seriesPlaylist, seasonFilter]);

  const { hasItem, saveItem, removeItem } = useFavorites();

  const watchHistory = watchHistoryStore.useState((s) => s.watchHistory);
  const watchHistoryItem =
    item &&
    watchHistory.find(({ mediaid, progress }) => {
      return mediaid === item.mediaid && progress > VideoProgressMinMax.Min && progress < VideoProgressMinMax.Max;
    });
  const progress = watchHistoryItem?.progress;
  const { getDictionary: getWatchHistoryDictionary } = useWatchHistory();
  const watchHistoryDictionary = getWatchHistoryDictionary();

  // General state
  const isFavorited = !!item && hasItem(item);
  const [hasShared, setHasShared] = useState<boolean>(false);
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);

  // User
  const user = useAccountStore((state) => state.user);
  const subscription = useAccountStore((state) => state.subscription);
  const allowedToWatch = isAllowedToWatch(accessModel, !!user, itemRequiresSubscription, !!subscription);

  // Handlers
  const goBack = () => item && seriesPlaylist && history.push(episodeURL(seriesPlaylist, item.mediaid, false));
  const onCardClick = (item: PlaylistItem) => seriesPlaylist && history.push(episodeURL(seriesPlaylist, item.mediaid));
  const onShareClick = (): void => {
    if (!item) return;

    if (typeof navigator.share === 'function') {
      navigator.share({ title: item.title, text: item.description, url: window.location.href });
      return;
    }

    copyToClipboard(window.location.href);
    setHasShared(true);
    setTimeout(() => setHasShared(false), 2000);
  };
  const handleComplete = useCallback(() => {
    if (!item || !seriesPlaylist) return;

    const index = seriesPlaylist.playlist.findIndex(({ mediaid }) => mediaid === item.mediaid);
    const nextItem = seriesPlaylist.playlist[index + 1];

    return nextItem && history.push(episodeURL(seriesPlaylist, nextItem.mediaid, true));
  }, [history, item, seriesPlaylist]);

  const formatStartWatchingLabel = (): string => {
    if (!allowedToWatch && !user) return t('sign_up_to_start_watching');
    if (!allowedToWatch && !subscription) return t('complete_your_subscription');
    return typeof progress === 'number' ? t('continue_watching') : t('start_watching');
  };

  const handleStartWatchingClick = useCallback(() => {
    if (!allowedToWatch && !user) return history.push(addQueryParam(history, 'u', 'create-account'));
    if (!allowedToWatch && !subscription) return history.push('/u/payments');

    return history.push(episodeURL(seriesPlaylist, item?.mediaid, true));
  }, [allowedToWatch, user, history, subscription, seriesPlaylist, item?.mediaid]);

  // Effects
  useEffect(() => {
    document.body.style.overflowY = play ? 'hidden' : '';
    return () => {
      document.body.style.overflowY = '';
    };
  }, [play]);

  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0, behavior: 'smooth' });
  }, [episodeId]);

  useEffect(() => {
    if (!searchParams.has('e') && seriesPlaylist?.playlist.length) {
      history.replace(episodeURL(seriesPlaylist, seriesPlaylist.playlist[0].mediaid));
    }
  }, [history, searchParams, seriesPlaylist]);

  // UI
  if ((!item && isLoading) || playlistIsLoading || !searchParams.has('e')) return <LoadingOverlay />;
  if ((!isLoading && error) || !item) return <ErrorPage title={t('episode_not_found')} />;
  if (playlistError || !seriesPlaylist) return <ErrorPage title={t('series_not_found')} />;

  const pageTitle = `${item.title} - ${siteName}`;
  const canonicalUrl = seriesPlaylist && item ? `${window.location.origin}${episodeURL(seriesPlaylist, item.mediaid)}` : window.location.href;

  return (
    <React.Fragment>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={item.description} />
        <meta property="og:description" content={item.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content="video.episode" />
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
        {seriesPlaylist && item ? <script type="application/ld+json">{generateEpisodeJSONLD(seriesPlaylist, item)}</script> : null}
      </Helmet>
      <VideoComponent
        title={seriesPlaylist.title}
        episodeCount={seriesPlaylist.playlist.length}
        item={item}
        feedId={feedId ?? undefined}
        trailerItem={trailerItem}
        play={play && allowedToWatch}
        allowedToWatch={allowedToWatch}
        progress={progress}
        startWatchingLabel={formatStartWatchingLabel()}
        onStartWatchingClick={handleStartWatchingClick}
        goBack={goBack}
        onComplete={handleComplete}
        poster={posterFading ? 'fading' : 'normal'}
        enableSharing={enableSharing}
        hasShared={hasShared}
        onShareClick={onShareClick}
        playTrailer={playTrailer}
        onTrailerClick={() => setPlayTrailer(true)}
        onTrailerClose={() => setPlayTrailer(false)}
        isFavorited={isFavorited}
        onFavoriteButtonClick={() => (isFavorited ? removeItem(item) : saveItem(item))}
        isSeries
      >
        <>
          <div className={styles.episodes}>
            <h3>{t('episodes')}</h3>
            {filters.length > 1 && (
              <Filter
                name="categories"
                value={seasonFilter}
                valuePrefix={t('season_prefix')}
                defaultLabel={t('all_seasons')}
                options={filters}
                setValue={setSeasonFilter}
              />
            )}
          </div>
          <CardGrid
            playlist={filteredPlaylist}
            onCardClick={onCardClick}
            watchHistory={watchHistoryDictionary}
            isLoading={isLoading}
            currentCardItem={item}
            currentCardLabel={t('current_episode')}
            enableCardTitles={options.shelfTitles}
            accessModel={accessModel}
            isLoggedIn={!!user}
            hasSubscription={!!subscription}
          />
        </>
      </VideoComponent>
    </React.Fragment>
  );
};

export default Series;
