import type { State, StateCreator } from 'zustand';
import create from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { IS_DEV_BUILD } from '#src/env';

export const createStore = <T extends State>(name: string, storeFn: StateCreator<T>) => {
  const store = subscribeWithSelector(storeFn);

  // https://github.com/pmndrs/zustand/issues/852#issuecomment-1059783350
  if (IS_DEV_BUILD) {
    return create(
      devtools(store, {
        name,
        anonymousActionType: `${name}/Action`,
      }),
    );
  }

  return create(store);
};
