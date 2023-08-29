import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import { useLiveEvent } from '#src/hooks/useLiveEvent';
import { MediaStatus } from '#src/utils/liveEvent';
import type { ScreenComponent } from '#types/screens';
import VideoLayout from '#components/VideoLayout/VideoLayout';
import { isLocked } from '#src/utils/entitlements';
import { formatLiveEventMetaString, mediaURL } from '#src/utils/formatting';
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
import useQueryParam from '#src/hooks/useQueryParam';
import InlinePlayer from '#src/containers/InlinePlayer/InlinePlayer';
import StatusIcon from '#components/StatusIcon/StatusIcon';

const MediaEvent: ScreenComponent<PlaylistItem> = ({ data: media, isLoading }) => {
  const { t, i18n } = useTranslation('video');

  const [playTrailer, setPlayTrailer] = useState<boolean>(false);
  const breakpoint = useBreakpoint();

  // Routing
  const navigate = useNavigate();

  const params = useParams();
  const id = params.id || '';
  const play = useQueryParam('play') === '1';
  const playlistId = useQueryParam('r');

  // Config
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { siteName, features, custom } = config;

  const isFavoritesEnabled: boolean = Boolean(features?.favoritesList);
  const inlineLayout = Boolean(custom?.inlinePlayer);

  // Media
  const { isLoading: isTrailerLoading, data: trailerItem } = useMedia(media?.trailerId || '');
  const { isLoading: isPlaylistLoading, data: playlist } = usePlaylist(playlistId || '');

  // Event
  const liveEvent = useLiveEvent(media);

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { isEntitled } = useEntitlement(media);

  // Handlers
  const goBack = () => media && navigate(mediaURL({ media, playlistId, play: false }));
  const getUrl = (item: PlaylistItem) => mediaURL({ media: item, playlistId });

  const handleComplete = useCallback(() => {
    if (!id || !playlist) return;

    const index = playlist.playlist.findIndex(({ mediaid }) => mediaid === id);
    const nextItem = playlist.playlist[index + 1];

    if (nextItem.mediaStatus === MediaStatus.SCHEDULED) {
      return;
    }

    return nextItem && navigate(mediaURL({ media: nextItem, playlistId, play: true }));
  }, [id, playlist, navigate, playlistId]);

  // Effects
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0 });
  }, [id]);

  // UI
  const pageTitle = `${media.title} - ${siteName}`;
  const canonicalUrl = media ? `${window.location.origin}${mediaURL({ media: media })}` : window.location.href;

  const primaryMetadata = (
    <>
      <StatusIcon mediaStatus={media.mediaStatus} />
      {formatLiveEventMetaString(media, i18n.language)}
    </>
  );

  const shareButton = <ShareButton title={media.title} description={media.description} url={canonicalUrl} />;
  const startWatchingButton = <StartWatchingButton item={media} playUrl={mediaURL({ media, playlistId, play: true })} disabled={!liveEvent.isPlayable} />;

  const favoriteButton = isFavoritesEnabled && <FavoriteButton item={media} />;
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
        <meta name="description" content={media.description} />
        <meta property="og:description" content={media.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content="video.other" />
        {media.image && <meta property="og:image" content={media.image?.replace(/^https:/, 'http:')} />}
        {media.image && <meta property="og:image:secure_url" content={media.image?.replace(/^http:/, 'https:')} />}
        <meta property="og:image:width" content={media.image ? '720' : ''} />
        <meta property="og:image:height" content={media.image ? '406' : ''} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={media.description} />
        <meta name="twitter:image" content={media.image} />
        <meta property="og:video" content={canonicalUrl.replace(/^https:/, 'http:')} />
        <meta property="og:video:secure_url" content={canonicalUrl.replace(/^http:/, 'https:')} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {media.tags?.split(',').map((tag) => (
          <meta property="og:video:tag" content={tag} key={tag} />
        ))}
        {media ? <script type="application/ld+json">{generateMovieJSONLD(media)}</script> : null}
      </Helmet>
      <VideoLayout
        item={media}
        inlineLayout={inlineLayout}
        isLoading={isLoading || isPlaylistLoading}
        accessModel={accessModel}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
        title={media.title}
        description={media.description}
        image={media.backgroundImage}
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
              item={media}
              onComplete={handleComplete}
              feedId={playlistId ?? undefined}
              startWatchingButton={startWatchingButton}
              paywall={isLocked(accessModel, isLoggedIn, hasSubscription, media)}
              autostart={liveEvent.isPlayable && (play || undefined)}
              playable={liveEvent.isPlayable}
            />
          ) : (
            <Cinema
              open={play && isEntitled}
              onClose={goBack}
              item={media}
              title={media.title}
              primaryMetadata={primaryMetadata}
              onComplete={handleComplete}
              feedId={playlistId ?? undefined}
              onNext={handleComplete}
            />
          )
        }
      />
      <TrailerModal item={trailerItem} title={`${media.title} - Trailer`} open={playTrailer} onClose={() => setPlayTrailer(false)} />
    </React.Fragment>
  );
};

export default MediaEvent;
