import { useQuery } from 'react-query';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AccessController from '@jwp/ott-common/src/controllers/AccessController';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useTranslation } from 'react-i18next';

import useContentProtection from './useContentProtection';

export default function useProtectedMedia(item: PlaylistItem) {
  const apiService = getModule(ApiService);
  const accessController = getModule(AccessController);
  const { i18n } = useTranslation();
  const { language } = i18n;

  const { isAccessBridgeEnabled } = useConfigStore(({ settings }) => ({
    isAccessBridgeEnabled: !!settings?.apiAccessBridgeUrl,
  }));

  const contentProtectionQuery = useContentProtection('media', item.mediaid, async (token, drmPolicyId) => {
    // If the Access Bridge is enabled, use it to retrieve media via access passport.
    // This bypasses the need for a DRM token or policy and directly uses the access-controlled method.
    if (isAccessBridgeEnabled) {
      return accessController.getMediaById(item.mediaid);
    }

    // If Access Bridge is not enabled, retrieve the media using the provided DRM token and policy ID.
    return apiService.getMediaById({ id: item.mediaid, token, drmPolicyId, language });
  });

  const { isLoading, data: isGeoBlocked } = useQuery(
    ['media', 'geo', item.mediaid],
    () => {
      const m3u8 = contentProtectionQuery.data?.sources.find((source) => source.file.indexOf('.m3u8') !== -1);
      if (m3u8) {
        return fetch(m3u8.file, { method: 'HEAD' }).then((response) => response.status === 403);
      }
      return false;
    },
    {
      enabled: contentProtectionQuery.isFetched,
    },
  );

  return {
    ...contentProtectionQuery,
    isGeoBlocked,
    isLoading: contentProtectionQuery.isLoading || isLoading,
  };
}
