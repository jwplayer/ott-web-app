import { getMediaToken } from '../services/entitlement.service';
import { useAccountStore } from '../stores/AccountStore';
import { useConfigStore } from '../stores/ConfigStore';

import { getMediaById } from '#src/services/api.service';
import useEventCallback from '#src/hooks/useEventCallback';
import type { PlaylistItem } from '#types/playlist';

export const usePlaylistItemCallback = () => {
  const auth = useAccountStore(({ auth }) => auth);
  const signingConfig = useConfigStore((state) => state.config?.contentSigningService);

  return useEventCallback(async (item: PlaylistItem) => {
    const jwt = auth?.jwt;
    const host = signingConfig?.host;
    const drmPolicyId = signingConfig?.drmPolicyId;
    const signingEnabled = !!host;

    if (!signingEnabled) return item;

    // if signing is enabled, we need to sign the media item first. Assuming that the media item given to the player
    // isn't signed.
    const token = await getMediaToken(host, item.mediaid, jwt, {}, drmPolicyId);

    return await getMediaById(item.mediaid, token, drmPolicyId);
  });
};
