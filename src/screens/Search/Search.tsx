import React, { useContext, useEffect } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';

import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { UIStore } from '../../stores/UIStore';
import useSearchQueryUpdater from '../../hooks/useSearchQueryUpdater';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import type { PlaylistItem } from '../../../types/playlist';
import CardGrid from '../../components/CardGrid/CardGrid';
import { ConfigContext } from '../../providers/ConfigProvider';
import { cardUrl } from '../../utils/formatting';
import useFirstRender from '../../hooks/useFirstRender';
import useSearchPlaylist from '../../hooks/useSearchPlaylist';

import styles from './Search.module.scss';

type SearchRouteParams = {
  query: string;
};

const Search: React.FC<RouteComponentProps<SearchRouteParams>> = ({
  match: {
    params: { query },
  },
}) => {
  const { searchPlaylist } = useContext(ConfigContext);
  const firstRender = useFirstRender();
  const searchQuery = UIStore.useState((s) => s.searchQuery);
  const { updateSearchQuery } = useSearchQueryUpdater();
  const history = useHistory();
  const { isFetching, error, data: { playlist } = { playlist: [] } } = useSearchPlaylist(
    searchPlaylist || '',
    query,
    firstRender,
  );

  const updateBlurImage = useBlurImageUpdater(playlist);

  // Update the search bar query to match the route param on mount
  useEffect(() => {
    if (!firstRender) {
      return;
    }

    if (query && query !== searchQuery) {
      updateSearchQuery(query);
    }
  }, [firstRender, query, searchQuery, updateSearchQuery]);

  const onCardClick = (playlistItem: PlaylistItem) => history.push(cardUrl(playlistItem, searchPlaylist));
  const onCardHover = (playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image);

  if ((error || !playlist) && !isFetching) {
    return (
      <ErrorPage title="Something went wrong">
        <h6>It looks like we had an issue loading this page..</h6>
        <p>Reload this page or try again later.</p>
      </ErrorPage>
    );
  }

  if (!query) {
    return <ErrorPage title="Type something in the search box to start searching" />;
  }

  if (!playlist.length) {
    return (
      <ErrorPage title={`No results found for "${query || ''}"`}>
        <h6>Suggestions:</h6>
        <ul>
          <li>Make sure all words are spelled correctly</li>
          <li>Try different search terms</li>
          <li>Make search terms more general</li>
        </ul>
      </ErrorPage>
    );
  }

  return (
    <div className={styles.search}>
      <header className={styles.header}>
        <h2>Search results</h2>
      </header>
      <main className={styles.main}>
        <CardGrid playlist={playlist} onCardClick={onCardClick} onCardHover={onCardHover} isLoading={firstRender} />
      </main>
    </div>
  );
};

export default Search;
