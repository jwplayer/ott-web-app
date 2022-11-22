import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { useUIStore } from '#src/stores/UIStore';
import useDebounce from '#src/hooks/useDebounce';

const useSearchQueryUpdater = () => {
  const navigate = useNavigate();

  const updateSearchPath = useDebounce((query: string) => {
    navigate(`/q/${encodeURIComponent(query)}`);
  }, 350);
  const updateSearchQuery = useCallback((query: string) => {
    useUIStore.setState({
      searchQuery: query,
    });
    updateSearchPath(query);
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
