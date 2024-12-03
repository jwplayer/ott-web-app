import { useQuery } from 'react-query';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { getModule } from '@jwp/ott-common/src/modules/container';
import EntitlementController from '@jwp/ott-common/src/controllers/EntitlementController';

export default function useProtectedMedia(item: PlaylistItem) {
  const entitlementController = getModule(EntitlementController);

  return useQuery(['media-signed', item.mediaid, {}], async () => entitlementController.getSignedMedia(item.mediaid), {
    retry: 2,
    retryDelay: 1000,
    keepPreviousData: false,
  });
}
