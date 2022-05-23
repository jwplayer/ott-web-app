import { UseBaseQueryResult, useQuery } from 'react-query';

import { generatePlaylistPlaceholder } from '../utils/collection';
import { getDRMPlaylistById, getPlaylistById } from '../services/api.service';

import type { Playlist, PlaylistParams } from '#types/playlist';
import { useConfigStore } from '#src/stores/ConfigStore';
import { getPublicToken } from '#src/services/entitlement.service';
import { useAccountStore } from '#src/stores/AccountStore';

const placeholderData = generatePlaylistPlaceholder(30);

export type UsePlaylistResult<TData = Playlist, TError = unknown> = UseBaseQueryResult<TData, TError>;

const filterRelatedMediaItem = (playlist: Playlist | undefined, relatedMediaId?: string): Playlist | undefined => {
  if (playlist?.playlist && relatedMediaId) {
    playlist.playlist = playlist.playlist.filter((playlistItem) => playlistItem.mediaid !== relatedMediaId);
  }

  return playlist;
};

export default function usePlaylist (
  playlistId: string,
  params: PlaylistParams = {},
  enabled: boolean = true,
  usePlaceholderData: boolean = true,
): UsePlaylistResult {
  const jwt = useAccountStore((store) => store.auth?.jwt);
  const signingConfig = useConfigStore((store) => store.config.contentSigningService);

  return useQuery(
    ['playlist', playlistId, params],
    async () => {
      const drmEnabled = !!signingConfig?.host && !!signingConfig?.drmEnabled && !!signingConfig?.drmPolicyId;

      if (drmEnabled && signingConfig?.drmEnabled && signingConfig?.drmPolicyId) {
        const { host, drmPolicyId } = signingConfig;
        const token = await getPublicToken(host, 'playlist', playlistId, jwt, params, drmPolicyId);

        const playlist = await getDRMPlaylistById(playlistId, signingConfig.drmPolicyId, {
          ...params,
          token,
        });

        return filterRelatedMediaItem(playlist, params.related_media_id);
      }

      const playlist = await getPlaylistById(playlistId, {}).then(filterRelatedMediaItem);

      return filterRelatedMediaItem(playlist, params.related_media_id);
    },
    {
      enabled: !!playlistId && enabled,
      placeholderData: usePlaceholderData ? placeholderData : undefined,
      retry: false,
    },
  );
}
