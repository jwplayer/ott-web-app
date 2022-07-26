import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import shallow from 'zustand/shallow';
import { Epg, Layout } from 'planby';
import { useHistory, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

import styles from './PlaylistLiveChannels.module.scss';

import useBlurImageUpdater from '#src/hooks/useBlurImageUpdater';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { Playlist } from '#types/playlist';
import VideoDetails from '#src/components/VideoDetails/VideoDetails';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import useLiveChannels from '#src/hooks/useLiveChannels';
import Timeline from '#src/components/Epg/Timeline';
import ProgramItem from '#src/components/Epg/ProgramItem';
import ChannelItem from '#src/components/Epg/ChannelItem';
import ShareButton from '#src/components/ShareButton/ShareButton';
import StartWatchingButton from '#src/containers/StartWatchingButton/StartWatchingButton';
import usePlanByEpg from '#src/hooks/usePlanByEpg';
import Cinema from '#src/containers/Cinema/Cinema';
import useEntitlement from '#src/hooks/useEntitlement';
import { addQueryParams } from '#src/utils/formatting';
import Button from '#src/components/Button/Button';
import Play from '#src/icons/Play';
import useLiveProgram from '#src/hooks/useLiveProgram';

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
  const { getEpgProps, getLayoutProps } = usePlanByEpg(channels);

  // Media item
  const channelMediaItem = useMemo(() => playlist.find(({ mediaid }) => channel?.id === mediaid), [channel?.id, playlist]);
  const { isEntitled } = useEntitlement(channelMediaItem);

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
  const programTitle = program?.title || t('empty_schedule_program.title') || '';
  const programDescription = program?.description || t('empty_schedule_program.description') || '';
  const primaryMetadata = t('on_channel', { name: channel.title });

  const canWatch = isLive || (isVod && isWatchableFromBeginning);
  const canWatchFromBeginning = isEntitled && isLive && isWatchableFromBeginning;

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
          title={programTitle}
          primaryMetadata={primaryMetadata}
          feedId={feedid}
          liveStartDateTime={liveStartDateTime}
          liveEndDateTime={liveEndDateTime}
          liveFromBeginning={liveFromBeginning}
        />
      )}
      <VideoDetails
        title={programTitle}
        description={programDescription}
        primaryMetadata={primaryMetadata}
        posterMode={posterFading ? 'fading' : 'normal'}
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
                disabled={!canWatch}
              />
              {canWatchFromBeginning && (
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
        <Epg isLoading={false} {...getEpgProps()}>
          <Layout
            {...getLayoutProps()}
            renderTimeline={(props) => <Timeline {...props} />}
            renderProgram={({ program: programItem, ...rest }) => (
              <ProgramItem
                key={programItem.data.id}
                program={programItem}
                onClick={(program) => setActiveChannel(program.data.channelUuid, program.data.id)}
                isActive={program?.id === programItem.data.id}
                {...rest}
              />
            )}
            renderChannel={({ channel }) => <ChannelItem key={channel.uuid} channel={channel} />}
          />
        </Epg>
      </VideoDetails>
    </>
  );
}

export default PlaylistLiveChannels;
