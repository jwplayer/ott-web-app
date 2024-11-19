import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { createVideoMetadata } from '@jwp/ott-common/src/utils/metadata';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { generateMovieJSONLD } from '@jwp/ott-common/src/utils/structuredData';
import useMedia from '@jwp/ott-hooks-react/src/useMedia';
import usePlaylist from '@jwp/ott-hooks-react/src/usePlaylist';
import useEntitlement from '@jwp/ott-hooks-react/src/useEntitlement';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import PlayTrailer from '@jwp/ott-theme/assets/icons/play_trailer.svg?react';
import useQueryParam from '@jwp/ott-ui-react/src/hooks/useQueryParam';
import env from '@jwp/ott-common/src/env';

import type { ScreenComponent } from '../../../../../types/screens';
import VideoLayout from '../../../../components/VideoLayout/VideoLayout';
import StartWatchingButton from '../../../../containers/StartWatchingButton/StartWatchingButton';
import Cinema from '../../../../containers/Cinema/Cinema';
import TrailerModal from '../../../../containers/TrailerModal/TrailerModal';
import ShareButton from '../../../../components/ShareButton/ShareButton';
import FavoriteButton from '../../../../containers/FavoriteButton/FavoriteButton';
import Button from '../../../../components/Button/Button';
import InlinePlayer from '../../../../containers/InlinePlayer/InlinePlayer';
import Icon from '../../../../components/Icon/Icon';
import VideoMetaData from '../../../../components/VideoMetaData/VideoMetaData';

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
  const { isEntitled, mediaOffers } = useEntitlement(data);
  const hasMediaOffers = !!mediaOffers.length;

  // Handlers
  const goBack = () => data && navigate(mediaURL({ id: data.mediaid, title: data.title, playlistId: feedId, play: false }));
  const getUrl = (item: PlaylistItem) => mediaURL({ id: item.mediaid, title: item.title, playlistId: features?.recommendationsPlaylist });

  const handleComplete = useCallback(() => {
    if (!id || !playlist) return;

    const index = playlist.playlist.findIndex(({ mediaid }) => mediaid === id);
    const nextItem = playlist.playlist[index + 1];

    return nextItem && navigate(mediaURL({ id: nextItem.mediaid, title: nextItem.title, playlistId: features?.recommendationsPlaylist, play: true }));
  }, [id, playlist, navigate, features?.recommendationsPlaylist]);

  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0 });
    (document.querySelector('#video-details button') as HTMLElement)?.focus();
  }, [id]);

  // UI
  const pageTitle = `${data.title} - ${siteName}`;
  const canonicalUrl = data ? `${env.APP_PUBLIC_URL}${mediaURL({ id: data.mediaid, title: data.title })}` : window.location.href;

  const primaryMetadata = <VideoMetaData attributes={createVideoMetadata(data)} />;
  const shareButton = <ShareButton title={data.title} description={data.description} url={canonicalUrl} />;
  const startWatchingButton = (
    <StartWatchingButton
      key={id} // necessary to fix autofocus on TalkBack
      item={data}
      playUrl={mediaURL({ id: data.mediaid, title: data.title, playlistId: feedId, play: true })}
    />
  );

  const favoriteButton = isFavoritesEnabled && <FavoriteButton item={data} />;
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
        {data ? <script type="application/ld+json">{generateMovieJSONLD(data, env.APP_PUBLIC_URL)}</script> : null}
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
              isEntitled={isEntitled}
              hasMediaOffers={hasMediaOffers}
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
