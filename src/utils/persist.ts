/**
 *
 * Persist util: store items to localStorage
 *
 */

const LOCAL_STORAGE_PREFIX = `jwshowcase.`;

const setItem = (key: string, value: unknown) => {
  const storageKey = `${LOCAL_STORAGE_PREFIX}${key}`;
  const storageValue = JSON.stringify(value);

  try {
    window.localStorage.setItem(storageKey, storageValue);
  } catch (error: unknown) {
    console.error(error);
  }
};

const getItem = (key: string) => {
  const storageKey = `${LOCAL_STORAGE_PREFIX}${key}`;

  try {
    return parseJSON(window.localStorage.getItem(storageKey));
  } catch (error: unknown) {
    console.error(error);
  }
};

const parseJSON = (value?: string | null): unknown | undefined => {
  if (!value) return;

  try {
    const parsedValue = JSON.parse(value);

    return parsedValue;
  } catch (error: unknown) {
    return;
  }
};

export { setItem, getItem };
