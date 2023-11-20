import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { getModule } from '@jwp/ott-common/src/modules/container';

import useContentProtection from './useContentProtection';

export default function useProtectedMedia(item: PlaylistItem) {
  const apiService = getModule(ApiService);

  return useContentProtection('media', item.mediaid, (token, drmPolicyId) => apiService.getMediaById(item.mediaid, token, drmPolicyId));
}
