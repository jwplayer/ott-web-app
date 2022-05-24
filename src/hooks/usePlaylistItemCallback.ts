import { getMediaToken } from '../services/entitlement.service';
import { useAccountStore } from '../stores/AccountStore';
import { useConfigStore } from '../stores/ConfigStore';

import { getDRMMediaById, getMediaById } from '#src/services/api.service';
import useEventCallback from '#src/hooks/useEventCallback';
import type { PlaylistItem } from '#types/playlist';

export const usePlaylistItemCallback = () => {
  const { auth } = useAccountStore(({ auth, subscription }) => ({ auth, subscription }));
  const signingConfig = useConfigStore((state) => state.config?.contentSigningService);

  return useEventCallback(async (item: PlaylistItem) => {
    const jwt = auth?.jwt;
    const signingEnabled = !!signingConfig?.host;
    const drmEnabled = signingEnabled && signingConfig?.drmEnabled && signingConfig?.drmPolicyId;

    if (!signingConfig && !signingEnabled) return item;

    // if signing is enabled, we need to sign the media item first. Assuming that the media item given to the player
    // isn't signed. An alternative way is to
    const { host, drmPolicyId } = signingConfig;

    const token = await getMediaToken({ host, drmPolicyId, id: item.mediaid, jwt, params: {} });

    if (drmEnabled && drmPolicyId) return getDRMMediaById(item.mediaid, drmPolicyId, token);

    return await getMediaById(item.mediaid, token);
  });
};
