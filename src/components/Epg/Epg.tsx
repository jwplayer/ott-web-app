import { Epg as EpgContainer, Layout } from 'planby';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Epg.module.scss';

import type { Config } from '#types/Config';
import Button from '#src/components/Button/Button';
import EpgChannelItem from '#src/components/EpgChannel/EpgChannelItem';
import EpgProgramItem from '#src/components/EpgProgramItem/EpgProgramItem';
import EpgTimeline from '#src/components/EpgTimeline/EpgTimeline';
import Spinner from '#src/components/Spinner/Spinner';
import type { EpgChannel, EpgProgram } from '#src/services/epg.service';
import ChevronRight from '#src/icons/ChevronRight';
import ChevronLeft from '#src/icons/ChevronLeft';
import usePlanByEpg from '#src/hooks/usePlanByEpg';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';

type Props = {
  channels: EpgChannel[];
  setActiveChannel: (id: string, programId?: string | undefined) => void;
  program: EpgProgram | undefined;
  config: Config;
};

export default function Epg({ channels, setActiveChannel, program, config }: Props) {
  const breakpoint = useBreakpoint();
  const { t } = useTranslation('common');
  const isSmall = breakpoint < Breakpoint.sm;
  const sidebarWidth = isSmall ? 90 : 184;
  // the subtracted value is used for spacing in the sidebar
  const channelItemWidth = isSmall ? sidebarWidth - 16 : sidebarWidth - 24;
  const itemHeight = isSmall ? 90 : 106;
  const { getEpgProps, getLayoutProps, onScrollToNow, onScrollLeft, onScrollRight } = usePlanByEpg(channels, sidebarWidth, itemHeight, config);

  return (
    <div className={styles.epg}>
      <div className={styles.timelineControl}>
        <Button className={styles.timelineNowButton} variant="contained" label={t('now')} color="primary" onClick={onScrollToNow} />
        <div className={styles.leftControl} role="button" onClick={() => onScrollLeft()}>
          <ChevronLeft />
        </div>
        <div className={styles.rightControl} role="button" onClick={() => onScrollRight()}>
          <ChevronRight />
        </div>
      </div>
      <EpgContainer {...getEpgProps()} loader={<Spinner className={styles.epgSpinner} />}>
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
