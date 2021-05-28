import React from 'react';
import type { PlaylistItem } from 'types/playlist';

import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';

import styles from './Video.module.scss';

type Props = {
  item: PlaylistItem;
  play: boolean;
  startPlay: () => void;
  goBack: () => void;
};

const Video: React.FC<Props> = ({ item, play, startPlay, goBack }: Props) => {
  const fullYear: number = new Date(item.pubdate).getFullYear();
  const duration: string = `${Math.floor(item.duration / 60)}h ${item.duration % 60}m`;
  return (
    <div className={styles.video}>
      <div className={styles.main}>
        <div className={styles.info}>
          <h2 className={styles.title}>{item.title}</h2>
          <div className={styles.meta}>
            <ul>
              <li>{fullYear}</li>
              <li>{duration}</li>
              <li>{item.genre}</li>
              <li>{item.rating}</li>
            </ul>
          </div>
          <div className={styles.description}>{item.description}</div>
          <div className={styles.buttons}>
            <Button label={'Favorite'} onClick={() => null} active />
            <Button label={'Trailer'} onClick={() => null} active />
            <Button label={'Share'} onClick={() => null} active />
          </div>
        </div>
        <div className={styles.banner} onClick={startPlay}>
          <img src={item.image} />
          <div className={styles.playIcon}>&#9658;</div>
        </div>
      </div>
      <div className={styles.other}>
        <h3>Resting shelf</h3>
      </div>
      {play && (
        <div className={styles.playerContainer}>
          <div className={styles.background} style={{ backgroundImage: `url('${item.image}')` }} />
          <div className={styles.player}></div>
          <div className={styles.playerInfo}>
            <div className={styles.backButton}>
              <IconButton aria-label="Back" onClick={goBack}>
                <p>&#8592;</p>
              </IconButton>
            </div>
            <div>
              <h2 className={styles.title}>{item.title}</h2>
              <div className={styles.meta}>
                <ul>
                  <li>{fullYear}</li>
                  <li>{duration}</li>
                  <li>{item.genre}</li>
                  <li>{item.rating}</li>
                </ul>
              </div>
              <div className={styles.description}>{item.description}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;
