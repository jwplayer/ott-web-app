import useContentProtection from './useContentProtection';

import type { PlaylistItem } from '#types/playlist';
import ApiService from '#src/services/api.service';
import { getModule } from '#src/modules/container';

export default function useProtectedMedia(item: PlaylistItem) {
  const apiService = getModule(ApiService);

  return useContentProtection('media', item.mediaid, (token, drmPolicyId) => apiService.getMediaById(item.mediaid, token, drmPolicyId));
}
