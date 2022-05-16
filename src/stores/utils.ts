import type { State, StateCreator } from 'zustand';
import create from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

export const createStore = <T extends State>(name: string, storeFn: StateCreator<T>) =>
  create(
    devtools(subscribeWithSelector(storeFn), {
      name,
      anonymousActionType: `${name}/Action`,
    }),
  );
