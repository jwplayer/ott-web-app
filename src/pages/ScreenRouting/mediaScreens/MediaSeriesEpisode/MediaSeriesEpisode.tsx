import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import styles from './MediaSeriesEpisode.module.scss';

import useEntitlement from '#src/hooks/useEntitlement';
import CardGrid from '#src/components/CardGrid/CardGrid';
import useBlurImageUpdater from '#src/hooks/useBlurImageUpdater';
import { episodeURL, formatSeriesMetaString, formatVideoMetaString } from '#src/utils/formatting';
import Filter from '#src/components/Filter/Filter';
import VideoDetails from '#src/components/VideoDetails/VideoDetails';
import useMedia from '#src/hooks/useMedia';
import { useSeriesData } from '#src/hooks/useSeriesData';
import ErrorPage from '#src/components/ErrorPage/ErrorPage';
import { generateEpisodeJSONLD } from '#src/utils/structuredData';
import { enrichMediaItems, filterSeries, getFiltersFromSeries, getNextItemId } from '#src/utils/series';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import StartWatchingButton from '#src/containers/StartWatchingButton/StartWatchingButton';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import Cinema from '#src/containers/Cinema/Cinema';
import TrailerModal from '#src/containers/TrailerModal/TrailerModal';
import ShareButton from '#src/components/ShareButton/ShareButton';
import FavoriteButton from '#src/containers/FavoriteButton/FavoriteButton';
import Button from '#src/components/Button/Button';
import PlayTrailer from '#src/icons/PlayTrailer';
import type { PlaylistItem } from '#types/playlist';
import type { ScreenComponent } from '#types/screens';
import useQueryParam from '#src/hooks/useQueryParam';
import useGetSeriesId from '#src/hooks/useGetSeriesId';
import Loading from '#src/pages/Loading/Loading';

const MediaSeriesEpisode: ScreenComponent<PlaylistItem> = ({ data }) => {
  const breakpoint = useBreakpoint();
  const { t } = useTranslation('video');
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);

  // Routing
  const navigate = useNavigate();
  const { seriesId, isLoading: seriesIdLoading } = useGetSeriesId(data);
  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');

  // Config
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { styling, features, siteName } = config;
  const posterFading: boolean = styling?.posterFading === true;
  const enableSharing: boolean = features?.enableSharing === true;
  const isFavoritesEnabled: boolean = Boolean(features?.favoritesList);

  // Media
  const {
    isLoading: isPlaylistLoading,
    isPlaylistError,
    data: { series, seriesPlaylist },
  } = useSeriesData(seriesId);
  const { isLoading: isTrailerLoading, data: trailerItem } = useMedia(data.trailerId || '');

  const episodeItem = series && data ? enrichMediaItems(series, [data])[0] : data;
  const nextItemId = getNextItemId(episodeItem, series, seriesPlaylist);

  const isLoading = seriesIdLoading || isPlaylistLoading;

  const [seasonFilter, setSeasonFilter] = useState<string>(episodeItem?.seasonNumber || '1');
  const filters = getFiltersFromSeries(seriesPlaylist);
  const filteredPlaylist = useMemo(() => filterSeries(seriesPlaylist, seasonFilter), [seriesPlaylist, seasonFilter]);

  // Watch history
  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionary());

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { isEntitled } = useEntitlement(episodeItem);

  useBlurImageUpdater(episodeItem);

  // Handlers
  const goBack = () => episodeItem && seriesPlaylist && navigate(episodeURL(data, seriesId, false, feedId));
  const onCardClick = (toEpisode: PlaylistItem) => seriesPlaylist && navigate(episodeURL(toEpisode, seriesId, false, feedId));

  const handleComplete = useCallback(() => {
    if (nextItemId) {
      navigate(episodeURL(data, nextItemId, true, feedId));
    }
  }, [feedId, data, navigate, nextItemId]);

  // Effects
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0, behavior: 'smooth' });
  }, [data]);

  useEffect(() => {
    setSeasonFilter(episodeItem?.seasonNumber || '');
  }, [episodeItem?.seasonNumber, setSeasonFilter]);

  // UI
  if (isLoading) return <Loading />;
  if (isPlaylistError) return <ErrorPage title={t('series_error')} />;
  if (!seriesId) return <ErrorPage title={t('series_error')} />;

  const pageTitle = `${episodeItem.title} - ${siteName}`;
  const canonicalUrl = seriesPlaylist && episodeItem ? `${window.location.origin}${episodeURL(episodeItem, seriesId)}` : window.location.href;

  const primaryMetadata = formatVideoMetaString(episodeItem, t('video:total_episodes', { count: seriesPlaylist.playlist.length }));
  const secondaryMetadata = (
    <>
      <strong>{formatSeriesMetaString(episodeItem.seasonNumber, episodeItem.episodeNumber)}</strong> - {episodeItem.title}
    </>
  );

  return (
    <React.Fragment>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={episodeItem.description} />
        <meta property="og:description" content={episodeItem.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content="video.episode" />
        {episodeItem.image && <meta property="og:image" content={episodeItem.image?.replace(/^https:/, 'http:')} />}
        {episodeItem.image && <meta property="og:image:secure_url" content={episodeItem.image?.replace(/^http:/, 'https:')} />}
        <meta property="og:image:width" content={episodeItem.image ? '720' : ''} />
        <meta property="og:image:height" content={episodeItem.image ? '406' : ''} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={episodeItem.description} />
        <meta name="twitter:image" content={episodeItem.image} />
        <meta property="og:video" content={canonicalUrl.replace(/^https:/, 'http:')} />
        <meta property="og:video:secure_url" content={canonicalUrl.replace(/^http:/, 'https:')} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {episodeItem.tags?.split(',').map((tag) => (
          <meta property="og:video:tag" content={tag} key={tag} />
        ))}
        {seriesPlaylist && episodeItem ? <script type="application/ld+json">{generateEpisodeJSONLD(seriesPlaylist, episodeItem)}</script> : null}
      </Helmet>
      <Cinema
        open={play && isEntitled}
        onClose={goBack}
        item={episodeItem}
        title={seriesPlaylist.title}
        primaryMetadata={primaryMetadata}
        secondaryMetadata={
          <>
            <strong>{secondaryMetadata}</strong> - {episodeItem.title}
          </>
        }
        onComplete={handleComplete}
        feedId={feedId ?? undefined}
      />
      <TrailerModal item={trailerItem} title={`${episodeItem.title} - Trailer`} open={playTrailer} onClose={() => setPlayTrailer(false)} />
      <VideoDetails
        title={seriesPlaylist.title}
        description={episodeItem.description}
        primaryMetadata={primaryMetadata}
        secondaryMetadata={secondaryMetadata}
        image={episodeItem.backgroundImage}
        posterMode={posterFading ? 'fading' : 'normal'}
        shareButton={enableSharing ? <ShareButton title={episodeItem.title} description={episodeItem.description} url={canonicalUrl} /> : null}
        startWatchingButton={<StartWatchingButton item={episodeItem} playUrl={episodeURL(data, seriesId, true, feedId)} />}
        favoriteButton={isFavoritesEnabled && <FavoriteButton item={episodeItem} />}
        trailerButton={
          (!!trailerItem || isTrailerLoading) && (
            <Button
              label={t('video:trailer')}
              aria-label={t('video:watch_trailer')}
              startIcon={<PlayTrailer />}
              onClick={() => setPlayTrailer(true)}
              active={playTrailer}
              fullWidth={breakpoint < Breakpoint.md}
              disabled={!trailerItem}
            />
          )
        }
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
            currentCardItem={episodeItem}
            currentCardLabel={t('current_episode')}
            enableCardTitles={styling.shelfTitles}
            accessModel={accessModel}
            isLoggedIn={!!user}
            hasSubscription={!!subscription}
          />
        </>
      </VideoDetails>
    </React.Fragment>
  );
};

export default MediaSeriesEpisode;
