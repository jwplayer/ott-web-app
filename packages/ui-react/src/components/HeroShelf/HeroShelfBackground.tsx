import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import type { CSSProperties, TransitionEventHandler } from 'react';
import React from 'react';

import Image from '../Image/Image';

import styles from './HeroShelf.module.scss';

const HeroShelfBackground = ({
  item,
  style,
  hidden,
  onTransitionEnd,
}: {
  item: PlaylistItem | null;
  style: CSSProperties;
  hidden?: boolean;
  onTransitionEnd?: TransitionEventHandler;
}) => {
  if (!item) return null;

  const image = item?.backgroundImage;

  return (
    <div
      style={{ ...style, visibility: hidden ? 'hidden' : undefined }}
      aria-hidden={hidden ? 'true' : undefined}
      key={item.mediaid}
      onTransitionEnd={onTransitionEnd}
    >
      <Image className={styles.image} image={image} width={1920} alt={item?.title} />
    </div>
  );
};

export default React.memo(HeroShelfBackground);
