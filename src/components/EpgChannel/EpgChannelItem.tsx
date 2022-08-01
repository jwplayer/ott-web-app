import React from 'react';
import type { Channel } from 'planby';
import classNames from 'classnames';

import styles from './EpgChannelItem.module.scss';

type Props = {
  channel: Channel;
  channelItemWidth: number;
  sidebarWidth: number;
  onClick?: (channel: Channel) => void;
  isActive: boolean;
};

const EpgChannelItem: React.VFC<Props> = ({ channel, channelItemWidth, sidebarWidth, onClick, isActive }) => {
  const { position, logo, uuid } = channel;
  const style = { top: position.top, height: position.height, width: sidebarWidth };

  return (
    <div className={styles.epgChannelBox} style={style}>
      <div
        className={classNames(styles.epgChannel, { [styles.active]: isActive })}
        style={{ width: channelItemWidth }}
        onClick={() => onClick && onClick(channel)}
        data-testid={uuid}
      >
        <img className={styles.epgChannelLogo} src={logo} alt="Logo" />
      </div>
    </div>
  );
};

export default EpgChannelItem;
