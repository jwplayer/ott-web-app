/**
 * Add change event listener to given MediaQueryList instance
 * @param mediaQuery
 * @param callback
 */
export const addMediaQueryListChangeListener = (mediaQuery: MediaQueryList, callback: (event: MediaQueryListEvent) => void): void => {
  if (typeof mediaQuery.addEventListener === 'undefined') {
    mediaQuery.addListener(callback);
  } else {
    mediaQuery.addEventListener('change', callback);
  }
};

/**
 * Remove change event listener from given MediaQueryList instance
 * @param mediaQuery
 * @param callback
 */
export const removeMediaQueryListChangeListener = (mediaQuery: MediaQueryList, callback: (event: MediaQueryListEvent) => void): void => {
  if (typeof mediaQuery.removeEventListener === 'undefined') {
    mediaQuery.removeListener(callback);
  } else {
    mediaQuery.removeEventListener('change', callback);
  }
};
