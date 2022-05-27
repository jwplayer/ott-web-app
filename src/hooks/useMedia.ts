import useContentProtection from '#src/hooks/useContentProtection';
import { getMediaById } from '#src/services/api.service';

export default function useMedia(mediaId: string, enabled: boolean = true) {
  const callback = (token?: string, drmPolicyId?: string) => getMediaById(mediaId, token, drmPolicyId);

  return useContentProtection('media', mediaId, callback, {}, enabled);
}
