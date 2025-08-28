import type { StateCreator } from 'zustand';
import { createWithEqualityFn } from 'zustand/traditional';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { IS_DEVELOPMENT_BUILD, IS_TEST_MODE } from '../utils/common';

export const createStore = <T>(name: string, storeFn: StateCreator<T>) => {
  const store = subscribeWithSelector(storeFn);

  // https://github.com/pmndrs/zustand/issues/852#issuecomment-1059783350
  if (IS_DEVELOPMENT_BUILD && !IS_TEST_MODE) {
    return createWithEqualityFn(
      devtools(store, {
        name,
        anonymousActionType: `${name}/Action`,
      }),
    );
  }

  return createWithEqualityFn(store);
};
