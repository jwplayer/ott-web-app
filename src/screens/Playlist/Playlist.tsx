import React, { useContext, useEffect, useMemo, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import type { GridCellProps } from 'react-virtualized';
import type { PlaylistItem } from 'types/playlist';

import { cardUrl } from '../../utils/formatting';
import VirtualizedGrid from '../../components/VirtualizedGrid/VirtualizedGrid';
import usePlaylist from '../../hooks/usePlaylist';
import {
  getCategoriesFromPlaylist,
  filterPlaylistCategory,
  chunk,
  findPlaylistImageForWidth,
} from '../../utils/collection';
import Card from '../../components/Card/Card';
import Filter from '../../components/Filter/Filter';
import useBreakpoint, { Breakpoint, Breakpoints } from '../../hooks/useBreakpoint';
import { UIStateContext } from '../../providers/uiStateProvider';

import styles from './Playlist.module.scss';

const cols: Breakpoints = {
  [Breakpoint.xs]: 2,
  [Breakpoint.sm]: 2,
  [Breakpoint.md]: 3,
  [Breakpoint.lg]: 4,
  [Breakpoint.xl]: 5,
};

type PlaylistRouteParams = {
  id: string;
};

function Playlist({
  match: {
    params: { id },
  },
}: RouteComponentProps<PlaylistRouteParams>) {
  const history = useHistory();
  const { updateBlurImage } = useContext(UIStateContext);
  const { isLoading, error, data: { title, playlist } = { title: '', playlist: [] } } = usePlaylist(id);

  const [filter, setFilter] = useState<string>('');
  const breakpoint: Breakpoint = useBreakpoint();
  const isLargeScreen = breakpoint >= Breakpoint.md;
  const imageSourceWidth = 320 * (window.devicePixelRatio > 1 || isLargeScreen ? 2 : 1);

  const categories = getCategoriesFromPlaylist(playlist);
  const filteredPlaylist = useMemo(() => filterPlaylistCategory(playlist, filter), [playlist, filter]);
  const playlistRows = chunk<PlaylistItem>(filteredPlaylist, cols[breakpoint]);

  const onCardClick = (playlistItem: PlaylistItem) => history.push(cardUrl(playlistItem, id));
  const onCardHover = (playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image);

  useEffect(() => {
    if (filteredPlaylist.length) updateBlurImage(filteredPlaylist[0].image);
  }, [filter, filteredPlaylist, updateBlurImage]);

  if (error || !playlist) return <h2 className={styles.error}>Could not load items</h2>;

  const cellRenderer = ({ columnIndex, rowIndex, style }: GridCellProps) => {
    if (!playlistRows[rowIndex][columnIndex]) return;

    const playlistItem: PlaylistItem = playlistRows[rowIndex][columnIndex];
    const { mediaid, title, duration, seriesId } = playlistItem;

    return (
      <div className={styles.cell} style={style} key={mediaid}>
        <Card
          key={mediaid}
          title={title}
          duration={duration}
          posterSource={findPlaylistImageForWidth(playlistItem, imageSourceWidth)}
          seriesId={seriesId}
          onClick={() => onCardClick(playlistItem)}
          onHover={() => onCardHover(playlistItem)}
          loading={isLoading}
        />
      </div>
    );
  };

  return (
    <div className={styles.playlist}>
      <header className={styles.header}>
        <h2>{title}</h2>
        <Filter name="categories" value={filter} defaultLabel="All" options={categories} setValue={setFilter} />
      </header>
      <main className={styles.main}>
        <VirtualizedGrid rowCount={playlistRows.length} cols={cols} cellRenderer={cellRenderer} spacing={50} />
      </main>
    </div>
  );
}

export default Playlist;
