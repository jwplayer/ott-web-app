import React from 'react';
import type { Channel } from 'planby';

import styles from './EpgChannelItem.module.scss';

type Props = {
  channel: Channel;
  channelItemWidth: number;
  sidebarWidth: number;
};

const EpgChannelItem: React.VFC<Props> = ({ channel, channelItemWidth, sidebarWidth }) => {
  const { position, logo } = channel;
  const style = { top: position.top, height: position.height, width: sidebarWidth };

  return (
    <div className={styles.epgChannelBox} style={style}>
      <div className={styles.epgChannel} style={{ width: channelItemWidth }}>
        <img className={styles.epgChannelLogo} src={logo} alt="Logo" />
      </div>
    </div>
  );
};

export default EpgChannelItem;
