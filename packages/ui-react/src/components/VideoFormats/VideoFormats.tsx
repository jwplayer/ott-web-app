import type { PlaylistItem } from '@jwp/ott-common/types/playlist';

import styles from './VideoFormats.module.scss';

const VideoFormats = ({ item }: { item: PlaylistItem }) => {
  const formatTags = ['subtitleFormat', 'videoFormat', 'audioFormat'].flatMap((property) =>
    item[property]
      ? (item[property] as string).split(',').map((label) => (
          <div className={styles.formatTag} key={`${property}-${label}`}>
            {label}
          </div>
        ))
      : [],
  );
  return <div className={styles.formats}>{formatTags}</div>;
};

export default VideoFormats;
