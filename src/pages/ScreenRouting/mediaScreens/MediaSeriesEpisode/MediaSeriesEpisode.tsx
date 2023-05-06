import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import VideoLayout from '#components/VideoLayout/VideoLayout';
import InlinePlayer from '#src/containers/InlinePlayer/InlinePlayer';
import { isLocked } from '#src/utils/entitlements';
import useEntitlement from '#src/hooks/useEntitlement';
import { episodeURL, formatSeriesMetaString, formatVideoMetaString } from '#src/utils/formatting';
import useMedia from '#src/hooks/useMedia';
import { useSeriesData } from '#src/hooks/series/useSeriesData';
import { useEpisodes } from '#src/hooks/series/useEpisodes';
import { useEpisode } from '#src/hooks/series/useEpisode';
import useSeriesId from '#src/hooks/series/useSeriesId';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import { generateEpisodeJSONLD } from '#src/utils/structuredData';
import { filterSeries, getEpisodesInSeason, getFiltersFromSeries, getNextItem } from '#src/utils/series';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import StartWatchingButton from '#src/containers/StartWatchingButton/StartWatchingButton';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import Cinema from '#src/containers/Cinema/Cinema';
import TrailerModal from '#src/containers/TrailerModal/TrailerModal';
import ShareButton from '#components/ShareButton/ShareButton';
import FavoriteButton from '#src/containers/FavoriteButton/FavoriteButton';
import Button from '#components/Button/Button';
import PlayTrailer from '#src/icons/PlayTrailer';
import type { PlaylistItem } from '#types/playlist';
import type { ScreenComponent } from '#types/screens';
import useQueryParam from '#src/hooks/useQueryParam';
import Loading from '#src/pages/Loading/Loading';

const MediaSeriesEpisode: ScreenComponent<PlaylistItem> = ({ data: episode, isLoading: isMediaLoading }) => {
  const breakpoint = useBreakpoint();
  const { t } = useTranslation('video');
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);

  // Navigation
  const navigate = useNavigate();
  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');
  const { seriesId, isLoading: isLoadingSeriesId } = useSeriesId(episode);

  // Main data
  const { isLoading: isPlaylistLoading, isPlaylistError, data } = useSeriesData(seriesId, seriesId);
  const { newSeries, playlist: seriesPlaylist } = data || {};
  const { series, media: seriesMedia } = newSeries || {};

  const { data: enrichedEpisode, isLoading: isEpisodeLoading } = useEpisode(episode.mediaid, series);
  const { isLoading: isTrailerLoading, data: trailerItem } = useMedia(episode.trailerId || '');

  // Config
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { features, siteName, custom } = config;
  const isFavoritesEnabled: boolean = Boolean(features?.favoritesList);
  const inlineLayout = Boolean(custom?.inlinePlayer);
  const filters = getFiltersFromSeries(seriesPlaylist, series);
  const [seasonFilter, setSeasonFilter] = useState<string>(enrichedEpisode?.seasonNumber || filters[0]);

  // Season / episodes data
  const { data: episodes, fetchNextPage: fetchNextEpisodes, hasNextPage: hasNextEpisodesPage } = useEpisodes(seriesId, !!series, seasonFilter);
  const filteredPlaylist = useMemo(() => filterSeries(seriesPlaylist, episodes, seasonFilter), [seriesPlaylist, episodes, seasonFilter]);
  const episodesInSeason = getEpisodesInSeason(enrichedEpisode, seriesPlaylist, series);
  const nextItem = useMemo(
    () => getNextItem(enrichedEpisode, seriesPlaylist, episodes, hasNextEpisodesPage, fetchNextEpisodes),
    [enrichedEpisode, seriesPlaylist, episodes, hasNextEpisodesPage, fetchNextEpisodes],
  );

  // Watch history
  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionary());

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { isEntitled } = useEntitlement(enrichedEpisode);
  const isLoggedIn = !!user;
  const hasSubscription = !!subscription;

  // Handlers
  const goBack = () => seriesId && enrichedEpisode && navigate(episodeURL({ episode: enrichedEpisode, seriesId, play: false, playlistId: feedId }));
  const onCardClick = (toEpisode: PlaylistItem) => seriesPlaylist && navigate(episodeURL({ episode: toEpisode, seriesId, play: false, playlistId: feedId }));
  const handleComplete = useCallback(() => {
    if (nextItem) {
      navigate(episodeURL({ episode: nextItem, seriesId, play: true, playlistId: feedId }));
    }
  }, [nextItem, navigate, seriesId, feedId]);

  // Effects
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0 });
  }, [data]);

  useEffect(() => {
    const filter = enrichedEpisode?.seasonNumber && Number(enrichedEpisode?.seasonNumber) ? enrichedEpisode?.seasonNumber : '';
    setSeasonFilter(filter);
  }, [enrichedEpisode?.seasonNumber, setSeasonFilter]);

  // UI
  const isLoading = isPlaylistLoading || isMediaLoading || isEpisodeLoading || isLoadingSeriesId;
  if (isLoading) return <Loading />;
  if (isPlaylistError || !enrichedEpisode || !seriesId) return <ErrorPage title={t('series_error')} />;

  const pageTitle = `${enrichedEpisode.title} - ${siteName}`;
  const canonicalUrl = `${window.location.origin}${episodeURL({ episode: enrichedEpisode, seriesId })}`;

  const primaryMetadata = formatVideoMetaString(
    enrichedEpisode,
    t('video:total_episodes', { count: series ? series.episode_count : seriesPlaylist.playlist.length }),
  );
  const secondaryMetadata = (
    <>
      <strong>{formatSeriesMetaString(enrichedEpisode.seasonNumber, enrichedEpisode.episodeNumber)}</strong> - {enrichedEpisode.title}
    </>
  );
  const filterMetadata = ` ${t('video:season')} ${enrichedEpisode.seasonNumber}/${filters.length} - ${t('video:episode')} ${
    enrichedEpisode.episodeNumber
  }/${episodesInSeason}`;
  const shareButton = <ShareButton title={enrichedEpisode.title} description={enrichedEpisode.description} url={canonicalUrl} />;
  const startWatchingButton = (
    <StartWatchingButton item={enrichedEpisode} playUrl={episodeURL({ episode: enrichedEpisode, seriesId, play: true, playlistId: feedId })} />
  );

  // For the old series approach we mark episodes as favorite items. New approach is applied to the series
  const favoriteButton = isFavoritesEnabled && <FavoriteButton item={seriesMedia || enrichedEpisode} />;
  const trailerButton = (!!trailerItem || isTrailerLoading) && (
    <Button
      label={t('video:trailer')}
      aria-label={t('video:watch_trailer')}
      startIcon={<PlayTrailer />}
      onClick={() => setPlayTrailer(true)}
      active={playTrailer}
      fullWidth={breakpoint < Breakpoint.md}
      disabled={!trailerItem}
    />
  );

  return (
    <React.Fragment>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={enrichedEpisode.description} />
        <meta property="og:description" content={enrichedEpisode.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content="video.episode" />
        {enrichedEpisode.image && <meta property="og:image" content={enrichedEpisode.image?.replace(/^https:/, 'http:')} />}
        {enrichedEpisode.image && <meta property="og:image:secure_url" content={enrichedEpisode.image?.replace(/^http:/, 'https:')} />}
        <meta property="og:image:width" content={enrichedEpisode.image ? '720' : ''} />
        <meta property="og:image:height" content={enrichedEpisode.image ? '406' : ''} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={enrichedEpisode.description} />
        <meta name="twitter:image" content={enrichedEpisode.image} />
        <meta property="og:video" content={canonicalUrl.replace(/^https:/, 'http:')} />
        <meta property="og:video:secure_url" content={canonicalUrl.replace(/^http:/, 'https:')} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {enrichedEpisode.tags?.split(',').map((tag) => (
          <meta property="og:video:tag" content={tag} key={tag} />
        ))}
        {seriesPlaylist && enrichedEpisode ? (
          <script type="application/ld+json">{generateEpisodeJSONLD(seriesPlaylist, series, enrichedEpisode, seriesId)}</script>
        ) : null}
      </Helmet>
      <VideoLayout
        item={enrichedEpisode}
        title={inlineLayout ? enrichedEpisode.title : seriesPlaylist.title}
        description={enrichedEpisode.description}
        inlineLayout={inlineLayout}
        primaryMetadata={primaryMetadata}
        secondaryMetadata={secondaryMetadata}
        image={enrichedEpisode.backgroundImage}
        shareButton={shareButton}
        favoriteButton={favoriteButton}
        trailerButton={trailerButton}
        startWatchingButton={startWatchingButton}
        isLoading={isLoading}
        accessModel={accessModel}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
        playlist={filteredPlaylist}
        relatedTitle={inlineLayout ? seriesPlaylist.title : t('episodes')}
        onItemClick={onCardClick}
        setFilter={setSeasonFilter}
        currentFilter={seasonFilter}
        filterValuePrefix={t('season_prefix')}
        defaultFilterLabel={t('all_seasons')}
        activeLabel={t('current_episode')}
        watchHistory={watchHistoryDictionary}
        filterMetadata={filterMetadata}
        filters={filters}
        hasLoadMore={series && hasNextEpisodesPage}
        loadMore={series && fetchNextEpisodes}
        player={
          inlineLayout ? (
            <InlinePlayer
              isLoggedIn={isLoggedIn}
              item={enrichedEpisode}
              onComplete={handleComplete}
              feedId={feedId ?? undefined}
              startWatchingButton={startWatchingButton}
              paywall={isLocked(accessModel, isLoggedIn, hasSubscription, enrichedEpisode)}
              autostart={play || undefined}
            />
          ) : (
            <Cinema
              open={play && isEntitled}
              onClose={goBack}
              item={enrichedEpisode}
              title={seriesPlaylist.title}
              primaryMetadata={primaryMetadata}
              secondaryMetadata={secondaryMetadata}
              onComplete={handleComplete}
              feedId={feedId ?? undefined}
            />
          )
        }
      />
      <TrailerModal item={trailerItem} title={`${enrichedEpisode.title} - Trailer`} open={playTrailer} onClose={() => setPlayTrailer(false)} />
    </React.Fragment>
  );
};

export default MediaSeriesEpisode;
