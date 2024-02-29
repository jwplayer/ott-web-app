import type { Config } from '@jwp/ott-common/types/config';
import { calculateContrastColor } from '@jwp/ott-common/src/utils/common';
import env from '@jwp/ott-common/src/env';

export const setThemingVariables = (config: Config) => {
  const root = document.querySelector(':root') as HTMLElement;
  const { backgroundColor, highlightColor, headerBackground } = config.styling || {};
  const bodyFont = env.APP_BODY_FONT;
  const bodyAltFont = env.APP_BODY_ALT_FONT;

  if (!root) return;

  root.style.setProperty('--highlight-color', highlightColor || '#fff');
  root.style.setProperty('--highlight-contrast-color', highlightColor ? calculateContrastColor(highlightColor) : '#000');

  if (headerBackground) {
    root.style.setProperty('--header-background', headerBackground);
    root.style.setProperty('--header-contrast-color', calculateContrastColor(headerBackground));
  }

  if (backgroundColor) {
    root.style.setProperty('--body-background-color', backgroundColor);
    root.style.setProperty('--background-contrast-color', calculateContrastColor(backgroundColor));
  }
  if (bodyFont) {
    root.style.setProperty('--body-font-family', bodyFont);
  }
  if (bodyAltFont) {
    root.style.setProperty('--body-alt-font-family', bodyAltFont);
  }
};
