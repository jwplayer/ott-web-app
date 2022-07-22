import React from 'react';
import { Channel, ChannelBox, ChannelLogo } from 'planby';

type Props = {
  channel: Channel;
};

const ChannelItem: React.VFC<Props> = ({ channel }) => {
  const { position, logo } = channel;

  return (
    <ChannelBox {...position}>
      <ChannelLogo src={logo} alt="Logo" />
    </ChannelBox>
  );
};

export default ChannelItem;
