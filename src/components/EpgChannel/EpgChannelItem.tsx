import React from 'react';
import type { Channel } from 'planby';
import classNames from 'classnames';

import styles from './EpgChannelItem.module.scss';

import Image from '#components/Image/Image';
import { testId } from '#src/utils/common';

type Props = {
  channel: Channel;
  channelItemWidth: number;
  sidebarWidth: number;
  onClick?: (channel: Channel) => void;
  isActive: boolean;
};

const EpgChannelItem: React.VFC<Props> = ({ channel, channelItemWidth, sidebarWidth, onClick, isActive }) => {
  const { position, uuid, channelLogoImage } = channel;
  const style = { top: position.top, height: position.height, width: sidebarWidth };

  return (
    <div className={styles.epgChannelBox} style={style}>
      <div
        className={classNames(styles.epgChannel, { [styles.active]: isActive })}
        style={{ width: channelItemWidth }}
        onClick={() => onClick && onClick(channel)}
        data-testid={testId(uuid)}
      >
        <Image className={styles.epgChannelLogo} image={channelLogoImage} alt="Logo" width={320} />
      </div>
    </div>
  );
};

export default EpgChannelItem;
