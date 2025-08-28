import type { Playlist, PlaylistItem } from '../../types/playlist';

import { isContentType } from './common';

type ScreenPredicate<T> = (data?: T) => boolean;

type ScreenDefinition<T, C> = {
  predicate: ScreenPredicate<T>;
  component: C;
};

export class ScreenMap<T extends Playlist | PlaylistItem, C> {
  private defaultScreen?: C = undefined;
  private definitions: ScreenDefinition<T, C>[] = [];

  register(component: C, predicate: ScreenPredicate<T>) {
    this.definitions.push({ component, predicate });
  }

  registerByContentType(component: C, contentType: string) {
    this.register(component, (data) => !!data && isContentType(data, contentType));
  }

  registerDefault(component: C) {
    this.defaultScreen = component;
  }

  getScreen(data?: T): C {
    const screen = this.definitions.find(({ predicate }) => predicate(data))?.component;

    if (screen) {
      return screen;
    }

    if (!this.defaultScreen) {
      throw new Error('Default screen not defined');
    }

    return this.defaultScreen;
  }
}
