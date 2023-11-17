import { useState } from 'react';

const useToggle = (initialState: boolean = false): [boolean, (forceValue?: boolean) => void] => {
  const [state, setState] = useState(initialState);

  const toggle = (forceValue?: boolean) => setState((current) => (typeof forceValue !== 'undefined' ? forceValue : !current));

  return [state, toggle];
};

export default useToggle;
