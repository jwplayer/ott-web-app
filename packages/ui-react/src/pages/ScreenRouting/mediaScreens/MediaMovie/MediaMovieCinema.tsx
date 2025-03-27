import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import PlayTrailer from '@jwp/ott-theme/assets/icons/play_trailer.svg?react';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import useMovieData from '@jwp/ott-hooks-react/src/useMovieData';
import useMovieParams from '@jwp/ott-ui-react/src/hooks/useMovieParams';
import useMovieHandlers from '@jwp/ott-ui-react/src/hooks/useMovieHandlers';
import useScrollReset from '@jwp/ott-ui-react/src/hooks/useScrollReset';
import type { ScreenComponent } from '@jwp/ott-ui-react/types/screens';
import Cinema from '@jwp/ott-ui-react/src/containers/Cinema/Cinema';
import TrailerModal from '@jwp/ott-ui-react/src/containers/TrailerModal/TrailerModal';
import ShareButton from '@jwp/ott-ui-react/src/components/ShareButton/ShareButton';
import FavoriteButton from '@jwp/ott-ui-react/src/containers/FavoriteButton/FavoriteButton';
import Button from '@jwp/ott-ui-react/src/components/Button/Button';
import Icon from '@jwp/ott-ui-react/src/components/Icon/Icon';
import VideoMetaData from '@jwp/ott-ui-react/src/components/VideoMetaData/VideoMetaData';
import HeroDescription from '@jwp/ott-ui-react/src/components/Hero/HeroDescription';
import MediaHead from '@jwp/ott-ui-react/src/components/MediaHead/MediaHead';
import MediaHeroInfo from '@jwp/ott-ui-react/src/components/MediaHeroInfo/MediaHeroInfo';
import MediaHeroButtons from '@jwp/ott-ui-react/src/components/MediaHeroButtons/MediaHeroButtons';
import MediaHero from '@jwp/ott-ui-react/src/components/MediaHero/MediaHero';
import MediaSectionRelated from '@jwp/ott-ui-react/src/containers/MediaSectionRelated/MediaSectionRelated';
import StartWatchingButton from '@jwp/ott-ui-react/src/containers/StartWatchingButton/StartWatchingButton';
import env from '@jwp/ott-common/src/env';

const MediaMovieCinema: ScreenComponent<PlaylistItem> = ({ data, isLoading }) => {
  const { t } = useTranslation('video');
  const { id, play, feedId } = useMovieParams();
  const {
    playlist,
    nextItem,
    playUrl,
    movieURL,
    trailerItem,
    hasTrailer,
    isFavoritesEnabled,
    isEntitled,
    playTrailer,
    primaryMetadata,
    isPlaylistLoading,
    setPlayTrailer,
  } = useMovieData(data, id, feedId);
  const { handleBack, handleComplete } = useMovieHandlers(nextItem, movieURL);
  const canonicalUrl = data ? `${env.APP_PUBLIC_URL}${mediaURL({ id: data.mediaid, title: data.title })}` : window.location.href;

  useScrollReset(id);

  return (
    <React.Fragment>
      <MediaHead canonicalUrl={canonicalUrl} data={data} />
      <MediaHero image={data.backgroundImage}>
        <MediaHeroInfo
          title={data.title}
          description={<HeroDescription description={data.description} />}
          metadataComponent={<VideoMetaData attributes={primaryMetadata} />}
          formatComponent={null}
          definitionComponent={null}
        />
        <MediaHeroButtons
          buttonClassOverride={false}
          cta={
            <StartWatchingButton
              key={id} // necessary to fix autofocus on TalkBack
              item={data}
              playUrl={playUrl}
            />
          }
        >
          {hasTrailer ? (
            <Button
              label={t('video:trailer')}
              aria-label={t('video:watch_trailer')}
              startIcon={<Icon icon={PlayTrailer} />}
              onClick={() => setPlayTrailer(true)}
              active={playTrailer}
              disabled={!trailerItem}
            />
          ) : undefined}
          {isFavoritesEnabled ? <FavoriteButton item={data} /> : undefined}
          <ShareButton title={data.title} description={data.description} url={canonicalUrl} />
        </MediaHeroButtons>
      </MediaHero>
      <MediaSectionRelated playlist={playlist} item={data} isLoading={isLoading || isPlaylistLoading} />
      <Cinema
        open={play && isEntitled}
        onClose={handleBack}
        item={data}
        title={data.title}
        primaryMetadata={<VideoMetaData attributes={primaryMetadata} />}
        onComplete={handleComplete}
        feedId={feedId ?? undefined}
        onNext={handleComplete}
      />
      <TrailerModal item={trailerItem} title={`${data.title} - Trailer`} open={playTrailer} onClose={() => setPlayTrailer(false)} />
    </React.Fragment>
  );
};

export default MediaMovieCinema;
