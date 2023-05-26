import type { PlaylistItem } from '#types/playlist';

export enum EventState {
  PRE_LIVE = 'PRE_LIVE',
  LIVE_UNPUBLISHED = 'LIVE_UNPUBLISHED',
  LIVE_PUBLISHED = 'LIVE_PUBLISHED',
  INSTANT_VOD = 'INSTANT_VOD',
  VOD_PUBLIC = 'VOD_PUBLIC',
}

export const enum MediaStatus {
  LIVE = 'LIVE',
  VOD = 'VOD',
  SCHEDULED = 'SCHEDULED',
}

export const isLiveEvent = (playlistItem?: PlaylistItem) => {
  return !!playlistItem && !!playlistItem['VCH.EventState'] && !!playlistItem['VCH.ScheduledStart'];
};

export const isScheduledOrLiveMedia = (playlistItem: PlaylistItem) => {
  return playlistItem.mediaStatus === MediaStatus.SCHEDULED || playlistItem.mediaStatus === MediaStatus.LIVE;
};

export const getMediaStatusFromEventState = (playlistItem: PlaylistItem) => {
  const eventState = playlistItem['VCH.EventState'];
  const { scheduledStart, scheduledEnd } = playlistItem;

  const now = new Date();
  const started = eventState === EventState.LIVE_PUBLISHED || (scheduledStart && scheduledStart < now);
  const live = started && scheduledEnd && scheduledEnd > now;

  if (live) {
    return MediaStatus.LIVE;
  }

  if (!eventState) {
    return MediaStatus.VOD;
  }

  switch (eventState) {
    case EventState.PRE_LIVE:
    case EventState.LIVE_UNPUBLISHED:
      return MediaStatus.SCHEDULED;
    case EventState.LIVE_PUBLISHED:
      return MediaStatus.LIVE;
    case EventState.INSTANT_VOD:
    case EventState.VOD_PUBLIC:
      return MediaStatus.VOD;
  }
};

export const isPlayable = (playlistItem: PlaylistItem) => {
  return playlistItem.mediaStatus === MediaStatus.LIVE || playlistItem.mediaStatus === MediaStatus.VOD;
};
