import { useCallback, useRef } from 'react';
import { useHistory } from 'react-router';

import { debounce } from '../utils/common';
import { UIStore } from '../stores/UIStore';

const useSearchQueryUpdater = () => {
  const history = useHistory();

  const updateSearchPath = useRef(
    debounce((query: string) => {
      history.push(`/q/${encodeURIComponent(query)}`);
    }, 250),
  );
  const updateSearchQuery = useCallback((query: string) => {
    UIStore.update((state) => {
      state.searchQuery = query;
    });
    updateSearchPath.current(query);
  }, []);
  const resetSearchQuery = useCallback(() => {
    UIStore.update((state) => {
      state.searchQuery = '';
    });
    history.push('/');
  }, [history]);

  return { updateSearchQuery, resetSearchQuery };
};

export default useSearchQueryUpdater;
