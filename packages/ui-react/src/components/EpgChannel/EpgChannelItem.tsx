import React from 'react';
import type { Channel } from 'planby';
import classNames from 'classnames';
import { testId } from '@jwp/ott-common/src/utils/common';

import Image from '../Image/Image';

import styles from './EpgChannelItem.module.scss';

type Props = {
  channel: Channel;
  channelItemWidth: number;
  sidebarWidth: number;
  onClick?: (channel: Channel) => void;
  isActive: boolean;
  title: string;
};

const EpgChannelItem: React.VFC<Props> = ({ channel, channelItemWidth, sidebarWidth, onClick, isActive, title }) => {
  const { position, uuid, channelLogoImage } = channel;
  const style = { top: position.top, height: position.height, width: sidebarWidth };

  return (
    <div className={styles.epgChannelBox} style={style}>
      <div
        className={classNames(styles.epgChannel, { [styles.active]: isActive })}
        style={{ width: channelItemWidth }}
        onClick={() => onClick && onClick(channel)}
        data-testid={testId(uuid)}
        role="button"
      >
        <Image className={styles.epgChannelLogo} image={channelLogoImage} alt={title} width={320} />
      </div>
    </div>
  );
};

export default EpgChannelItem;
