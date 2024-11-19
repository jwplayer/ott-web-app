import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { useSearchParams } from 'react-router-dom';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useWatchHistoryStore } from '@jwp/ott-common/src/stores/WatchHistoryStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { generateEpisodeJSONLD } from '@jwp/ott-common/src/utils/structuredData';
import { getEpisodesInSeason, getFiltersFromSeries } from '@jwp/ott-common/src/utils/series';
import { createVideoMetadata } from '@jwp/ott-common/src/utils/metadata';
import { formatSeriesMetaString } from '@jwp/ott-common/src/utils/formatting';
import { buildLegacySeriesUrlFromMediaItem, mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { VideoProgressMinMax } from '@jwp/ott-common/src/constants';
import useEntitlement from '@jwp/ott-hooks-react/src/useEntitlement';
import useMedia from '@jwp/ott-hooks-react/src/useMedia';
import { useSeries } from '@jwp/ott-hooks-react/src/series/useSeries';
import { useEpisodes } from '@jwp/ott-hooks-react/src/series/useEpisodes';
import { useSeriesLookup } from '@jwp/ott-hooks-react/src/series/useSeriesLookup';
import { useNextEpisode } from '@jwp/ott-hooks-react/src/series/useNextEpisode';
import PlayTrailer from '@jwp/ott-theme/assets/icons/play_trailer.svg?react';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import { useFirstEpisode } from '@jwp/ott-hooks-react/src/series/useFirstEpisode';
import env from '@jwp/ott-common/src/env';

import type { ScreenComponent } from '../../../../../types/screens';
import ErrorPage from '../../../../components/ErrorPage/ErrorPage';
import StartWatchingButton from '../../../../containers/StartWatchingButton/StartWatchingButton';
import InlinePlayer from '../../../../containers/InlinePlayer/InlinePlayer';
import VideoLayout from '../../../../components/VideoLayout/VideoLayout';
import Cinema from '../../../../containers/Cinema/Cinema';
import TrailerModal from '../../../../containers/TrailerModal/TrailerModal';
import ShareButton from '../../../../components/ShareButton/ShareButton';
import FavoriteButton from '../../../../containers/FavoriteButton/FavoriteButton';
import Button from '../../../../components/Button/Button';
import Loading from '../../../Loading/Loading';
import Icon from '../../../../components/Icon/Icon';
import VideoMetaData from '../../../../components/VideoMetaData/VideoMetaData';
import { createURLFromLocation } from '../../../../utils/location';

const MediaSeries: ScreenComponent<PlaylistItem> = ({ data: seriesMedia }) => {
  const breakpoint = useBreakpoint();
  const { t } = useTranslation('video');
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);

  // Navigation
  const [searchParams, setSearchParams] = useSearchParams();
  const seriesId = seriesMedia.mediaid;
  const play = searchParams.get('play') === '1';
  const feedId = searchParams.get('r');
  const episodeId = searchParams.get('e');

  // Main data
  const { isLoading: isSeriesDataLoading, data: series, error: seriesError } = useSeries(seriesId);
  const { isLoading: isEpisodeLoading, data: episode } = useMedia(episodeId || '');
  const { isLoading: isTrailerLoading, data: trailerItem } = useMedia(episode?.trailerId || '');
  const { isLoading: isSeriesDictionaryLoading, data: episodeInSeries } = useSeriesLookup(episodeId || undefined);
  const { isLoading: isFirstEpisodeLoading, data: firstEpisode } = useFirstEpisode({ series });

  // Whether we show series or episode information
  const selectedItem = (episode || seriesMedia) as PlaylistItem;

  // Config
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { features, siteName, custom } = config;
  const isFavoritesEnabled: boolean = Boolean(features?.favoritesList);
  const inlineLayout = Boolean(custom?.inlinePlayer);

  // Filters
  const filters = useMemo(() => getFiltersFromSeries(series), [series]);
  const [seasonFilter, setSeasonFilter] = useState<string | undefined>(undefined);

  // Season / episodes data
  const {
    data: episodes,
    fetchNextPage: fetchNextEpisodes,
    hasNextPage: hasNextEpisodesPage,
  } = useEpisodes(seriesId, seasonFilter, { enabled: seasonFilter !== undefined && !!series });

  const episodeMetadata = useMemo(
    () =>
      episodeInSeries && {
        episodeNumber: episodeInSeries?.episode_number ? String(episodeInSeries.episode_number) : '',
        seasonNumber: episodeInSeries?.season_number ? String(episodeInSeries.season_number) : '',
      },
    [episodeInSeries],
  );
  const playlist = useMemo(
    () => ({
      title: seriesMedia.title,
      description: seriesMedia.description,
      feedid: series?.series_id,
      playlist: episodes?.flatMap((e) => e.episodes) || [],
    }),
    [seriesMedia, series, episodes],
  );

  const episodesInSeason = getEpisodesInSeason(episodeMetadata, series);
  const { data: nextItem } = useNextEpisode({ series, episodeId: episode?.mediaid || firstEpisode?.mediaid });

  // Watch history
  const watchHistoryArray = useWatchHistoryStore((state) => state.watchHistory);
  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionaryWithEpisodes());
  const episodeInProgress = watchHistoryArray.find(
    (episode) => episode?.seriesId === seriesId && episode.progress > VideoProgressMinMax.Min && episode.progress < VideoProgressMinMax.Max,
  );

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { isEntitled, mediaOffers } = useEntitlement(episode || firstEpisode);
  const hasMediaOffers = !!mediaOffers.length;

  const isLoggedIn = !!user;
  const hasSubscription = !!subscription;

  const location = useLocation();
  const getURL = (toEpisode: PlaylistItem) => {
    return createURLFromLocation(location, { e: toEpisode.mediaid });
  };

  // Handlers
  const goBack = useCallback(() => {
    setSearchParams({ ...searchParams, e: episode?.mediaid, r: feedId || '' });
  }, [setSearchParams, searchParams, episode, feedId]);

  const handleComplete = useCallback(async () => {
    setSearchParams({ ...searchParams, e: (nextItem || episode)?.mediaid, r: feedId || '', play: nextItem ? '1' : '0' });
  }, [setSearchParams, nextItem, episode, feedId, searchParams]);

  const handleInlinePlay = useCallback(async () => {
    if (!episode) {
      setSearchParams({ ...searchParams, e: firstEpisode?.mediaid, r: feedId || '', play: '1' });
    }
  }, [setSearchParams, firstEpisode, feedId, episode, searchParams]);

  // Effects
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0 });
    (document.querySelector('#video-details button') as HTMLElement)?.focus();
  }, [episode]);

  useEffect(() => {
    if (episodeInProgress && !searchParams.get('e')) {
      setSearchParams({ ...searchParams, e: episodeInProgress.mediaid, r: feedId || '' }, { replace: true });
    }
  }, [episodeInProgress, setSearchParams, searchParams, feedId]);

  useEffect(() => {
    if (isSeriesDataLoading || isEpisodeLoading || isSeriesDictionaryLoading) {
      return;
    }

    // No episode is selected, filter is not set
    if (!episodeId && seasonFilter === undefined) {
      setSeasonFilter(filters[0]?.value || '');
      return;
    }

    // Select a corresponding season for an episode
    if (seasonFilter === undefined && episodeMetadata) {
      setSeasonFilter(episodeMetadata.seasonNumber);
    }
  }, [episodeMetadata, seasonFilter, isSeriesDataLoading, isEpisodeLoading, isSeriesDictionaryLoading, filters, episodeId]);

  // UI
  const playEpisode = episode || firstEpisode;
  const isLoading = isSeriesDataLoading || isSeriesDictionaryLoading || isEpisodeLoading || isFirstEpisodeLoading;

  const startWatchingButton = useMemo(
    () =>
      playEpisode && (
        <StartWatchingButton
          key={episodeId} // necessary to fix autofocus on TalkBack
          item={playEpisode}
          onClick={() => {
            setSearchParams({ ...searchParams, e: playEpisode.mediaid, r: feedId || '', play: '1' }, { replace: true });
          }}
        />
      ),
    [episodeId, playEpisode, setSearchParams, searchParams, feedId],
  );

  if (isLoading) return <Loading />;

  // Legacy series is used
  if (seriesError?.code === 404) {
    const url = buildLegacySeriesUrlFromMediaItem(seriesMedia, play, feedId);

    return <Navigate to={url} replace />;
  }

  if (!seriesMedia || !series || !playEpisode) return <ErrorPage title={t('series_error')} />;

  const pageTitle = `${selectedItem.title} - ${siteName}`;
  const canonicalUrl = `${env.APP_PUBLIC_URL}${mediaURL({ id: seriesMedia.mediaid, title: seriesMedia.title, episodeId: episode?.mediaid })}`;

  const primaryMetadata = <VideoMetaData attributes={createVideoMetadata(selectedItem, t('video:total_episodes', { count: series.episode_count }))} />;
  const secondaryMetadata = episodeMetadata && episode && (
    <>
      <strong>{formatSeriesMetaString(episodeMetadata.seasonNumber, episodeMetadata.episodeNumber)}</strong> - {episode.title}
    </>
  );
  const filterMetadata =
    episodeMetadata &&
    ` ${t('video:season')} ${episodeMetadata.seasonNumber}/${filters?.length} - ${t('video:episode')} ${episodeMetadata.episodeNumber}/${episodesInSeason}`;
  const shareButton = <ShareButton title={selectedItem?.title} description={selectedItem.description} url={canonicalUrl} />;

  // For the old series approach we mark episodes as favorite items. New approach is applied to the series
  const favoriteButton = isFavoritesEnabled && <FavoriteButton item={seriesMedia || firstEpisode} />;
  const trailerButton = (!!trailerItem || isTrailerLoading) && (
    <Button
      label={t('video:trailer')}
      aria-label={t('video:watch_trailer')}
      startIcon={<Icon icon={PlayTrailer} />}
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
        {selectedItem ? (
          <script type="application/ld+json">{generateEpisodeJSONLD(series, seriesMedia, env.APP_PUBLIC_URL, episode, episodeMetadata)}</script>
        ) : null}
      </Helmet>
      <VideoLayout
        item={selectedItem}
        title={inlineLayout ? selectedItem.title : seriesMedia.title}
        description={selectedItem.description || seriesMedia.description}
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
        playlist={playlist}
        relatedTitle={inlineLayout ? seriesMedia.title : t('episodes')}
        getURL={getURL}
        setFilter={setSeasonFilter}
        currentFilter={seasonFilter}
        defaultFilterLabel={t('all_seasons')}
        activeLabel={t('current_episode')}
        watchHistory={watchHistoryDictionary}
        filterMetadata={filterMetadata}
        filters={filters}
        hasMore={hasNextEpisodesPage}
        loadMore={fetchNextEpisodes}
        player={
          inlineLayout ? (
            <InlinePlayer
              isLoggedIn={isLoggedIn}
              item={playEpisode}
              seriesItem={seriesMedia}
              onComplete={handleComplete}
              feedId={feedId ?? undefined}
              onPlay={handleInlinePlay}
              startWatchingButton={startWatchingButton}
              isEntitled={isEntitled}
              hasMediaOffers={hasMediaOffers}
              autostart={play || undefined}
            />
          ) : (
            <Cinema
              open={play && isEntitled}
              onClose={goBack}
              item={playEpisode}
              seriesItem={seriesMedia}
              title={seriesMedia.title}
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

export default MediaSeries;
