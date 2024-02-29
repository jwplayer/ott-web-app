import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import InfiniteScroll from 'react-infinite-scroller';
import type { Content } from '@jwp/ott-common/types/config';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useWatchHistoryStore } from '@jwp/ott-common/src/stores/WatchHistoryStore';
import { slugify } from '@jwp/ott-common/src/utils/urlFormatting';
import { parseAspectRatio, parseTilesDelta } from '@jwp/ott-common/src/utils/collection';
import { testId } from '@jwp/ott-common/src/utils/common';
import { PersonalShelf } from '@jwp/ott-common/src/constants';
import usePlaylists from '@jwp/ott-hooks-react/src/usePlaylists';

import Shelf from '../../components/Shelf/Shelf';
import InfiniteScrollLoader from '../../components/InfiniteScrollLoader/InfiniteScrollLoader';
import ErrorPage from '../../components/ErrorPage/ErrorPage';

import styles from './ShelfList.module.scss';

const INITIAL_ROWS_TO_LOAD = 6;
const ROWS_TO_LOAD_STEP = 4;

type Props = {
  rows: Content[];
};

const ShelfList = ({ rows }: Props) => {
  const { accessModel } = useConfigStore(({ accessModel }) => ({ accessModel }), shallow);
  const [rowsToLoad, setRowsToLoad] = useState(INITIAL_ROWS_TO_LOAD);
  const { t } = useTranslation('error');

  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionaryWithSeries());

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  // Todo: move to more common package?

  const playlists = usePlaylists(rows, rowsToLoad);

  useEffect(() => {
    // reset row count when the page changes
    return () => setRowsToLoad(INITIAL_ROWS_TO_LOAD);
  }, [rows]);

  // If all playlists are empty (most probably due to geo restrictions), we show an empty shelves error
  const allPlaylistsEmpty = playlists.every(({ data, isSuccess }) => isSuccess && !data?.playlist?.length);

  if (allPlaylistsEmpty) {
    return <ErrorPage title={t('empty_shelves_heading')} message={t('empty_shelves_description')} />;
  }

  return (
    <div className={styles.shelfList}>
      <InfiniteScroll
        style={{ overflow: 'hidden' }}
        loadMore={() => setRowsToLoad((current) => current + ROWS_TO_LOAD_STEP)}
        hasMore={rowsToLoad < rows.length}
        loader={<InfiniteScrollLoader key="loader" />}
      >
        {rows.slice(0, rowsToLoad).map(({ type, featured, title }, index) => {
          const { data: playlist, isLoading, error } = playlists[index];

          if (!playlist?.playlist?.length) return null;

          const posterAspect = parseAspectRatio(playlist.cardImageAspectRatio || playlist.shelfImageAspectRatio);
          const visibleTilesDelta = parseTilesDelta(posterAspect);

          return (
            <section
              key={`${index}_${playlist.id}`}
              className={classNames(styles.shelfContainer, { [styles.featured]: featured })}
              data-testid={testId(`shelf-${featured ? 'featured' : type === 'playlist' ? slugify(title || playlist?.title) : type}`)}
              aria-label={title || playlist?.title}
            >
              <Shelf
                loading={isLoading}
                error={error}
                type={type}
                playlist={playlist}
                watchHistory={type === PersonalShelf.ContinueWatching ? watchHistoryDictionary : undefined}
                title={title || playlist?.title}
                featured={featured}
                accessModel={accessModel}
                isLoggedIn={!!user}
                hasSubscription={!!subscription}
                posterAspect={posterAspect}
                visibleTilesDelta={visibleTilesDelta}
              />
            </section>
          );
        })}
      </InfiniteScroll>
    </div>
  );
};

export default ShelfList;
