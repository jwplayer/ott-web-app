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
import { PersonalShelf, SHELF_LAYOUT_TYPE } from '@jwp/ott-common/src/constants';
import usePlaylists from '@jwp/ott-hooks-react/src/usePlaylists';
import { useTranslationKey } from '@jwp/ott-hooks-react/src/useTranslationKey';

import Shelf from '../../components/Shelf/Shelf';
import InfiniteScrollLoader from '../../components/InfiniteScrollLoader/InfiniteScrollLoader';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import Fade from '../../components/Animation/Fade/Fade';
import HeroShelf from '../../components/HeroShelf/HeroShelf';
import { getScrollParent } from '../../utils/dom';

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
  const translationKey = useTranslationKey('title');

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
        getScrollParent={getScrollParent}
        useWindow={false}
      >
        {rows.slice(0, rowsToLoad).map(({ type, featured, title, custom }, index) => {
          const { data: playlist, isPlaceholderData, error } = playlists[index];

          if (!playlist?.playlist?.length) return null;

          const posterAspect = parseAspectRatio(playlist.cardImageAspectRatio || playlist.shelfImageAspectRatio);
          const visibleTilesDelta = parseTilesDelta(posterAspect);

          const translatedValue = custom?.[translationKey] || (playlist?.[translationKey] as string);
          const translatedTitle = translatedValue || title || playlist?.title;

          const isHero = custom?.layoutType === SHELF_LAYOUT_TYPE.hero && index === 0;
          const isFeatured = !isHero && (custom?.layoutType === SHELF_LAYOUT_TYPE.featured || featured);

          return (
            <section
              key={`${index}_${playlist.id}`}
              className={classNames(styles.shelfContainer, { [styles.hero]: isHero, [styles.featured]: isFeatured })}
              data-testid={testId(`shelf-${isHero ? 'hero' : isFeatured ? 'featured' : type === 'playlist' ? slugify(translatedTitle) : type}`)}
              aria-label={translatedTitle}
            >
              <Fade duration={250} delay={index * 33} open>
                {isHero ? (
                  <HeroShelf loading={isPlaceholderData} error={error} playlist={playlist} />
                ) : (
                  <Shelf
                    loading={isPlaceholderData}
                    error={error}
                    type={type}
                    playlist={playlist}
                    watchHistory={type === PersonalShelf.ContinueWatching ? watchHistoryDictionary : undefined}
                    title={translatedTitle}
                    featured={isFeatured}
                    accessModel={accessModel}
                    isLoggedIn={!!user}
                    hasSubscription={!!subscription}
                    posterAspect={posterAspect}
                    visibleTilesDelta={visibleTilesDelta}
                  />
                )}
              </Fade>
            </section>
          );
        })}
      </InfiniteScroll>
    </div>
  );
};

export default ShelfList;
