import { createStore } from '#src/stores/utils';

type NotificationStore = {
  type: string | null;
  resource: string | Error | null;
};

export const useNotificationStore = createStore<NotificationStore>('NotificationStore', () => ({
  type: null,
  resource: null,
}));
