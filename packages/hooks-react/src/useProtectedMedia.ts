import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { getModule } from '@jwp/ott-common/src/modules/container';
import EntitlementController from '@jwp/ott-common/src/controllers/EntitlementController';

export default function useProtectedMedia(item: PlaylistItem) {
  const entitlementController = getModule(EntitlementController);
  const { i18n } = useTranslation();
  const { language } = i18n;

  return useQuery(['media-signed', item.mediaid, language], async () => entitlementController.getSignedMedia(item.mediaid, language), {
    retry: 2,
    retryDelay: 1000,
    keepPreviousData: false,
  });
}
