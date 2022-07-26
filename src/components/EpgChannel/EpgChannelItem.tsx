import React from 'react';
import { Channel, ChannelLogo } from 'planby';

import styles from './EpgChannelItem.module.scss';

type Props = {
  channel: Channel;
};

const EpgChannelItem: React.VFC<Props> = ({ channel }) => {
  const { position, logo } = channel;
  const style = { top: position.top, height: position.height - 16 }; // compensate for the margin of the channel item

  return (
    <div className={styles.epgChannelBox} style={style}>
      <ChannelLogo src={logo} alt="Logo" />
    </div>
  );
};

export default EpgChannelItem;
