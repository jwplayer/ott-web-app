import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import styles from './MediaMovie.module.scss';

import useBlurImageUpdater from '#src/hooks/useBlurImageUpdater';
import { formatVideoMetaString, mediaURL } from '#src/utils/formatting';
import type { PlaylistItem } from '#types/playlist';
import VideoDetails from '#src/components/VideoDetails/VideoDetails';
import CardGrid from '#src/components/CardGrid/CardGrid';
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
import ShareButton from '#src/components/ShareButton/ShareButton';
import FavoriteButton from '#src/containers/FavoriteButton/FavoriteButton';
import PlayTrailer from '#src/icons/PlayTrailer';
import Button from '#src/components/Button/Button';
import type { ScreenComponent } from '#types/screens';
import useQueryParam from '#src/hooks/useQueryParam';

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
  const { siteName, styling, features } = config;

  const posterFading: boolean = styling?.posterFading === true;
  const enableSharing: boolean = features?.enableSharing === true;
  const isFavoritesEnabled: boolean = Boolean(features?.favoritesList);

  // Media
  useBlurImageUpdater(data);
  const { isLoading: isTrailerLoading, data: trailerItem } = useMedia(data?.trailerId || '');
  const { data: playlist } = usePlaylist(features?.recommendationsPlaylist || '', { related_media_id: id });

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { isEntitled } = useEntitlement(data);

  // Handlers
  const goBack = () => data && navigate(mediaURL(data, feedId, false));
  const onCardClick = (item: PlaylistItem) => navigate(mediaURL(item));

  const handleComplete = useCallback(() => {
    if (!id || !playlist) return;

    const index = playlist.playlist.findIndex(({ mediaid }) => mediaid === id);
    const nextItem = playlist.playlist[index + 1];

    return nextItem && navigate(mediaURL(nextItem, feedId, true));
  }, [id, playlist, navigate, feedId]);

  // Effects
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0, behavior: 'smooth' });
  }, [id]);

  // UI
  const pageTitle = `${data.title} - ${siteName}`;
  const canonicalUrl = data ? `${window.location.origin}${mediaURL(data)}` : window.location.href;

  const primaryMetadata = formatVideoMetaString(data);

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
      <Cinema
        open={play && isEntitled}
        onClose={goBack}
        item={data}
        title={data.title}
        primaryMetadata={primaryMetadata}
        onComplete={handleComplete}
        feedId={feedId ?? undefined}
      />
      <TrailerModal item={trailerItem} title={`${data.title} - Trailer`} open={playTrailer} onClose={() => setPlayTrailer(false)} />
      <VideoDetails
        title={data.title}
        description={data.description}
        primaryMetadata={primaryMetadata}
        image={data.backgroundImage}
        posterMode={posterFading ? 'fading' : 'normal'}
        shareButton={enableSharing && <ShareButton title={data.title} description={data.description} url={canonicalUrl} />}
        startWatchingButton={<StartWatchingButton item={data} playUrl={mediaURL(data, feedId, true)} />}
        favoriteButton={isFavoritesEnabled && <FavoriteButton item={data} />}
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
        {playlist ? (
          <>
            <div className={styles.related}>
              <h3>{playlist.title || '\u00A0'}</h3>
            </div>
            <CardGrid
              playlist={playlist}
              onCardClick={onCardClick}
              isLoading={isLoading}
              enableCardTitles={styling.shelfTitles}
              accessModel={accessModel}
              isLoggedIn={!!user}
              hasSubscription={!!subscription}
            />
          </>
        ) : undefined}
      </VideoDetails>
    </React.Fragment>
  );
};

export default MediaMovie;
