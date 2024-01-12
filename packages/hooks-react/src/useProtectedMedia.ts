import { useEffect, useState } from 'react';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { getModule } from '@jwp/ott-common/src/modules/container';

import useContentProtection from './useContentProtection';

export default function useProtectedMedia(item: PlaylistItem) {
  const apiService = getModule(ApiService);

  const [isGeoBlocked, setIsGeoBlocked] = useState(false);
  const contentProtectionQuery = useContentProtection('media', item.mediaid, (token, drmPolicyId) => apiService.getMediaById(item.mediaid, token, drmPolicyId));

  useEffect(() => {
    const m3u8 = contentProtectionQuery.data?.sources.find((source) => source.file.indexOf('.m3u8') !== -1);
    if (m3u8) {
      fetch(m3u8.file, { method: 'HEAD' }).then((response) => {
        response.status === 403 && setIsGeoBlocked(true);
      });
    }
  }, [contentProtectionQuery.data]);

  return {
    ...contentProtectionQuery,
    isGeoBlocked,
  };
}
