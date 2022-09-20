import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';

import { debounce } from '../utils/common';
import { useUIStore } from '../stores/UIStore';

const useSearchQueryUpdater = () => {
  const navigate = useNavigate();

  const updateSearchPath = useRef(
    debounce((query: string) => {
      navigate(`/q/${encodeURIComponent(query)}`);
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

    navigate(returnPage || '/');
  }, [navigate]);

  return { updateSearchQuery, resetSearchQuery };
};

export default useSearchQueryUpdater;
