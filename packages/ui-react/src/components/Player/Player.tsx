import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { AdSchedule } from '@jwp/ott-common/types/ad-schedule';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { deepCopy } from '@jwp/ott-common/src/utils/collection';
import { logDev, testId } from '@jwp/ott-common/src/utils/common';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';
import useOttAnalytics from '@jwp/ott-hooks-react/src/useOttAnalytics';
import { attachAnalyticsParams } from '@jwp/ott-common/src/utils/analytics';
import env from '@jwp/ott-common/src/env';

import type { JWPlayer } from '../../../types/jwplayer';
import { addScript } from '../../utils/dom';

import styles from './Player.module.scss';

type Props = {
  feedId?: string;
  item: PlaylistItem;
  startTime?: number;
  autostart?: boolean;
  adsData?: AdSchedule;
  onReady?: (player?: JWPlayer) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onUserActive?: () => void;
  onUserInActive?: () => void;
  onBeforePlay?: () => void;
  onFirstFrame?: () => void;
  onRemove?: () => void;
  onNext?: () => void;
  onPlaylistItem?: () => void;
  onPlaylistItemCallback?: (item: PlaylistItem) => Promise<undefined | PlaylistItem>;
};

const Player: React.FC<Props> = ({
  item,
  adsData,
  onReady,
  onPlay,
  onPause,
  onComplete,
  onUserActive,
  onUserInActive,
  onBeforePlay,
  onFirstFrame,
  onRemove,
  onPlaylistItem,
  onPlaylistItemCallback,
  onNext,
  feedId,
  startTime = 0,
  autostart,
}: Props) => {
  const playerElementRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<JWPlayer>();
  const loadingRef = useRef(false);
  const [libLoaded, setLibLoaded] = useState(!!window.jwplayer);
  const startTimeRef = useRef(startTime);

  const setPlayer = useOttAnalytics(item, feedId);

  const { settings } = useConfigStore((s) => s);

  const playerId = settings.playerId;
  const playerLicenseKey = settings.playerLicenseKey;

  const handleBeforePlay = useEventCallback(onBeforePlay);
  const handlePlay = useEventCallback(onPlay);
  const handlePause = useEventCallback(onPause);
  const handleComplete = useEventCallback(onComplete);
  const handleUserActive = useEventCallback(onUserActive);
  const handleUserInactive = useEventCallback(onUserInActive);
  const handleFirstFrame = useEventCallback(() => {
    // a11y: auto focus to play/pause button
    const playerContainer = playerRef.current?.getContainer();
    const playPauseButton = playerContainer?.querySelector(
      '.jw-controlbar [aria-label="Play"], .jw-button-container [aria-label="Pause"]',
    ) as HTMLDivElement | null;
    playPauseButton?.focus();

    onFirstFrame?.();
  });
  const handleRemove = useEventCallback(onRemove);
  const handlePlaylistItem = useEventCallback(onPlaylistItem);
  const handlePlaylistItemCallback = useEventCallback(onPlaylistItemCallback);
  const handleNextClick = useEventCallback(onNext);
  const handleReady = useEventCallback(() => onReady && onReady(playerRef.current));

  const attachEvents = useCallback(() => {
    playerRef.current?.on('ready', handleReady);
    playerRef.current?.on('beforePlay', handleBeforePlay);
    playerRef.current?.on('complete', handleComplete);
    playerRef.current?.on('play', handlePlay);
    playerRef.current?.on('pause', handlePause);
    playerRef.current?.on('userActive', handleUserActive);
    playerRef.current?.on('userInactive', handleUserInactive);
    playerRef.current?.on('firstFrame', handleFirstFrame);
    playerRef.current?.on('remove', handleRemove);
    playerRef.current?.on('playlistItem', handlePlaylistItem);
    playerRef.current?.on('nextClick', handleNextClick);
    playerRef.current?.setPlaylistItemCallback(handlePlaylistItemCallback);
  }, [
    handleReady,
    handleBeforePlay,
    handleComplete,
    handlePlay,
    handlePause,
    handleUserActive,
    handleUserInactive,
    handleFirstFrame,
    handleRemove,
    handlePlaylistItem,
    handleNextClick,
    handlePlaylistItemCallback,
  ]);

  const detachEvents = useCallback(() => {
    playerRef.current?.off('ready');
    playerRef.current?.off('beforePlay');
    playerRef.current?.off('complete');
    playerRef.current?.off('play');
    playerRef.current?.off('pause');
    playerRef.current?.off('userActive');
    playerRef.current?.off('userInactive');
    playerRef.current?.off('firstFrame');
  }, []);

  useEffect(() => {
    if (!window.jwplayer && !loadingRef.current) {
      loadingRef.current = true;

      const scriptUrl = `${env.APP_API_BASE_URL}/libraries/${playerId}.js`;

      addScript(scriptUrl).then(() => {
        setLibLoaded(true);
        loadingRef.current = false;
      });
    }
  }, [playerId]);

  useEffect(() => {
    // Update the startTimeRef each time the startTime changes
    startTimeRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    const loadPlaylist = () => {
      if (!item || !playerRef.current) {
        return;
      }

      const currentItem = playerRef.current?.getPlaylistItem() as unknown as PlaylistItem | null;

      // We already loaded this item
      if (currentItem && currentItem.mediaid === item.mediaid) {
        logDev('Calling loadPlaylist with the same item, check the dependencies');
        return;
      }

      // Update autostart parameter
      if (typeof autostart !== 'undefined') {
        playerRef.current?.setConfig({ autostart });
      }

      // Load new item
      playerRef.current.load([deepCopy({ ...item, starttime: startTimeRef.current, feedid: feedId })]);
    };

    const initializePlayer = () => {
      if (!window.jwplayer || !playerElementRef.current) return;

      playerRef.current = window.jwplayer(playerElementRef.current) as JWPlayer;

      // Inject user_id and profile_id into the CDN analytics
      // @todo this currently depends on stores
      attachAnalyticsParams(item);

      // Player options are untyped
      const playerOptions: { [key: string]: unknown } = {
        advertising: {
          ...adsData,
          // Beta feature
          showCountdown: true,
        },
        timeSlider: {
          showAdMarkers: false,
        },
        aspectratio: false,
        controls: true,
        displaytitle: false,
        displayHeading: false,
        displaydescription: false,
        floating: {
          mode: 'never',
        },
        height: '100%',
        mute: false,
        playbackRateControls: true,
        pipIcon: 'disabled',
        playlist: [deepCopy({ ...item, starttime: startTimeRef.current, feedid: feedId })],
        repeat: false,
        cast: {},
        stretching: 'uniform',
        width: '100%',
      };

      // Only set the autostart parameter when it is defined or it will override the player.defaults autostart setting
      if (typeof autostart !== 'undefined') {
        playerOptions.autostart = autostart;
      }

      // Set the license key if provided
      if (playerLicenseKey) {
        playerOptions.key = playerLicenseKey;
      }

      playerRef.current.setup(playerOptions);

      setPlayer(playerRef.current);
      attachEvents();
    };

    if (playerRef.current) {
      return loadPlaylist();
    }

    if (libLoaded) {
      initializePlayer();
    }
  }, [libLoaded, item, detachEvents, attachEvents, playerId, setPlayer, autostart, adsData, playerLicenseKey, feedId]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        // Detaching events before component unmount
        detachEvents();
        playerRef.current.remove();
      }
    };
  }, [detachEvents]);

  return (
    <div className={styles.container} data-testid={testId('player-container')}>
      <div ref={playerElementRef} />
    </div>
  );
};

export default Player;
