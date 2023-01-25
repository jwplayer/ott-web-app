import { API_HOST } from '#src/config';
import { IS_PROD_MODE } from '#src/utils/common';
import { useConfigStore } from '#src/stores/ConfigStore';
import { getAdSchedule } from '#src/services/api.service';

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

export const initializeAdSchedule = async () => {
  const { config } = useConfigStore.getState();

  const adScheduleData = await getAdSchedule(config?.adSchedule);

  useConfigStore.setState({
    adScheduleData,
  });
};
