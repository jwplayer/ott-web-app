import { IS_TEST_MODE } from '@jwp/ott-common/src/utils/common';
import { useEffect, useState } from 'react';

const generateId = (prefix?: string, suffix?: string) => {
  // This test code ensures that ID's in snapshots are always the same.
  // Ideally it would be mocked in the test setup but there seems to be a bug with vitest if you mock Math.random
  const randomId = IS_TEST_MODE ? 1235 : Math.random() * 10000;

  return [prefix, Math.round(randomId), suffix]
    .filter(Boolean)
    .join('_')
    .replace(/[\s.]+/g, '_')
    .toLowerCase();
};

const useOpaqueId = (prefix?: string, suffix?: string, override?: string): string => {
  const [id, setId] = useState(override || generateId(prefix, suffix));

  useEffect(() => {
    setId(override || generateId(prefix, suffix));
  }, [override, prefix, suffix]);

  return id;
};

export default useOpaqueId;
