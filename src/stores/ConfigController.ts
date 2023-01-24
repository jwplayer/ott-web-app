import { useConfigStore } from './ConfigStore';

import { API_HOST } from '#src/config';
import { IS_PROD_MODE } from '#src/utils/common';

const envQueryKey = 'env';

export const initializeHost = (searchParams: URLSearchParams) => {
  const query = searchParams.get(envQueryKey);

  if (IS_PROD_MODE) {
    return;
  }

  if (query === 'dev' || query === 'prd') {
    useConfigStore.setState({ apiHost: API_HOST[query] });
    return;
  }

  useConfigStore.setState({ apiHost: API_HOST.prd });
};
