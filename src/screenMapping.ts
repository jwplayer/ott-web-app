import { mediaScreenMap } from '#src/pages/ScreenRouting/MediaScreenRouter';
import MediaHub from '#src/pages/ScreenRouting/mediaScreens/MediaHub/MediaHub';

/**
 * This file is used to add media and/or playlist screens.
 *
 * The most basic example is given below where a media screen is registered for the `hub` contentType. This means that
 * when navigating to the `/m/:id` page and the requested media item has `contentType: hub`, it will render the
 * `MediaHub` screen.
 *
 * In the application, screens are registered for the following contentTypes: Episode, Series and LiveChannel. When no
 * match is found, the default screen is used.
 *
 * To override the default media screen you can use:
 *
 * @example
 * mediaScreenMap.registerDefault(CustomMediaScreen);
 *
 * If you want to override the series contentType you can use:
 *
 * @example
 * mediaScreenMap.registerByContentType(CustomSeriesScreen, 'series');
 *
 * Or you want to use different parameters to select a screen, you can use the `register` method with a predicate
 * function. This predicate function must return `true` when it should be used.
 *
 * @example
 * mediaScreenMap.register(CustomMediaScreen, (item?: PlaylistItem) => item?.customParam === 'yes');
 *
 * If you want to override all screens and only use a single screen for all media items, you can register a screen
 * with a predicate that always returns `true`
 *
 * @example
 * mediaScreenMap.register(CustomMediaScreen, () => true);
 *
 * The same methods can be used for the `playlistScreenMap` that is exported from
 * {@link /src/pages/ScreenRouting/PlaylistScreenRouter.tsx}
 */

export default function registerCustomScreens() {
  // Hub is an example screen for the media router
  mediaScreenMap.registerByContentType(MediaHub, 'hub');
}
