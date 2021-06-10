import React, { createContext, FunctionComponent, ReactNode, useCallback, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { debounce } from '../utils/common';

export type UIContext = {
  blurImage: string;
  searchQuery: string;
  updateBlurImage: (image: string) => void;
  updateSearchQuery: (searchQuery: string) => void;
  resetSearchQuery: () => void;
};

const defaultContext: UIContext = {
  blurImage: '',
  searchQuery: '',
  updateBlurImage: () => undefined,
  updateSearchQuery: () => undefined,
  resetSearchQuery: () => undefined,
};

export const UIStateContext = createContext<UIContext>(defaultContext);

export type ProviderProps = {
  children: ReactNode;
};

const UIStateProvider: FunctionComponent<ProviderProps> = ({ children }) => {
  const history = useHistory();
  const [blurImage, setBlurImage] = useState<string>(defaultContext.blurImage);
  const updateBlurImage = useCallback((image: string) => setBlurImage(image), []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const updateSearchPath = useRef(
    debounce((query: string) => {
      history.push(`/q/${encodeURIComponent(query)}`);
    }, 250),
  );

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    updateSearchPath.current(query);
  }, []);

  const resetSearchQuery = useCallback(() => {
    setSearchQuery('');
    history.push('/');
  }, [history]);

  return (
    <UIStateContext.Provider value={{ blurImage, searchQuery, updateBlurImage, updateSearchQuery, resetSearchQuery }}>
      {children}
    </UIStateContext.Provider>
  );
};

export default UIStateProvider;
