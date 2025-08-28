import { createStore } from './utils';

type AccessStore = {
  passport: string | null;
};

export const useAccessStore = createStore<AccessStore>('AccessStore', () => ({
  passport: null,
}));
