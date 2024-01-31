import type { Config } from '@jwp/ott-common/types/config';
import { calculateContrastColor } from '@jwp/ott-common/src/utils/common';

export const setThemingVariables = (config: Config) => {
  const root = document.querySelector(':root') as HTMLElement;
  const { backgroundColor, highlightColor, headerBackground } = config.styling || {};

  if (root && backgroundColor) {
    root.style.setProperty('--body-background-color', backgroundColor);
    root.style.setProperty('--background-contrast-color', calculateContrastColor(backgroundColor));
  }

  if (root && highlightColor) {
    root.style.setProperty('--highlight-color', highlightColor);
    root.style.setProperty('--highlight-contrast-color', calculateContrastColor(highlightColor));
  }

  if (root && headerBackground) {
    root.style.setProperty('--header-background', headerBackground);
    root.style.setProperty('--header-contrast-color', calculateContrastColor(headerBackground));
  }
};
