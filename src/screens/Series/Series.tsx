import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import styles from './Series.module.scss';

import useEntitlement from '#src/hooks/useEntitlement';
import CardGrid from '#src/components/CardGrid/CardGrid';
import useBlurImageUpdater from '#src/hooks/useBlurImageUpdater';
import { episodeURL } from '#src/utils/formatting';
import Filter from '#src/components/Filter/Filter';
import type { PlaylistItem } from '#src/../types/playlist';
import VideoComponent from '#src/components/Video/Video';
import useMedia from '#src/hooks/useMedia';
import usePlaylist from '#src/hooks/usePlaylist';
import ErrorPage from '#src/components/ErrorPage/ErrorPage';
import { generateEpisodeJSONLD } from '#src/utils/structuredData';
import { copyToClipboard } from '#src/utils/dom';
import { filterSeries, getFiltersFromSeries } from '#src/utils/collection';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import { addQueryParam } from '#src/utils/history';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { removeItem, saveItem } from '#src/stores/FavoritesController';

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
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { options, siteName } = config;
  const posterFading: boolean = options?.posterFading === true;
  const enableSharing: boolean = options?.enableSharing === true;

  const { t } = useTranslation('video');

  // Media
  const { isLoading, error, data: item } = useMedia(episodeId);
  useBlurImageUpdater(item);
  const { data: trailerItem } = useMedia(item?.trailerId || '');
  const { isLoading: playlistIsLoading, error: playlistError, data: seriesPlaylist = { title: '', playlist: [] } } = usePlaylist(id, undefined, true, false);
  const [seasonFilter, setSeasonFilter] = useState<string>('');
  const filters = getFiltersFromSeries(seriesPlaylist.playlist);
  const filteredPlaylist = useMemo(() => filterSeries(seriesPlaylist.playlist, seasonFilter), [seriesPlaylist, seasonFilter]);

  const isFavorited = useFavoritesStore((state) => !!item && state.hasItem(item));

  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionary());
  const watchHistoryItem = useWatchHistoryStore((state) => item && state.getItem(item));
  const progress = watchHistoryItem?.progress;

  // General state
  const [hasShared, setHasShared] = useState<boolean>(false);
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { isEntitled, isMediaEntitlementLoading, mediaOffers } = useEntitlement(item);

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

  const startWatchingLabel = useMemo((): string => {
    if (isEntitled) return typeof progress === 'number' ? t('continue_watching') : t('start_watching');
    if (!user) return t('sign_up_to_start_watching');
    if (mediaOffers.length) return t('buy');

    return t('complete_your_subscription');
  }, [isEntitled, progress, user, mediaOffers, t]);

  const handleStartWatchingClick = useCallback(() => {
    if (isEntitled) return history.push(episodeURL(seriesPlaylist, item?.mediaid, true));
    if (!user) return history.push(addQueryParam(history, 'u', 'create-account'));
    if (mediaOffers.length) return history.push(addQueryParam(history, 'u', 'choose-offer'));

    return history.push('/u/payments');
  }, [isEntitled, user, history, seriesPlaylist, item?.mediaid, mediaOffers]);

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
  if ((!item && isLoading) || playlistIsLoading || !searchParams.has('e') || isMediaEntitlementLoading) return <LoadingOverlay />;
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
        play={play && isEntitled}
        isEntitled={isEntitled}
        progress={progress}
        startWatchingLabel={startWatchingLabel}
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
