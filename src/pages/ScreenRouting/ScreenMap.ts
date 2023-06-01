import type { ScreenComponent } from '#types/screens';
import type { Playlist, PlaylistItem } from '#types/playlist';

type ScreenPredicate<T> = (data?: T) => boolean;

type ScreenDefinition<T> = {
  predicate: ScreenPredicate<T>;
  component: ScreenComponent<T>;
};

export class ScreenMap<T extends Playlist | PlaylistItem> {
  private defaultScreen?: ScreenComponent<T> = undefined;
  private definitions: ScreenDefinition<T>[] = [];

  register(component: ScreenComponent<T>, predicate: ScreenPredicate<T>) {
    this.definitions.push({ component, predicate });
  }

  registerByContentType(component: ScreenComponent<T>, contentType: string) {
    this.register(component, (data) => data?.contentType?.toLowerCase() === contentType);
  }

  registerDefault(component: ScreenComponent<T>) {
    this.defaultScreen = component;
  }

  getScreen(data?: T): ScreenComponent<T> {
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
