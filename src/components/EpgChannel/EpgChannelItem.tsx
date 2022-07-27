import React from 'react';
import type { Channel } from 'planby';

import styles from './EpgChannelItem.module.scss';

type Props = {
  channel: Channel;
};

const EpgChannelItem: React.VFC<Props> = ({ channel }) => {
  const { position, logo } = channel;
  const style = { top: position.top, height: position.height }; // compensate for the margin of the channel item

  return (
    <div className={styles.epgChannelBox} style={style}>
      <div className={styles.epgChannelContent}>
        <img className={styles.epgChannelLogo} src={logo} alt="Logo" />
      </div>
    </div>
  );
};

export default EpgChannelItem;
