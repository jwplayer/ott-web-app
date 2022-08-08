import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import styles from './Movie.module.scss';

import useBlurImageUpdater from '#src/hooks/useBlurImageUpdater';
import { cardUrl, formatVideoMetaString, movieURL, videoUrl } from '#src/utils/formatting';
import type { PlaylistItem } from '#types/playlist';
import VideoDetails from '#src/components/VideoDetails/VideoDetails';
import ErrorPage from '#src/components/ErrorPage/ErrorPage';
import CardGrid from '#src/components/CardGrid/CardGrid';
import useMedia from '#src/hooks/useMedia';
import { generateMovieJSONLD } from '#src/utils/structuredData';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
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

type MovieRouteParams = {
  id: string;
};

const Movie = ({ match, location }: RouteComponentProps<MovieRouteParams>): JSX.Element => {
  const { t } = useTranslation('video');

  const [playTrailer, setPlayTrailer] = useState<boolean>(false);
  const breakpoint = useBreakpoint();

  // Routing
  const history = useHistory();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const id = match?.params.id;
  const play = searchParams.get('play') === '1';
  const feedId = searchParams.get('l');

  // Config
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { siteName, styling, features } = config;

  const posterFading: boolean = styling?.posterFading === true;
  const enableSharing: boolean = features?.enableSharing === true;
  const isFavoritesEnabled: boolean = Boolean(features?.favoritesList);

  // Media
  const { isLoading, error, data: item } = useMedia(id);
  useBlurImageUpdater(item);
  const { isLoading: isTrailerLoading, data: trailerItem } = useMedia(item?.trailerId || '');
  const { data: playlist } = usePlaylist(features?.recommendationsPlaylist || '', { related_media_id: id });

  const isLargeScreen = breakpoint >= Breakpoint.md;
  const imageSourceWidth = 640 * (window.devicePixelRatio > 1 || isLargeScreen ? 2 : 1);
  const poster = item?.image.replace('720', imageSourceWidth.toString()); // Todo: should be taken from images (1280 should be sent from API)

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const { isEntitled } = useEntitlement(item);

  // Handlers
  const goBack = () => item && history.push(videoUrl(item, searchParams.get('r'), false));
  const onCardClick = (item: PlaylistItem) => history.push(cardUrl(item));

  const handleComplete = useCallback(() => {
    if (!id || !playlist) return;

    const index = playlist.playlist.findIndex(({ mediaid }) => mediaid === id);
    const nextItem = playlist.playlist[index + 1];

    return nextItem && history.push(videoUrl(nextItem, searchParams.get('r'), true));
  }, [history, id, playlist, searchParams]);

  // Effects
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0, behavior: 'smooth' });
  }, [id]);

  // UI
  if (isLoading && !item) return <LoadingOverlay />;
  if ((!isLoading && error) || !item) return <ErrorPage title={t('video_not_found')} />;

  const pageTitle = `${item.title} - ${siteName}`;
  const canonicalUrl = item ? `${window.location.origin}${movieURL(item)}` : window.location.href;

  const primaryMetadata = formatVideoMetaString(item);

  return (
    <React.Fragment>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={item.description} />
        <meta property="og:description" content={item.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content="video.other" />
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
        {item ? <script type="application/ld+json">{generateMovieJSONLD(item)}</script> : null}
      </Helmet>
      <Cinema
        open={play && isEntitled}
        onClose={goBack}
        item={item}
        title={item.title}
        primaryMetadata={primaryMetadata}
        onComplete={handleComplete}
        feedId={feedId ?? undefined}
      />
      <TrailerModal item={trailerItem} title={`${item.title} - Trailer`} open={playTrailer} onClose={() => setPlayTrailer(false)} />
      <VideoDetails
        title={item.title}
        description={item.description}
        primaryMetadata={primaryMetadata}
        poster={poster}
        posterMode={posterFading ? 'fading' : 'normal'}
        shareButton={enableSharing && <ShareButton title={item.title} description={item.description} url={canonicalUrl} />}
        startWatchingButton={<StartWatchingButton item={item} playUrl={videoUrl(item, feedId, true)} />}
        favoriteButton={isFavoritesEnabled && <FavoriteButton item={item} />}
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
              <h3>{playlist.title}</h3>
            </div>
            <CardGrid
              playlist={playlist.playlist}
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

export default Movie;
