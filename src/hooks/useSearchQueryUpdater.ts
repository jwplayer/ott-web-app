import { useCallback, useRef } from 'react';
import { useHistory } from 'react-router';

import { debounce } from '../utils/common';
import { useUIStore } from '../stores/UIStore';

const useSearchQueryUpdater = () => {
  const history = useHistory();

  const updateSearchPath = useRef(
    debounce((query: string) => {
      history.push(`/q/${encodeURIComponent(query)}`);
    }, 250),
  );
  const updateSearchQuery = useCallback((query: string) => {
    useUIStore.setState({
      searchQuery: query,
    });
    updateSearchPath.current(query);
  }, []);
  const resetSearchQuery = useCallback(() => {
    const returnPage = useUIStore.getState().preSearchPage;

    useUIStore.setState({
      searchQuery: '',
      preSearchPage: undefined,
    });

    history.push(returnPage || '/');
  }, [history]);

  return { updateSearchQuery, resetSearchQuery };
};

export default useSearchQueryUpdater;
