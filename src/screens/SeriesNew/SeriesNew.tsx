import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import styles from './SeriesNew.module.scss';

import useEntitlement from '#src/hooks/useEntitlement';
import useBlurImageUpdater from '#src/hooks/useBlurImageUpdater';
import Filter from '#src/components/Filter/Filter';
import type { PlaylistItem } from '#src/../types/playlist';
import VideoComponent from '#src/components/Video/Video';
import useMedia from '#src/hooks/useMedia';
import ErrorPage from '#src/components/ErrorPage/ErrorPage';
import { generateEpisodeJSONLD, episodeURL, getNextEpisode, getSelectedMediaItems, getFilterOptions, enrichMediaItem } from '#src/utils/series';
import { copyToClipboard } from '#src/utils/dom';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { removeItem, saveItem } from '#src/stores/FavoritesController';
import { useSeriesMediaItems } from '#src/hooks/useSeries';
import CardGrid from '#src/components/CardGrid/CardGrid';
import StartWatchingButton from '#src/containers/StartWatchingButton/StartWatchingButton';

const SeriesNew = ({ match, location }: RouteComponentProps<{ id: string }>): JSX.Element => {
  const { t } = useTranslation('video');
  const [hasShared, setHasShared] = useState<boolean>(false);
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);

  // Routing
  const history = useHistory();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const seriesId = match?.params.id;
  const episodeId = searchParams.get('e') || '';
  const play = searchParams.get('play') === '1';
  const feedId = searchParams.get('l');

  // Config
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { styling, features, siteName } = config;
  const posterFading: boolean = styling?.posterFading === true;
  const enableSharing: boolean = features?.enableSharing === true;

  // We use favoritesList watchlist here as a temporary solution.
  const { data, isLoading: isLoadingSeries, isError: isSeriesError } = useSeriesMediaItems(seriesId, features?.favoritesList);
  const { series, mediaItems = [] } = data || {};

  const { isLoading: isLoadingItem, data: rawItem, error: errorItem } = useMedia(episodeId);
  const { data: trailerItem } = useMedia(rawItem?.trailerId || '');

  const item = enrichMediaItem(mediaItems, rawItem);
  const isLoading = isLoadingSeries || isLoadingItem;

  useBlurImageUpdater(item);

  // Filter season
  const [seasonFilter, setSeasonFilter] = useState<string>(() => item?.seasonNumber || '1');
  const selectedMedia = useMemo(() => getSelectedMediaItems(mediaItems, seasonFilter), [seasonFilter, mediaItems]);
  const filterOptions = useMemo(() => getFilterOptions(series), [series]);
  const isFavorited = useFavoritesStore((state) => !!item && state.hasItem(item));
  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionary());

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { isEntitled } = useEntitlement(item);

  // Handlers
  const goBack = () => item && series && history.push(episodeURL(series, item.mediaid, false));
  const onCardClick = (item: PlaylistItem) => series && history.push(episodeURL(series, item.mediaid));
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
    if (!item || !series) return;

    const nextItemId = getNextEpisode(series, Number(seasonFilter), item);

    if (nextItemId !== item?.mediaid) {
      history.push(episodeURL(series, nextItemId, true));
    }
  }, [history, item, seasonFilter, series]);

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
    if (!searchParams.has('e') && series?.seasons?.length) {
      history.replace(episodeURL(series, series.seasons[0].episodes[0].media_id));
    }
  }, [history, searchParams, series]);

  // UI
  if (isLoading) return <LoadingOverlay />;
  if ((!item && errorItem) || !item) return <ErrorPage title={t('episode_not_found')} />;
  if (isSeriesError) return <ErrorPage title={t('series_not_found')} />;

  const pageTitle = `${item.title} - ${siteName}`;
  const canonicalUrl = series && item ? `${window.location.origin}${episodeURL(series, item.mediaid)}` : window.location.href;

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
        {series && item ? <script type="application/ld+json">{generateEpisodeJSONLD(series, item)}</script> : null}
      </Helmet>
      <VideoComponent
        title={series?.title || ''}
        episodeCount={series?.episode_count}
        item={item}
        feedId={feedId ?? undefined}
        trailerItem={trailerItem}
        play={play && isEntitled}
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
        startWatchingButton={<StartWatchingButton item={item} seriesId={series?.series_id} />}
        isSeries
      >
        <>
          <div className={styles.episodes}>
            <h3>{t('episodes')}</h3>
            {Boolean(series?.seasons?.length) && (
              <Filter
                name="categories"
                value={seasonFilter}
                valuePrefix={t('season_prefix')}
                defaultLabel={t('all_seasons')}
                options={filterOptions}
                setValue={setSeasonFilter}
              />
            )}
          </div>
          <CardGrid
            playlist={selectedMedia}
            onCardClick={onCardClick}
            watchHistory={watchHistoryDictionary}
            isLoading={isLoading}
            currentCardItem={item}
            currentCardLabel={t('current_episode')}
            enableCardTitles={styling.shelfTitles}
            accessModel={accessModel}
            isLoggedIn={!!user}
            hasSubscription={!!subscription}
          />
        </>
      </VideoComponent>
    </React.Fragment>
  );
};

export default SeriesNew;
