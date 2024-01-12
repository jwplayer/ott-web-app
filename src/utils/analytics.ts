import type { PlaylistItem, Source } from '#types/playlist';

export const attachAnalyticsParams = (item: PlaylistItem, isJwIntegration: boolean, userId?: string, profileId?: string) => {
  const { sources, mediaid } = item;

  return sources.map((source: Source) => {
    const url = new URL(source.file);

    const mediaId = mediaid.toLowerCase();
    const sourceUrl = url.href.toLowerCase();

    // Attach user_id and profile_id only for VOD and BCL SaaS Live Streams
    const isVOD = sourceUrl === `https://cdn.jwplayer.com/manifests/${mediaId}.m3u8`;
    const isBCL = sourceUrl === `https://content.jwplatform.com/live/broadcast/${mediaId}.m3u8`;

    if ((isVOD || isBCL) && userId) {
      url.searchParams.set('user_id', userId);

      if (isJwIntegration && profileId) {
        url.searchParams.set('profile_id', profileId);
      }
    }

    source.file = url.toString();
  });
};
