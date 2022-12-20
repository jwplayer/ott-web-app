import { createStore } from '#src/stores/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */
type NotificationStore = {
  type: string | null;
  resource: any;
};

export const useNotificationStore = createStore<NotificationStore>('NotificationStore', () => ({
  type: null,
  resource: null,
}));
