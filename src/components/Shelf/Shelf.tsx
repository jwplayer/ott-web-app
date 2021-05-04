import React, { useContext } from 'react';
import type { Config } from 'types/Config';

import { ConfigContext } from '../../providers/configProvider';
import TileDock from '../TileDock/TileDock';

import styles from './Shelf.module.scss';

export type Image = {
  src: string;
  type: string;
  width: number;
};

export type ShelfProps = {
  title: string;
  playlist: string[];
  featured: boolean;
};

export type Source = {
  file: string;
  type: string;
};

export type Track = {
  file: string;
  kind: string;
  label: string;
};

export type Item = {
  description: string;
  duration: number;
  feedid: string;
  image: string;
  images: Image[];
  junction_id: string;
  link: string;
  mediaid: string;
  pubdate: number;
  sources: Source[];
  tags: string;
  title: string;
  tracks: Track[];
  variations: Record<string, unknown>;
};

const Shelf: React.FC<ShelfProps> = ({
  title,
  playlist,
  featured,
}: ShelfProps) => {
  const config: Config = useContext(ConfigContext);

  return (
    <div className={styles['Shelf']}>
      <p>
        Playlist {title} {featured}
      </p>
      <TileDock
        items={playlist}
        tilesToShow={6}
        tileHeight={300}
        cycleMode={'endless'}
        transitionTime="0.3s"
        spacing={3}
        renderLeftControl={(handleClick) => (
          <button onClick={handleClick}>Left</button>
        )}
        renderRightControl={(handleClick) => (
          <button onClick={handleClick}>Right</button>
          )}
        renderTile={(item: unknown) => {
          return (
          <div
            style={{
              background: 'white',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: `url('${
                  (item as Item).images[0]?.src
                }') center / cover no-repeat`,
              }}
            >
            </div>
          </div>
        )}}
      />
    </div>
  );
};

export default Shelf;
