import { getMediaSignedToken, getMediaToken } from '#src/services/entitlement.service';
import { useAccountStore } from '#src/stores/AccountStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { getMediaById } from '#src/services/api.service';
import useEventCallback from '#src/hooks/useEventCallback';
import type { PlaylistItem } from '#types/playlist';
import { addQueryParams } from '#src/utils/formatting';

export const usePlaylistItemCallback = (startDateTime?: string | null, endDateTime?: string | null) => {
  const auth = useAccountStore(({ auth }) => auth);
  const config = useConfigStore((state) => state.config);

  const applyLiveStreamOffset = (item: PlaylistItem) => {
    if (!startDateTime) return item;

    // The timeParam can either be just a start date like `2022-08-08T20:00:00` (to extend DVR) or a range like
    // `2022-08-08T20:00:00-2022-08-08T22:00:00` to select a VOD from the live stream.
    const timeParam = [startDateTime, endDateTime].filter(Boolean).join('-');

    return {
      ...item,
      allSources: undefined, // `allSources` need to be cleared otherwise JW Player will use those instead
      sources: item.sources.map((source) => ({
        ...source,
        file: addQueryParams(source.file, {
          t: timeParam,
        }),
      })),
    };
  };

  return useEventCallback(async (item: PlaylistItem) => {
    const jwt = auth?.jwt;
    const host = config?.contentSigningService?.host;
    const drmPolicyId = config?.contentProtection?.drm?.defaultPolicyId ?? config?.contentSigningService?.drmPolicyId;
    const urlSigning = config?.custom?.urlSigning; // custom param whether we want to use url signing
    const signingEnabled = !!host;

    let token = '';
    if (urlSigning) {
      // if drmPolicyId is present in config, it is being handled on backend before retreiving the token
      token = await getMediaSignedToken(config?.id, item.mediaid);
    } else {
      if (!signingEnabled) return applyLiveStreamOffset(item);
      // if signing is enabled, we need to sign the media item first. Assuming that the media item given to the player
      // isn't signed.
      token = await getMediaToken(host, item.mediaid, jwt, {}, drmPolicyId);
    }

    const signedMediaItem = await getMediaById(item.mediaid, token, drmPolicyId);

    return signedMediaItem && applyLiveStreamOffset(signedMediaItem);
  });
};
