import React from 'react';
import { Channel, ChannelBox, ChannelLogo } from 'planby';

type Props = {
  channel: Channel;
  onClick?: (channel: Channel) => void;
};

const ChannelItem: React.VFC<Props> = ({ channel, onClick }) => {
  const { position, logo } = channel;

  return (
    <ChannelBox {...position} onClick={() => onClick && onClick(channel)} style={{ cursor: 'pointer' }}>
      <ChannelLogo src={logo} alt="Logo" />
    </ChannelBox>
  );
};

export default ChannelItem;
