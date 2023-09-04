import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import VideoLayout from '#components/VideoLayout/VideoLayout';
import { isLocked } from '#src/utils/entitlements';
import { formatVideoMetaString, mediaURL } from '#src/utils/formatting';
import type { PlaylistItem } from '#types/playlist';
import useMedia from '#src/hooks/useMedia';
import { generateMovieJSONLD } from '#src/utils/structuredData';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import usePlaylist from '#src/hooks/usePlaylist';
import useEntitlement from '#src/hooks/useEntitlement';
import StartWatchingButton from '#src/containers/StartWatchingButton/StartWatchingButton';
import Cinema from '#src/containers/Cinema/Cinema';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import TrailerModal from '#src/containers/TrailerModal/TrailerModal';
import ShareButton from '#components/ShareButton/ShareButton';
import FavoriteButton from '#src/containers/FavoriteButton/FavoriteButton';
import PlayTrailer from '#src/icons/PlayTrailer';
import Button from '#components/Button/Button';
import type { ScreenComponent } from '#types/screens';
import useQueryParam from '#src/hooks/useQueryParam';
import InlinePlayer from '#src/containers/InlinePlayer/InlinePlayer';

const MediaMovie: ScreenComponent<PlaylistItem> = ({ data, isLoading }) => {
  const { t } = useTranslation('video');

  const [playTrailer, setPlayTrailer] = useState<boolean>(false);
  const breakpoint = useBreakpoint();

  // Routing
  const navigate = useNavigate();

  const params = useParams();
  const id = params.id || '';
  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');

  // Config
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { siteName, features, custom } = config;

  const isFavoritesEnabled: boolean = Boolean(features?.favoritesList);
  const inlineLayout = Boolean(custom?.inlinePlayer);

  // Media
  const { isLoading: isTrailerLoading, data: trailerItem } = useMedia(data?.trailerId || '');
  const { isLoading: isPlaylistLoading, data: playlist } = usePlaylist(features?.recommendationsPlaylist || '', { related_media_id: id });

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { isEntitled } = useEntitlement(data);

  // Handlers
  const goBack = () => data && navigate(mediaURL({ media: data, playlistId: feedId, play: false }));
  const getUrl = (item: PlaylistItem) => mediaURL({ media: item, playlistId: features?.recommendationsPlaylist });

  const handleComplete = useCallback(() => {
    if (!id || !playlist) return;

    const index = playlist.playlist.findIndex(({ mediaid }) => mediaid === id);
    const nextItem = playlist.playlist[index + 1];

    return nextItem && navigate(mediaURL({ media: nextItem, playlistId: features?.recommendationsPlaylist, play: true }));
  }, [id, playlist, navigate, features?.recommendationsPlaylist]);

  // Effects
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0 });
  }, [id]);

  // UI
  const pageTitle = `${data.title} - ${siteName}`;
  const canonicalUrl = data ? `${window.location.origin}${mediaURL({ media: data })}` : window.location.href;

  const primaryMetadata = formatVideoMetaString(data);
  const shareButton = <ShareButton title={data.title} description={data.description} url={canonicalUrl} />;
  const startWatchingButton = <StartWatchingButton item={data} playUrl={mediaURL({ media: data, playlistId: feedId, play: true })} />;

  const favoriteButton = isFavoritesEnabled && <FavoriteButton item={data} />;
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

  const isLoggedIn = !!user;
  const hasSubscription = !!subscription;

  return (
    <React.Fragment>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={data.description} />
        <meta property="og:description" content={data.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content="video.other" />
        {data.image && <meta property="og:image" content={data.image?.replace(/^https:/, 'http:')} />}
        {data.image && <meta property="og:image:secure_url" content={data.image?.replace(/^http:/, 'https:')} />}
        <meta property="og:image:width" content={data.image ? '720' : ''} />
        <meta property="og:image:height" content={data.image ? '406' : ''} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={data.description} />
        <meta name="twitter:image" content={data.image} />
        <meta property="og:video" content={canonicalUrl.replace(/^https:/, 'http:')} />
        <meta property="og:video:secure_url" content={canonicalUrl.replace(/^http:/, 'https:')} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {data.tags?.split(',').map((tag) => (
          <meta property="og:video:tag" content={tag} key={tag} />
        ))}
        {data ? <script type="application/ld+json">{generateMovieJSONLD(data)}</script> : null}
      </Helmet>
      <VideoLayout
        item={data}
        inlineLayout={inlineLayout}
        isLoading={isLoading || isPlaylistLoading}
        accessModel={accessModel}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
        title={data.title}
        description={data.description}
        image={data.backgroundImage}
        primaryMetadata={primaryMetadata}
        shareButton={shareButton}
        favoriteButton={favoriteButton}
        trailerButton={trailerButton}
        startWatchingButton={startWatchingButton}
        playlist={playlist}
        relatedTitle={playlist?.title}
        getURL={getUrl}
        activeLabel={t('current_video')}
        player={
          inlineLayout ? (
            <InlinePlayer
              isLoggedIn={isLoggedIn}
              item={data}
              onComplete={handleComplete}
              feedId={feedId ?? undefined}
              startWatchingButton={startWatchingButton}
              paywall={isLocked(accessModel, isLoggedIn, hasSubscription, data)}
              autostart={play || undefined}
            />
          ) : (
            <Cinema
              open={play && isEntitled}
              onClose={goBack}
              item={data}
              title={data.title}
              primaryMetadata={primaryMetadata}
              onComplete={handleComplete}
              feedId={feedId ?? undefined}
              onNext={handleComplete}
            />
          )
        }
      />
      <TrailerModal item={trailerItem} title={`${data.title} - Trailer`} open={playTrailer} onClose={() => setPlayTrailer(false)} />
    </React.Fragment>
  );
};

export default MediaMovie;
