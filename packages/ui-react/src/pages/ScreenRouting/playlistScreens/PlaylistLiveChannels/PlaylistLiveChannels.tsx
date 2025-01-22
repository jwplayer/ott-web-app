import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { differenceInSeconds, format } from 'date-fns';
import type { Playlist } from '@jwp/ott-common/types/playlist';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { formatDurationTag } from '@jwp/ott-common/src/utils/formatting';
import { createURL, liveChannelsURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { generateMovieJSONLD } from '@jwp/ott-common/src/utils/structuredData';
import useLiveChannels from '@jwp/ott-hooks-react/src/useLiveChannels';
import useEntitlement from '@jwp/ott-hooks-react/src/useEntitlement';
import useLiveProgram from '@jwp/ott-hooks-react/src/useLiveProgram';
import Play from '@jwp/ott-theme/assets/icons/play.svg?react';
import env from '@jwp/ott-common/src/env';

import type { ScreenComponent } from '../../../../../types/screens';
import Epg from '../../../../components/Epg/Epg';
import ShareButton from '../../../../components/ShareButton/ShareButton';
import StartWatchingButton from '../../../../containers/StartWatchingButton/StartWatchingButton';
import Cinema from '../../../../containers/Cinema/Cinema';
import Button from '../../../../components/Button/Button';
import Tag from '../../../../components/Tag/Tag';
import Loading from '../../../Loading/Loading';
import VideoDetails from '../../../../components/VideoDetails/VideoDetails';
import Icon from '../../../../components/Icon/Icon';
import VideoMetaData from '../../../../components/VideoMetaData/VideoMetaData';

import styles from './PlaylistLiveChannels.module.scss';

const PlaylistLiveChannels: ScreenComponent<Playlist> = ({ data: { feedid, playlist } }) => {
  const { t } = useTranslation('epg');

  // Config
  const { config } = useConfigStore(({ config }) => ({ config }), shallow);
  const { siteName } = config;

  // Routing
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const play = searchParams.get('play') === '1';
  const channelId = searchParams.get('channel') ?? undefined;
  const liveStartDateTime = searchParams.get('start');
  const liveEndDateTime = searchParams.get('end');
  const liveFromBeginning = searchParams.get('beginning') === '1';
  const goBack = () => feedid && navigate(liveChannelsURL(feedid, channelId));

  // EPG data
  const [initialChannelId] = useState(channelId);
  const { channels, channel, program, setActiveChannel } = useLiveChannels({ playlist, initialChannelId, enableAutoUpdate: !liveFromBeginning });
  const { isLive, isVod, isWatchableFromBeginning } = useLiveProgram({ program, catchupHours: channel?.catchupHours });

  // Media item
  const channelMediaItem = useMemo(() => playlist.find(({ mediaid }) => channel?.id === mediaid), [channel?.id, playlist]);
  const { isEntitled } = useEntitlement(channelMediaItem);

  const videoDetails = useMemo(() => {
    if (program) {
      return {
        title: program.title,
        description: program.description || '',
        image: program.backgroundImage,
        canWatch: isLive || (isVod && isWatchableFromBeginning),
        canWatchFromBeginning: isEntitled && isLive && isWatchableFromBeginning,
      };
    }

    return {
      title: channel?.title || '',
      description: channel?.description || '',
      image: channel?.backgroundImage,
      canWatch: true,
      canWatchFromBeginning: false,
    };
  }, [channel?.backgroundImage, channel?.description, channel?.title, isEntitled, isLive, isVod, isWatchableFromBeginning, program]);

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
    const duration = formatDurationTag(durationInSeconds, { minutesAbbreviation: t('common:abbreviation.minutes') });
    const attributes = [t('on_channel', { name: channel.title }), duration].filter(Boolean);

    return (
      <>
        <Tag className={styles.tag} isLive={isLive}>
          {isLive ? t('common:live') : `${format(startTime, 'p')} - ${format(endTime, 'p')}`}
        </Tag>
        <VideoMetaData attributes={attributes} />
      </>
    );
  }, [channel, isLive, program, t]);

  // Handlers
  const handleProgramClick = (programId: string, channelId: string) => {
    setActiveChannel(channelId, programId);

    // scroll to top when clicking a program
    (document.scrollingElement || document.body).scroll({ top: 0, behavior: 'smooth' });
  };

  const handleChannelClick = (channelId: string) => {
    setActiveChannel(channelId);
  };

  // Effects
  useEffect(() => {
    // update the channel id in URL
    if (channel && feedid && channelId !== channel.id) {
      navigate(liveChannelsURL(feedid, channel.id), { replace: true });
    }
  }, [navigate, feedid, channel, channelId]);

  // Loading (channel and feedid must be defined)
  if (!channel || !feedid) {
    return <Loading />;
  }

  // SEO (for channels)
  // const getUrl = (id: string) => liveChannelsURL(feedid, id);
  const canonicalUrl = `${env.APP_PUBLIC_URL}${liveChannelsURL(feedid, channel.id)}`;
  const pageTitle = `${channel.title} - ${siteName}`;

  const shareButton = channelMediaItem ? (
    <ShareButton title={channelMediaItem.title} description={channelMediaItem.description} url={window.location.href} />
  ) : null;

  // @todo: bring all props to liveChannelsURL, so that createURL isn't needed
  const startWatchingButton = channelMediaItem ? (
    <>
      <StartWatchingButton
        item={channelMediaItem}
        playUrl={createURL(liveChannelsURL(feedid, channelId, true), {
          start: isVod ? program?.startTime : undefined,
          end: isVod ? program?.endTime : undefined,
        })}
        disabled={!videoDetails.canWatch}
      />
      {videoDetails.canWatchFromBeginning && (
        <Button
          className={styles.catchupButton}
          onClick={() =>
            navigate(
              createURL(liveChannelsURL(feedid || '', channelId, true), {
                start: program?.startTime,
                beginning: 1,
              }),
            )
          }
          label={t('start_from_beginning')}
          startIcon={<Icon icon={Play} />}
        />
      )}
    </>
  ) : null;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={channelMediaItem?.description} />
        <meta property="og:description" content={channelMediaItem?.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content="video.other" />
        {channelMediaItem?.image && <meta property="og:image" content={channelMediaItem.image?.replace(/^https:/, 'http:')} />}
        {channelMediaItem?.image && <meta property="og:image:secure_url" content={channelMediaItem.image?.replace(/^http:/, 'https:')} />}
        <meta property="og:image:width" content={channelMediaItem?.image ? '720' : ''} />
        <meta property="og:image:height" content={channelMediaItem?.image ? '406' : ''} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={channelMediaItem?.description} />
        <meta name="twitter:image" content={channelMediaItem?.image} />
        <meta property="og:video" content={canonicalUrl.replace(/^https:/, 'http:')} />
        <meta property="og:video:secure_url" content={canonicalUrl.replace(/^http:/, 'https:')} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {channelMediaItem?.tags?.split(',').map((tag) => (
          <meta property="og:video:tag" content={tag} key={tag} />
        ))}
        {channelMediaItem ? <script type="application/ld+json">{generateMovieJSONLD(channelMediaItem, env.APP_PUBLIC_URL)}</script> : null}
      </Helmet>
      <VideoDetails
        title={videoDetails.title}
        description={videoDetails.description}
        image={videoDetails.image}
        startWatchingButton={startWatchingButton}
        shareButton={shareButton}
        primaryMetadata={primaryMetadata}
      >
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
        <div className={styles.epgContainer}>
          <Epg channels={channels} onChannelClick={handleChannelClick} onProgramClick={handleProgramClick} selectedChannel={channel} program={program} />
        </div>
      </VideoDetails>
    </>
  );
};

export default PlaylistLiveChannels;
