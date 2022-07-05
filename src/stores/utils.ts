import type { State, StateCreator } from 'zustand';
import create from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

export const createStore = <T extends State>(name: string, storeFn: StateCreator<T>) => {
  const store = subscribeWithSelector(storeFn);

  // https://github.com/pmndrs/zustand/issues/852#issuecomment-1059783350
  if (import.meta.env.MODE === 'development') {
    return create(
      devtools(store, {
        name,
        anonymousActionType: `${name}/Action`,
      }),
    );
  }

  return create(store);
};
