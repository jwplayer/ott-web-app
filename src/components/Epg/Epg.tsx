import { Epg as EpgContainer, Layout } from 'planby';
import React from 'react';

import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import usePlanByEpg from '../../hooks/usePlanByEpg';
import ChevronLeft from '../../icons/ChevronLeft';
import ChevronRight from '../../icons/ChevronRight';
import type { EpgChannel, EpgProgram } from '../../services/epg.service';
import Button from '../Button/Button';
import EpgChannelItem from '../EpgChannel/EpgChannelItem';
import EpgProgramItem from '../EpgProgramItem/EpgProgramItem';
import EpgTimeline from '../EpgTimeline/EpgTimeline';

import styles from './Epg.module.scss';

type Props = {
  channels: EpgChannel[];
  setActiveChannel: (id: string, programId?: string | undefined) => void;
  program: EpgProgram | undefined;
};

export default function Epg({ channels, setActiveChannel, program }: Props) {
  const breakpoint = useBreakpoint();
  const isSmall = breakpoint < Breakpoint.sm;
  const sidebarWidth = isSmall ? 90 : 184;
  // the subracted values create a space for the sidebar
  const channelItemWidth = isSmall ? sidebarWidth - 16 : sidebarWidth - 24;
  const itemHeight = isSmall ? 90 : 106;
  const { getEpgProps, getLayoutProps, onScrollToNow, onScrollLeft, onScrollRight } = usePlanByEpg(channels, sidebarWidth, itemHeight);

  return (
    <div className={styles.epg}>
      <div className={styles.timelineControl}>
        <Button className={styles.timelineNowButton} variant="contained" label={'now'} color="primary" onClick={onScrollToNow} />
        <div className={styles.leftControl} role="button" onClick={() => onScrollLeft()}>
          <ChevronLeft />
        </div>
        <div className={styles.rightControl} role="button" onClick={() => onScrollRight()}>
          <ChevronRight />
        </div>
      </div>
      <EpgContainer {...getEpgProps()}>
        <Layout
          {...getLayoutProps()}
          renderTimeline={(props) => <EpgTimeline {...props} />}
          renderChannel={({ channel }) => (
            <EpgChannelItem key={channel.uuid} channel={channel} channelItemWidth={channelItemWidth} sidebarWidth={sidebarWidth} />
          )}
          renderProgram={({ program: programItem, ...rest }) => (
            <EpgProgramItem
              key={programItem.data.id}
              program={programItem}
              onClick={(program) => setActiveChannel(program.data.channelUuid, program.data.id)}
              isActive={program?.id === programItem.data.id}
              compact={isSmall}
              {...rest}
            />
          )}
        />
      </EpgContainer>
    </div>
  );
}
