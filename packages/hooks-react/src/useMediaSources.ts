import { useMemo } from 'react';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import type { PlaylistItem, Source } from '@jwp/ott-common/types/playlist';
import { getSources } from '@jwp/ott-common/src/utils/sources';
import { useAccessStore } from '@jwp/ott-common/src/stores/AccessStore';

/** Modify manifest URLs to handle server ads and analytics params */
export const useMediaSources = ({ item, baseUrl }: { item: PlaylistItem; baseUrl: string }): Source[] => {
  const config = useConfigStore((s) => s.config);
  const user = useAccountStore((s) => s.user);
  const passport = useAccessStore((s) => s.passport);

  return useMemo(() => getSources({ item, baseUrl, config, user, passport }), [item, baseUrl, config, user, passport]);
};
