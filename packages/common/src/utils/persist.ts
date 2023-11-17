/**
 *
 * Persist util: store items to localStorage
 *
 */

const LOCAL_STORAGE_PREFIX = `jwapp.`;

const setItem = (key: string, value: unknown) => {
  const storageKey = `${LOCAL_STORAGE_PREFIX}${key}`;
  const storageValue = JSON.stringify(value);

  try {
    window.localStorage.setItem(storageKey, storageValue);
  } catch (error: unknown) {
    console.error(error);
  }
};

const setItemStorage = (key: string, value: unknown) => {
  const storageValue = JSON.stringify(value);

  try {
    window.localStorage.setItem(key, storageValue);
  } catch (error: unknown) {
    console.error(error);
  }
};

const getItem = <T>(key: string) => {
  const storageKey = `${LOCAL_STORAGE_PREFIX}${key}`;

  try {
    return parseJSON<T>(window.localStorage.getItem(storageKey));
  } catch (error: unknown) {
    console.error(error);
  }
};

const removeItem = (key: string) => {
  const storageKey = `${LOCAL_STORAGE_PREFIX}${key}`;

  try {
    window.localStorage.removeItem(storageKey);
  } catch (error: unknown) {
    console.error(error);
  }
};

const parseJSON = <T>(value?: string | null): T | undefined => {
  if (!value) return;

  try {
    return JSON.parse(value);
  } catch (error: unknown) {
    return;
  }
};

export { setItem, setItemStorage, getItem, removeItem };
