import { useConfigStore } from '#src/stores/ConfigStore';
import { getAdSchedule } from '#src/services/api.service';

export const initializeAdSchedule = async () => {
  const { config } = useConfigStore.getState();

  const adScheduleData = await getAdSchedule(config?.adSchedule);

  useConfigStore.setState({
    adScheduleData,
  });
};
