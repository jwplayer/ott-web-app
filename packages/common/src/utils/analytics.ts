import { useAccountStore } from '../stores/AccountStore';
import { useConfigStore } from '../stores/ConfigStore';
import { useProfileStore } from '../stores/ProfileStore';
import type { PlaylistItem, Source } from '../../types/playlist';

export const attachAnalyticsParams = (item: PlaylistItem) => {
  // @todo pass these as params instead of reading the stores
  const { config, settings } = useConfigStore.getState();
  const { user } = useAccountStore.getState();
  const { profile } = useProfileStore.getState();

  const vendorId = settings.vendorId;

  const { sources, mediaid } = item;

  const userId = user?.id;
  const profileId = profile?.id;
  const isJwIntegration = !!config?.integrations?.jwp;

  sources.map((source: Source) => {
    const url = new URL(source.file);
    const urlSearchParams = url.searchParams;

    const mediaId = mediaid.toLowerCase();
    const sourceUrl = url.href.toLowerCase();

    const cdnUrlVOD = `https://cdn.jwplayer.com/manifests/${mediaId}.m3u8`;
    const cdnUrlBCL = `https://content.jwplatform.com/live/broadcast/${mediaId}.m3u8`;

    // Attach user_id, profile_id and vendor_id only for VOD, BCL SaaS Live Streams and DRM
    const isVOD = sourceUrl === cdnUrlVOD;
    const isBCL = sourceUrl === cdnUrlBCL;
    const isDRM = sourceUrl.startsWith(cdnUrlVOD) && urlSearchParams.has('exp') && urlSearchParams.has('sig');

    if ((isVOD || isBCL || isDRM) && userId) {
      urlSearchParams.set('user_id', userId);

      if (isJwIntegration && profileId) {
        urlSearchParams.set('profile_id', profileId);
      }
    }

    if (vendorId) {
      urlSearchParams.set('vendor_id', vendorId);
    }

    source.file = url.toString();
  });
};
