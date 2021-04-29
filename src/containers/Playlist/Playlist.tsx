import React from 'react';

import usePlaylist from '../../hooks/usePlaylist';
import useBreakpoint from '../../hooks/useBreakpoint';
import Card from '../../components/Card/Card'

import styles from './Playlist.module.scss';

type PlaylistContainerProps = {
    playlistId: string;
};

type PlaylistMapArguments = {
    mediaid: string;
    title: string;
    duration: number;
    image: string;
};

const cols = { "xs": 2, "sm": 3, "md": 4, "lg": 5, "xl": 6 } // temp data, till config arrives

function Playlist({ playlistId }: PlaylistContainerProps): JSX.Element {

    const { isLoading, error, data } = usePlaylist(playlistId)
    const breakpoint = useBreakpoint();

    if (isLoading) return <p>Loading...</p>

    if (error) return <p>No playlist found...</p>

    const { title, playlist } = data;

    return (
        <div className={styles.playlist}>
            <header className={styles.playlistHeader}>
                <h2 className={styles.playlistTitle}>{title}</h2>
                <div className={styles.playlistCategory}>
                    <select name="categories">
                        <option value="">All</option>
                        <option value="some">Some</option>
                    </select>
                </div>
            </header>
            <main
                className={styles.playlistGrid}
                style={{ gridTemplateColumns: `repeat(${cols[breakpoint]}, minmax(0,1fr))` }}
            >
                {playlist.map(({ mediaid: mediaId, title, duration, image }: PlaylistMapArguments) =>
                    <Card key={mediaId} title={title} duration={duration} posterSource={image} onClick={(() => '')} />)}
            </main>
        </div>
    );
}

export default Playlist;
