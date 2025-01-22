import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useWatchHistoryStore } from '@jwp/ott-common/src/stores/WatchHistoryStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { createPlaylistMetadata, createVideoMetadata } from '@jwp/ott-common/src/utils/metadata';
import { formatSeriesMetaString } from '@jwp/ott-common/src/utils/formatting';
import { legacySeriesURL } from '@jwp/ott-common/src/utils/urlFormatting';
import useEntitlement from '@jwp/ott-hooks-react/src/useEntitlement';
import useMedia from '@jwp/ott-hooks-react/src/useMedia';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import useQueryParam from '@jwp/ott-ui-react/src/hooks/useQueryParam';
import usePlaylist from '@jwp/ott-hooks-react/src/usePlaylist';
import PlayTrailer from '@jwp/ott-theme/assets/icons/play_trailer.svg?react';
import env from '@jwp/ott-common/src/env';

import VideoLayout from '../../components/VideoLayout/VideoLayout';
import InlinePlayer from '../../containers/InlinePlayer/InlinePlayer';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import StartWatchingButton from '../../containers/StartWatchingButton/StartWatchingButton';
import Cinema from '../../containers/Cinema/Cinema';
import TrailerModal from '../../containers/TrailerModal/TrailerModal';
import ShareButton from '../../components/ShareButton/ShareButton';
import FavoriteButton from '../../containers/FavoriteButton/FavoriteButton';
import Button from '../../components/Button/Button';
import Loading from '../Loading/Loading';
import Icon from '../../components/Icon/Icon';
import VideoMetaData from '../../components/VideoMetaData/VideoMetaData';

import { filterSeries, generateLegacyEpisodeJSONLD, getEpisodesInSeason, getFiltersFromSeries, getNextItem } from './utils';

const LegacySeries = () => {
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
  const { isLoading: isSeriesPlaylistLoading, data: seriesPlaylist, isError: isPlaylistError } = usePlaylist(seriesId, {}, true, false);
  const { isLoading: isEpisodeLoading, data: episode } = useMedia(episodeId || '');
  const { isLoading: isTrailerLoading, data: trailerItem } = useMedia(episode?.trailerId || '');

  const episodeMetadata = useMemo(() => ({ episodeNumber: episode?.episodeNumber || '0', seasonNumber: episode?.seasonNumber || '0' }), [episode]);

  // Whether we show series or episode information. For old series flow we only have access to the playlist
  const selectedItem = episode || seriesPlaylist;
  const selectedItemImage = (selectedItem?.image as string) || '';

  // Config
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { features, siteName, custom } = config;
  const isFavoritesEnabled: boolean = Boolean(features?.favoritesList);
  const inlineLayout = Boolean(custom?.inlinePlayer);

  // Filters
  const filters = useMemo(() => getFiltersFromSeries(seriesPlaylist), [seriesPlaylist]);
  const [seasonFilter, setSeasonFilter] = useState<string | undefined>(undefined);

  const firstEpisode = useMemo(() => seriesPlaylist?.playlist?.[0], [seriesPlaylist]);
  const filteredPlaylist = useMemo(() => filterSeries(seriesPlaylist, seasonFilter), [seriesPlaylist, seasonFilter]);
  const episodesInSeason = getEpisodesInSeason(episode, seriesPlaylist);
  const nextItem = useMemo(() => getNextItem(episode, seriesPlaylist), [episode, seriesPlaylist]);

  // Watch history
  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionaryWithEpisodes());

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { isEntitled, mediaOffers } = useEntitlement(episode || firstEpisode);
  const hasMediaOffers = !!mediaOffers.length;
  const isLoggedIn = !!user;
  const hasSubscription = !!subscription;

  // Handlers
  const goBack = () => episode && navigate(legacySeriesURL({ episodeId: episode.mediaid, seriesId, play: false, playlistId: feedId }));
  const getUrl = (toEpisode: PlaylistItem) => {
    return seriesPlaylist ? legacySeriesURL({ episodeId: toEpisode.mediaid, seriesId, play: false, playlistId: feedId }) : '';
  };

  const handleComplete = useCallback(async () => {
    navigate(legacySeriesURL({ episodeId: nextItem?.mediaid, seriesId, play: !!nextItem, playlistId: feedId }));
  }, [navigate, nextItem, seriesId, feedId]);

  // Effects
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0 });
    (document.querySelector('#video-details button') as HTMLElement)?.focus();
  }, [episode]);

  useEffect(() => {
    if (isSeriesPlaylistLoading || isEpisodeLoading) {
      return;
    }

    if (seasonFilter === undefined) {
      setSeasonFilter(parseInt(episodeMetadata?.seasonNumber, 10) ? episodeMetadata?.seasonNumber : filters?.[0]?.value || '');
    }
  }, [episodeMetadata, seasonFilter, isSeriesPlaylistLoading, isEpisodeLoading, filters]);

  // UI
  const isLoading = isSeriesPlaylistLoading || isEpisodeLoading;
  if (isLoading) return <Loading />;
  if (isPlaylistError || !seriesPlaylist || !selectedItem || !firstEpisode) return <ErrorPage title={t('series_error')} />;

  const pageTitle = `${selectedItem.title} - ${siteName}`;
  const pageDescription = selectedItem?.description || '';
  const canonicalUrl = `${env.APP_PUBLIC_URL}${legacySeriesURL({ episodeId: episode?.mediaid, seriesId })}`;
  const backgroundImage = (selectedItem.backgroundImage as string) || undefined;

  const primaryMetadata = episode ? (
    <VideoMetaData
      attributes={createVideoMetadata(episode, {
        episodesLabel: t('video:total_episodes', { count: seriesPlaylist?.playlist?.length }),
        hoursAbbreviation: t('common:abbreviation.hours'),
        minutesAbbreviation: t('common:abbreviation.minutes'),
      })}
    />
  ) : (
    <VideoMetaData attributes={createPlaylistMetadata(seriesPlaylist, t('video:total_episodes', { count: seriesPlaylist?.playlist?.length }))} />
  );
  const secondaryMetadata = episodeMetadata && episode && (
    <>
      <strong>{formatSeriesMetaString(episodeMetadata.seasonNumber, episodeMetadata.episodeNumber)}</strong> - {episode.title}
    </>
  );
  const filterMetadata =
    episodeMetadata &&
    ` ${t('video:season')} ${episodeMetadata.seasonNumber}/${filters?.length} - ${t('video:episode')} ${episodeMetadata.episodeNumber}/${episodesInSeason}`;
  const shareButton = <ShareButton title={selectedItem?.title} description={pageDescription} url={canonicalUrl} />;
  const startWatchingButton = (
    <StartWatchingButton
      key={episodeId} // necessary to fix autofocus on TalkBack
      item={episode || firstEpisode}
      playUrl={legacySeriesURL({ episodeId: episode?.mediaid || firstEpisode?.mediaid, seriesId, play: true, playlistId: feedId })}
    />
  );

  // For the old series approach we mark episodes as favorite items. New approach is applied to the series
  const favoriteButton = isFavoritesEnabled && <FavoriteButton item={episode || firstEpisode} />;
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
        <meta name="description" content={pageDescription} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content={episode ? 'video.episode' : 'video.series'} />
        {selectedItemImage && <meta property="og:image" content={selectedItemImage?.replace(/^https:/, 'http:')} />}
        {selectedItemImage && <meta property="og:image:secure_url" content={selectedItemImage?.replace(/^http:/, 'https:')} />}
        {selectedItemImage && <meta property="og:image:width" content={selectedItemImage ? '720' : ''} />}
        {selectedItemImage && <meta property="og:image:height" content={selectedItemImage ? '406' : ''} />}
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {selectedItemImage && <meta name="twitter:image" content={selectedItemImage} />}
        <meta property="og:video" content={canonicalUrl.replace(/^https:/, 'http:')} />
        <meta property="og:video:secure_url" content={canonicalUrl.replace(/^http:/, 'https:')} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {selectedItem.tags
          ? String(selectedItem.tags)
              .split(',')
              .map((tag: string) => <meta property="og:video:tag" content={tag} key={tag} />)
          : null}
        {seriesPlaylist && selectedItem ? (
          <script type="application/ld+json">{generateLegacyEpisodeJSONLD(seriesPlaylist, episode, episodeMetadata, seriesId)}</script>
        ) : null}
      </Helmet>
      <VideoLayout
        item={episode}
        title={selectedItem.title}
        description={pageDescription}
        inlineLayout={inlineLayout}
        primaryMetadata={primaryMetadata}
        secondaryMetadata={secondaryMetadata}
        image={backgroundImage}
        shareButton={shareButton}
        favoriteButton={favoriteButton}
        trailerButton={trailerButton}
        startWatchingButton={startWatchingButton}
        isLoading={isLoading}
        accessModel={accessModel}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
        playlist={filteredPlaylist}
        relatedTitle={inlineLayout ? selectedItem.title : t('episodes')}
        setFilter={setSeasonFilter}
        currentFilter={seasonFilter}
        defaultFilterLabel={t('all_seasons')}
        activeLabel={t('current_episode')}
        watchHistory={watchHistoryDictionary}
        filterMetadata={filterMetadata}
        filters={filters}
        getURL={getUrl}
        player={
          inlineLayout && (episode || firstEpisode) ? (
            <InlinePlayer
              isLoggedIn={isLoggedIn}
              item={episode || firstEpisode}
              onComplete={handleComplete}
              feedId={feedId ?? undefined}
              startWatchingButton={startWatchingButton}
              isEntitled={isEntitled}
              hasMediaOffers={hasMediaOffers}
              autostart={play || undefined}
            />
          ) : (
            <Cinema
              open={play && isEntitled}
              onClose={goBack}
              item={episode || firstEpisode}
              title={episode?.title || firstEpisode.title}
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

export default LegacySeries;
