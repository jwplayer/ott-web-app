import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import VideoLayout from '#components/VideoLayout/VideoLayout';
import InlinePlayer from '#src/containers/InlinePlayer/InlinePlayer';
import { isLocked } from '#src/utils/entitlements';
import useEntitlement from '#src/hooks/useEntitlement';
import { formatSeriesMetaString, formatVideoMetaString, seriesURL } from '#src/utils/formatting';
import useMedia from '#src/hooks/useMedia';
import { useSeriesData } from '#src/hooks/series/useSeriesData';
import { useEpisodes } from '#src/hooks/series/useEpisodes';
import { useEpisodeMetadata } from '#src/hooks/series/useEpisodeMetadata';
import { useNextEpisode } from '#src/hooks/series/useNextEpisode';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import { generateEpisodeJSONLD } from '#src/utils/structuredData';
import { filterSeries, getEpisodesInSeason, getFiltersFromSeries, getFirstEpisode } from '#src/utils/series';
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
import useQueryParam from '#src/hooks/useQueryParam';
import Loading from '#src/pages/Loading/Loading';

const Series = () => {
  const breakpoint = useBreakpoint();
  const { t } = useTranslation('video');
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);

  // Navigation
  const navigate = useNavigate();
  const params = useParams();
  const seriesId = params.id || '';
  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');
  const episodeId = useQueryParam('e');

  // Main data
  const { isLoading: isSeriesDataLoading, isPlaylistError, data } = useSeriesData(seriesId, seriesId);
  const { series, media: seriesMedia, playlist: seriesPlaylist } = data || {};
  const { isLoading: isEpisodeLoading, data: episode } = useMedia(episodeId || '');
  const { isLoading: isTrailerLoading, data: trailerItem } = useMedia(episode?.trailerId || '');
  const { data: episodeMetadata, isLoading: isEpisodeMetadataLoading } = useEpisodeMetadata(episode, series, { enabled: !!episode && !!series });

  // Whether we show series or episode information. For old series flow we only have access to the playlist
  const selectedItem = episode || seriesMedia || seriesPlaylist;

  // Config
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { features, siteName, custom } = config;
  const isFavoritesEnabled: boolean = Boolean(features?.favoritesList);
  const inlineLayout = Boolean(custom?.inlinePlayer);

  // Filters
  const filters = useMemo(() => getFiltersFromSeries(seriesPlaylist, series), [seriesPlaylist, series]);
  const [seasonFilter, setSeasonFilter] = useState<string | undefined>(undefined);

  // Season / episodes data
  const {
    data: episodes,
    fetchNextPage: fetchNextEpisodes,
    hasNextPage: hasNextEpisodesPage,
  } = useEpisodes(seriesId, seasonFilter, { enabled: seasonFilter !== undefined && !!series });

  const firstEpisode = useMemo(() => getFirstEpisode(seriesPlaylist, episodes), [seriesPlaylist, episodes]);
  const filteredPlaylist = useMemo(() => filterSeries(seriesPlaylist, episodes, seasonFilter), [seriesPlaylist, episodes, seasonFilter]);
  const episodesInSeason = getEpisodesInSeason(episode, episodeMetadata, seriesPlaylist, series);
  const nextItem = useNextEpisode({ episode, seriesPlaylist, series, episodeMetadata });

  // Watch history
  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionaryWithEpisodes());

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { isEntitled } = useEntitlement(episode);
  const isLoggedIn = !!user;
  const hasSubscription = !!subscription;

  // Handlers
  const goBack = () => episode && navigate(seriesURL({ episodeId: episode.mediaid, seriesId, play: false, playlistId: feedId }));
  const onCardClick = (toEpisode: PlaylistItem) =>
    seriesPlaylist && navigate(seriesURL({ episodeId: toEpisode.mediaid, seriesId, play: false, playlistId: feedId }));
  const handleComplete = useCallback(async () => {
    navigate(seriesURL({ episodeId: nextItem?.mediaid, seriesId, play: !!nextItem, playlistId: feedId }));
  }, [navigate, nextItem, seriesId, feedId]);

  // Effects
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0 });
  }, [episode]);

  useEffect(() => {
    if (isSeriesDataLoading || isEpisodeMetadataLoading || isEpisodeLoading) {
      return;
    }

    if (seasonFilter === undefined) {
      setSeasonFilter(episodeMetadata?.seasonNumber || episode?.seasonNumber || filters?.[0] || '');
    }
  }, [episodeMetadata, episode, seasonFilter, isEpisodeMetadataLoading, isSeriesDataLoading, isEpisodeLoading, filters]);

  // UI
  const isLoading = isSeriesDataLoading || isEpisodeMetadataLoading || isEpisodeLoading;
  if (isLoading) return <Loading />;
  if (isPlaylistError) return <ErrorPage title={t('series_error')} />;

  const pageTitle = `${selectedItem.title} - ${siteName}`;
  const canonicalUrl = `${window.location.origin}${seriesURL({ episodeId: episode?.mediaid, seriesId })}`;

  const primaryMetadata = formatVideoMetaString(
    selectedItem,
    t('video:total_episodes', { count: series ? series.episode_count : seriesPlaylist.playlist.length }),
  );
  const secondaryMetadata = episodeMetadata && episode && (
    <>
      <strong>{formatSeriesMetaString(episodeMetadata.seasonNumber, episodeMetadata.episodeNumber)}</strong> - {episode.title}
    </>
  );
  const filterMetadata =
    episodeMetadata &&
    ` ${t('video:season')} ${episodeMetadata.seasonNumber}/${filters?.length} - ${t('video:episode')} ${episodeMetadata.episodeNumber}/${episodesInSeason}`;
  const shareButton = <ShareButton title={selectedItem?.title} description={selectedItem.description} url={canonicalUrl} />;
  const startWatchingButton = (
    <StartWatchingButton
      item={episode || firstEpisode}
      playUrl={seriesURL({ episodeId: episode?.mediaid || firstEpisode?.mediaid, seriesId, play: true, playlistId: feedId })}
    />
  );

  // For the old series approach we mark episodes as favorite items. New approach is applied to the series
  const favoriteButton = isFavoritesEnabled && <FavoriteButton item={seriesMedia || firstEpisode} />;
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
        <meta name="description" content={selectedItem.description} />
        <meta property="og:description" content={selectedItem.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content={episode ? 'video.episode' : 'video.series'} />
        {selectedItem.image && <meta property="og:image" content={selectedItem.image?.replace(/^https:/, 'http:')} />}
        {selectedItem.image && <meta property="og:image:secure_url" content={selectedItem.image?.replace(/^http:/, 'https:')} />}
        {selectedItem.image && <meta property="og:image:width" content={selectedItem.image ? '720' : ''} />}
        {selectedItem.image && <meta property="og:image:height" content={selectedItem.image ? '406' : ''} />}
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={selectedItem.description} />
        <meta name="twitter:image" content={selectedItem.image} />
        <meta property="og:video" content={canonicalUrl.replace(/^https:/, 'http:')} />
        <meta property="og:video:secure_url" content={canonicalUrl.replace(/^http:/, 'https:')} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {selectedItem.tags?.split(',').map((tag: string) => (
          <meta property="og:video:tag" content={tag} key={tag} />
        ))}
        {seriesPlaylist && selectedItem ? (
          <script type="application/ld+json">{generateEpisodeJSONLD(seriesPlaylist, series, episode, episodeMetadata, seriesId)}</script>
        ) : null}
      </Helmet>
      <VideoLayout
        item={selectedItem}
        title={inlineLayout ? selectedItem.title : seriesPlaylist.title}
        description={selectedItem.description}
        inlineLayout={inlineLayout}
        primaryMetadata={primaryMetadata}
        secondaryMetadata={secondaryMetadata}
        image={selectedItem.backgroundImage}
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
          inlineLayout && (episode || firstEpisode) ? (
            <InlinePlayer
              isLoggedIn={isLoggedIn}
              item={episode || firstEpisode}
              onComplete={handleComplete}
              feedId={feedId ?? undefined}
              startWatchingButton={startWatchingButton}
              paywall={isLocked(accessModel, isLoggedIn, hasSubscription, episode || firstEpisode)}
              autostart={play || undefined}
            />
          ) : (
            <Cinema
              open={play && isEntitled}
              onClose={goBack}
              item={episode || firstEpisode}
              title={seriesPlaylist.title}
              primaryMetadata={primaryMetadata}
              secondaryMetadata={secondaryMetadata}
              onComplete={handleComplete}
              feedId={feedId ?? undefined}
            />
          )
        }
      />
      {episode && <TrailerModal item={trailerItem} title={`${episode.title} - Trailer`} open={playTrailer} onClose={() => setPlayTrailer(false)} />}
    </React.Fragment>
  );
};

export default Series;
