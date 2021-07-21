import { useEffect, useState } from 'react';

const generateId = (prefix?: string, suffix?: string) => {
  return [prefix, Math.round(Math.random() * 10000), suffix].filter(Boolean).join('_');
};

const useOpaqueId = (prefix?: string, suffix?: string, override?: string): string => {
  const [id, setId] = useState(override || generateId(prefix, suffix));

  useEffect(() => {
    setId(override || generateId(prefix, suffix));
  }, [override, prefix, suffix]);

  return id;
};

export default useOpaqueId;
