import { useQuery } from 'react-query';

import { getMediaById } from '#src/services/api.service';
import useSignedUrl from '#src/hooks/useSignedUrl';

export default function useMedia(mediaId: string, enabled: boolean = true) {
  const { token, signingEnabled, drmEnabled, drmPolicyId, isLoading } = useSignedUrl('media', mediaId, {}, enabled);

  const queryResult = useQuery(['media', mediaId, token], () => getMediaById(mediaId, token, drmEnabled ? drmPolicyId : undefined), {
    enabled: !!mediaId && enabled && (!signingEnabled || !!token),
    keepPreviousData: true,
  });

  return {
    ...queryResult,
    isLoading: isLoading || queryResult.isLoading,
  };
}
