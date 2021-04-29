import React from 'react';

import styles from './Playlist.module.scss';

type PlaylistContainerProps = {
    playlistId: string;
};

function Playlist({ playlistId }: PlaylistContainerProps): JSX.Element {
    return (
        <div className={styles.playlist}>
            <header className={styles.playlistHeader}>
                <h2 className={styles.playlistTitle}>All films</h2>
                <div className={styles.playlistCategory} />
            </header>
            <main className={styles.playlistGrid} />
        </div>
    );
}

export default Playlist;
