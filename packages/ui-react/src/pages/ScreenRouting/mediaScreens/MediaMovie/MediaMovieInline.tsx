import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import PlayTrailer from '@jwp/ott-theme/assets/icons/play_trailer.svg?react';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import useMovieData from '@jwp/ott-hooks-react/src/useMovieData';
import useMovieParams from '@jwp/ott-ui-react/src/hooks/useMovieParams';
import useMovieHandlers from '@jwp/ott-ui-react/src/hooks/useMovieHandlers';
import useScrollReset from '@jwp/ott-ui-react/src/hooks/useScrollReset';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { ScreenComponent } from '@jwp/ott-ui-react/types/screens';
import TrailerModal from '@jwp/ott-ui-react/src/containers/TrailerModal/TrailerModal';
import ShareButton from '@jwp/ott-ui-react/src/components/ShareButton/ShareButton';
import FavoriteButton from '@jwp/ott-ui-react/src/containers/FavoriteButton/FavoriteButton';
import Button from '@jwp/ott-ui-react/src/components/Button/Button';
import Icon from '@jwp/ott-ui-react/src/components/Icon/Icon';
import MediaHead from '@jwp/ott-ui-react/src/components/MediaHead/MediaHead';
import StartWatchingButton from '@jwp/ott-ui-react/src/containers/StartWatchingButton/StartWatchingButton';
import VideoDetailsInline from '@jwp/ott-ui-react/src/components/VideoDetailsInline/VideoDetailsInline';
import MediaSectionRelated from '@jwp/ott-ui-react/src/containers/MediaSectionRelated/MediaSectionRelated';
import MediaSectionRelatedList from '@jwp/ott-ui-react/src/containers/MediaSectionRelatedList/MediaSectionRelatedList';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import VideoMetaData from '@jwp/ott-ui-react/src/components/VideoMetaData/VideoMetaData';
import MediaInlineLayout from '@jwp/ott-ui-react/src/components/MediaInlineLayout/MediaInlineLayout';
import env from '@jwp/ott-common/src/env';

import InlinePlayer from '../../../../containers/InlinePlayer/InlinePlayer';

import styles from './MediaMovieInline.module.scss';

const MediaMovie: ScreenComponent<PlaylistItem> = ({ data, isLoading }) => {
  const { t } = useTranslation('video');
  const { id, play, feedId } = useMovieParams();
  const {
    playlist,
    nextItem,
    movieURL,
    trailerItem,
    mediaOffers,
    hasTrailer,
    isPlaylistLoading,
    isFavoritesEnabled,
    isEntitled,
    playTrailer,
    primaryMetadata,
    setPlayTrailer,
  } = useMovieData(data, id, feedId);
  const { handleComplete } = useMovieHandlers(nextItem, movieURL);

  const canonicalUrl = data ? `${env.APP_PUBLIC_URL}${mediaURL({ id: data.mediaid, title: data.title })}` : window.location.href;

  useScrollReset(id);

  // inline layout specific
  const breakpoint = useBreakpoint();
  const isTablet = breakpoint === Breakpoint.sm || breakpoint === Breakpoint.md;
  const { user } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  const startWatchingButton = (
    <StartWatchingButton
      key={id} // necessary to fix autofocus on TalkBack
      item={data}
      playUrl={mediaURL({ id: data.mediaid, title: data.title, playlistId: feedId, play: true })}
    />
  );

  return (
    <React.Fragment>
      <MediaHead canonicalUrl={canonicalUrl} data={data} />
      <MediaInlineLayout
        player={
          <InlinePlayer
            isLoggedIn={!!user}
            item={data}
            onComplete={handleComplete}
            feedId={feedId ?? undefined}
            startWatchingButton={startWatchingButton}
            isEntitled={isEntitled}
            hasMediaOffers={!!mediaOffers.length}
            autostart={play || undefined}
          />
        }
        videoDetails={
          <VideoDetailsInline
            title={data.title}
            live={data?.duration === 0}
            description={data.description}
            primaryMetadata={<VideoMetaData attributes={primaryMetadata} />}
            shareButton={<ShareButton title={data.title} description={data.description} url={canonicalUrl} />}
            favoriteButton={isFavoritesEnabled && <FavoriteButton item={data} />}
            trailerButton={
              hasTrailer && (
                <Button
                  label={t('video:trailer')}
                  aria-label={t('video:watch_trailer')}
                  startIcon={<Icon icon={PlayTrailer} />}
                  onClick={() => setPlayTrailer(true)}
                  active={playTrailer}
                  fullWidth={breakpoint < Breakpoint.md}
                  disabled={!trailerItem}
                />
              )
            }
          />
        }
      >
        {isTablet ? (
          <MediaSectionRelated className={styles.relatedVideosGrid} playlist={playlist} item={data} isLoading={isLoading || isPlaylistLoading} />
        ) : (
          <MediaSectionRelatedList playlist={playlist} item={data} isLoading={isLoading || isPlaylistLoading} />
        )}
        <TrailerModal item={trailerItem} title={`${data.title} - Trailer`} open={playTrailer} onClose={() => setPlayTrailer(false)} />
      </MediaInlineLayout>
    </React.Fragment>
  );
};

export default MediaMovie;
