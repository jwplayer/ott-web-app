import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useUIStore } from '@jwp/ott-common/src/stores/UIStore';
import useDebounce from '@jwp/ott-hooks-react/src/useDebounce';

// Manages the query of the Search bar
const useSearchQueryUpdater = () => {
  const navigate = useNavigate();

  const updateSearchPath = useDebounce((query: string) => {
    navigate(`/q/${encodeURIComponent(query)}`);
  }, 350);
  const updateSearchQuery = useCallback(
    (query: string) => {
      useUIStore.setState({
        searchQuery: query,
      });
      updateSearchPath(query);
    },
    [updateSearchPath],
  );
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
