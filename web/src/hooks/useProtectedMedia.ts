import type { PlaylistItem } from '@jwplayer/ott-common/types/playlist';
import ApiService from '@jwplayer/ott-common/src/services/api.service';
import { getModule } from '@jwplayer/ott-common/src/modules/container';

import useContentProtection from './useContentProtection';

export default function useProtectedMedia(item: PlaylistItem) {
  const apiService = getModule(ApiService);

  return useContentProtection('media', item.mediaid, (token, drmPolicyId) => apiService.getMediaById(item.mediaid, token, drmPolicyId));
}
