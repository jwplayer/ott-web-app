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
import { useEpisodeMetadata } from '#src/hooks/series/useEpisodeMetadata';
import { useNextEpisode } from '#src/hooks/series/useNextEpisode';
import useSeriesId from '#src/hooks/series/useSeriesId';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import { generateEpisodeJSONLD } from '#src/utils/structuredData';
import { filterSeries, getEpisodesInSeason, getFiltersFromSeries } from '#src/utils/series';
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
  const { isLoading: isSeriesDataLoading, isPlaylistError, data } = useSeriesData(seriesId, seriesId);
  const { series, media: seriesMedia, playlist: seriesPlaylist } = data || {};

  const { data: episodeMetadata, isLoading: isEpisodeMetadataLoading } = useEpisodeMetadata(episode, series, { enabled: !isSeriesDataLoading });
  const { isLoading: isTrailerLoading, data: trailerItem } = useMedia(episode.trailerId || '');

  // Config
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { features, siteName, custom } = config;
  const isFavoritesEnabled: boolean = Boolean(features?.favoritesList);
  const inlineLayout = Boolean(custom?.inlinePlayer);

  const filters = useMemo(() => getFiltersFromSeries(seriesPlaylist, series), [seriesPlaylist, series]);
  const [seasonFilter, setSeasonFilter] = useState<string | undefined>(undefined);

  // Season / episodes data
  const {
    data: episodes,
    fetchNextPage: fetchNextEpisodes,
    hasNextPage: hasNextEpisodesPage,
  } = useEpisodes(seriesId, seasonFilter, { enabled: Boolean(episodeMetadata && seasonFilter) });
  const filteredPlaylist = useMemo(() => filterSeries(seriesPlaylist, episodes, seasonFilter), [seriesPlaylist, episodes, seasonFilter]);
  const episodesInSeason = getEpisodesInSeason(episode, seriesPlaylist, series);
  const nextItem = useNextEpisode({ episode, seriesPlaylist, series, episodeMetadata });
  // Watch history
  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionary());

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { isEntitled } = useEntitlement(episode);
  const isLoggedIn = !!user;
  const hasSubscription = !!subscription;

  // Handlers
  const goBack = () => seriesId && episode && navigate(episodeURL({ episode, seriesId, play: false, playlistId: feedId }));
  const onCardClick = (toEpisode: PlaylistItem) => seriesPlaylist && navigate(episodeURL({ episode: toEpisode, seriesId, play: false, playlistId: feedId }));
  const handleComplete = useCallback(async () => {
    navigate(episodeURL({ episode: nextItem || (episode as PlaylistItem), seriesId, play: !!nextItem, playlistId: feedId }));
  }, [navigate, nextItem, episode, seriesId, feedId]);

  // Effects
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0 });
  }, [episode]);

  useEffect(() => {
    // Wait for metadata to decide which filter to use
    if (isEpisodeMetadataLoading) {
      return;
    }

    if (episodeMetadata?.seasonNumber) {
      setSeasonFilter(episodeMetadata?.seasonNumber);
    } else {
      setSeasonFilter(filters?.[0]);
    }
  }, [episodeMetadata, isEpisodeMetadataLoading, setSeasonFilter, filters]);

  // UI
  const isLoading = isSeriesDataLoading || isMediaLoading || isEpisodeMetadataLoading || isLoadingSeriesId;
  if (isLoading) return <Loading />;
  if (isPlaylistError || !episode || !seriesId || !episodeMetadata) return <ErrorPage title={t('series_error')} />;

  const pageTitle = `${episode.title} - ${siteName}`;
  const canonicalUrl = `${window.location.origin}${episodeURL({ episode, seriesId })}`;

  const primaryMetadata = formatVideoMetaString(episode, t('video:total_episodes', { count: series ? series.episode_count : seriesPlaylist.playlist.length }));
  const secondaryMetadata = (
    <>
      <strong>{formatSeriesMetaString(episodeMetadata.seasonNumber, episodeMetadata.episodeNumber)}</strong> - {episode.title}
    </>
  );
  const filterMetadata = ` ${t('video:season')} ${episodeMetadata.seasonNumber}/${filters?.length} - ${t('video:episode')} ${
    episodeMetadata.episodeNumber
  }/${episodesInSeason}`;
  const shareButton = <ShareButton title={episode.title} description={episode.description} url={canonicalUrl} />;
  const startWatchingButton = <StartWatchingButton item={episode} playUrl={episodeURL({ episode, seriesId, play: true, playlistId: feedId })} />;

  // For the old series approach we mark episodes as favorite items. New approach is applied to the series
  const favoriteButton = isFavoritesEnabled && <FavoriteButton item={seriesMedia || episode} />;
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
        <meta name="description" content={episode.description} />
        <meta property="og:description" content={episode.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content="video.episode" />
        {episode.image && <meta property="og:image" content={episode.image?.replace(/^https:/, 'http:')} />}
        {episode.image && <meta property="og:image:secure_url" content={episode.image?.replace(/^http:/, 'https:')} />}
        <meta property="og:image:width" content={episode.image ? '720' : ''} />
        <meta property="og:image:height" content={episode.image ? '406' : ''} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={episode.description} />
        <meta name="twitter:image" content={episode.image} />
        <meta property="og:video" content={canonicalUrl.replace(/^https:/, 'http:')} />
        <meta property="og:video:secure_url" content={canonicalUrl.replace(/^http:/, 'https:')} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {episode.tags?.split(',').map((tag) => (
          <meta property="og:video:tag" content={tag} key={tag} />
        ))}
        {seriesPlaylist && episode ? <script type="application/ld+json">{generateEpisodeJSONLD(seriesPlaylist, series, episode, seriesId)}</script> : null}
      </Helmet>
      <VideoLayout
        item={episode}
        title={inlineLayout ? episode.title : seriesPlaylist.title}
        description={episode.description}
        inlineLayout={inlineLayout}
        primaryMetadata={primaryMetadata}
        secondaryMetadata={secondaryMetadata}
        image={episode.backgroundImage}
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
              item={episode}
              onComplete={handleComplete}
              feedId={feedId ?? undefined}
              startWatchingButton={startWatchingButton}
              paywall={isLocked(accessModel, isLoggedIn, hasSubscription, episode)}
              autostart={play || undefined}
            />
          ) : (
            <Cinema
              open={play && isEntitled}
              onClose={goBack}
              item={episode}
              title={seriesPlaylist.title}
              primaryMetadata={primaryMetadata}
              secondaryMetadata={secondaryMetadata}
              onComplete={handleComplete}
              feedId={feedId ?? undefined}
            />
          )
        }
      />
      <TrailerModal item={trailerItem} title={`${episode.title} - Trailer`} open={playTrailer} onClose={() => setPlayTrailer(false)} />
    </React.Fragment>
  );
};

export default MediaSeriesEpisode;
