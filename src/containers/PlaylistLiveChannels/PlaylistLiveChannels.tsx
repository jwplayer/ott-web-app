import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import shallow from 'zustand/shallow';
import { useHistory, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { differenceInSeconds, format } from 'date-fns';

import Epg from '../../components/Epg/Epg';

import styles from './PlaylistLiveChannels.module.scss';

import useBlurImageUpdater from '#src/hooks/useBlurImageUpdater';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { Playlist } from '#types/playlist';
import VideoDetails from '#src/components/VideoDetails/VideoDetails';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import useLiveChannels from '#src/hooks/useLiveChannels';
import ShareButton from '#src/components/ShareButton/ShareButton';
import StartWatchingButton from '#src/containers/StartWatchingButton/StartWatchingButton';
import Cinema from '#src/containers/Cinema/Cinema';
import useEntitlement from '#src/hooks/useEntitlement';
import { addQueryParams, formatDurationTag } from '#src/utils/formatting';
import Button from '#src/components/Button/Button';
import Play from '#src/icons/Play';
import useLiveProgram from '#src/hooks/useLiveProgram';
import Tag from '#src/components/Tag/Tag';

function PlaylistLiveChannels({ playlist: { feedid, title, playlist } }: { playlist: Playlist }) {
  const { t } = useTranslation('epg');

  // Config
  const { config } = useConfigStore(({ config }) => ({ config }), shallow);
  const { siteName, styling, features } = config;

  const posterFading: boolean = styling?.posterFading === true;
  const enableSharing: boolean = features?.enableSharing === true;

  const updateBlurImage = useBlurImageUpdater(playlist);

  // Routing
  const location = useLocation();
  const history = useHistory();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const play = searchParams.get('play') === '1';
  const liveStartDateTime = searchParams.get('start');
  const liveEndDateTime = searchParams.get('end');
  const liveFromBeginning = searchParams.get('beginning') === '1';
  const goBack = () => history.push(`/p/${feedid}`, false);

  // EPG data
  const { channels, channel, program, setActiveChannel } = useLiveChannels(playlist, !liveFromBeginning);
  const { isLive, isVod, isWatchableFromBeginning } = useLiveProgram(program);

  // Media item
  const channelMediaItem = useMemo(() => playlist.find(({ mediaid }) => channel?.id === mediaid), [channel?.id, playlist]);
  const { isEntitled } = useEntitlement(channelMediaItem);

  const videoDetails = useMemo(() => {
    if (program) {
      return {
        title: program.title,
        description: program.description || '',
        poster: program.image,
        canWatch: isLive || (isVod && isWatchableFromBeginning),
        canWatchFromBeginning: isEntitled && isLive && isWatchableFromBeginning,
      };
    }

    return {
      title: channel?.title || '',
      description: channel?.description || '',
      poster: channel?.image,
      canWatch: true,
      canWatchFromBeginning: false,
    };
  }, [channel, isEntitled, isLive, isVod, isWatchableFromBeginning, program]);

  const primaryMetadata = useMemo(() => {
    if (!channel) {
      return '';
    }

    if (!program) {
      return <Tag isLive>{t('common:live')}</Tag>;
    }

    const startTime = new Date(program.startTime);
    const endTime = new Date(program.endTime);
    const durationInSeconds = differenceInSeconds(endTime, startTime);
    const duration = formatDurationTag(durationInSeconds);

    return (
      <>
        <Tag className={styles.tag} isLive={isLive}>
          {isLive ? t('common:live') : `${format(startTime, 'p')} - ${format(endTime, 'p')}`}
        </Tag>
        {t('on_channel', { name: channel.title })}
        {' • '}
        {duration}
      </>
    );
  }, [channel, isLive, program, t]);

  // Effects
  useEffect(() => {
    const toImage = program?.image || channelMediaItem?.image;
    if (toImage) updateBlurImage(toImage);
  }, [channelMediaItem?.image, program, updateBlurImage]);

  // Loading
  if (!channel) {
    return <LoadingOverlay />;
  }

  const pageTitle = `${title} - ${siteName}`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
        <meta name="twitter:title" content={pageTitle} />
      </Helmet>
      {channelMediaItem && (
        <Cinema
          open={play && isEntitled}
          onClose={goBack}
          item={channelMediaItem}
          title={videoDetails.title}
          primaryMetadata={primaryMetadata}
          feedId={feedid}
          liveStartDateTime={liveStartDateTime}
          liveEndDateTime={liveEndDateTime}
          liveFromBeginning={liveFromBeginning}
        />
      )}
      <VideoDetails
        title={videoDetails.title}
        description={videoDetails.description}
        primaryMetadata={primaryMetadata}
        posterMode={posterFading ? 'fading' : 'normal'}
        poster={videoDetails.poster}
        startWatchingButton={
          channelMediaItem ? (
            <>
              <StartWatchingButton
                item={channelMediaItem}
                playUrl={addQueryParams(`/p/${feedid}`, {
                  play: 1,
                  start: isVod ? program?.startTime : undefined,
                  end: isVod ? program?.endTime : undefined,
                })}
                disabled={!videoDetails.canWatch}
              />
              {videoDetails.canWatchFromBeginning && (
                <Button
                  className={styles.catchupButton}
                  onClick={() =>
                    history.push(
                      addQueryParams(`/p/${feedid}`, {
                        play: 1,
                        start: program?.startTime,
                        beginning: 1,
                      }),
                    )
                  }
                  label={t('start_from_beginning')}
                  startIcon={<Play />}
                />
              )}
            </>
          ) : null
        }
        shareButton={
          enableSharing && channelMediaItem ? (
            <ShareButton title={channelMediaItem.title} description={channelMediaItem.description} url={window.location.href} />
          ) : null
        }
        trailerButton={null}
        favoriteButton={null}
      >
        <Epg channels={channels} setActiveChannel={setActiveChannel} program={program} />
      </VideoDetails>
    </>
  );
}

export default PlaylistLiveChannels;
