import { useQuery, type UseQueryResult } from 'react-query';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { getModule } from '@jwp/ott-common/src/modules/container';
import type { ApiError } from '@jwp/ott-common/src/utils/api';
import usePlaylist from '@jwp/ott-hooks-react/src/usePlaylist';
import { CACHE_TIME, STALE_TIME } from '@jwp/ott-common/src/constants';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { isTruthyCustomParamValue } from '@jwp/ott-common/src/utils/common';
import type { Playlist } from '@jwp/ott-common/types/playlist';
import { generatePlaylistPlaceholder } from '@jwp/ott-common/src/utils/collection';

const placeholderData = generatePlaylistPlaceholder(30);

const useAppContentSearch = ({ siteId, enabled, query }: { query: string; siteId: string; enabled: boolean }) => {
  const apiService = getModule(ApiService);

  const appContentSearchQuery: UseQueryResult<Playlist | undefined, ApiError> = useQuery(
    ['app-search', query],
    async () => {
      const searchResult = await apiService.getAppContentSearch(siteId, query);

      return searchResult;
    },
    {
      placeholderData: enabled ? placeholderData : undefined,
      enabled: enabled,
      staleTime: STALE_TIME,
      cacheTime: CACHE_TIME,
    },
  );

  return appContentSearchQuery;
};

export const useSearch = (query: string) => {
  const { config } = useConfigStore(({ config }) => ({ config }), shallow);

  const siteId = config?.siteId;
  const searchPlaylist = config?.features?.searchPlaylist;
  const hasAppContentSearch = isTruthyCustomParamValue(config?.custom?.appContentSearch);

  const playlistQuery = usePlaylist(searchPlaylist || '', { search: query || '' }, !hasAppContentSearch, !!query);
  // New app content search flow
  const appContentSearchQuery = useAppContentSearch({ siteId, enabled: hasAppContentSearch, query });

  return hasAppContentSearch
    ? { data: appContentSearchQuery.data, isFetching: appContentSearchQuery.isFetching, error: appContentSearchQuery.error }
    : {
        isFetching: playlistQuery.isFetching,
        error: playlistQuery.error,
        data: playlistQuery.data,
      };
};
