import { Epg as EpgContainer, Layout } from 'planby';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isBefore, subHours } from 'date-fns';

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
  channel: EpgChannel | undefined;
  program: EpgProgram | undefined;
  config: Config;
};

export default function Epg({ channels, setActiveChannel, channel, program, config }: Props) {
  const breakpoint = useBreakpoint();
  const { t } = useTranslation('common');

  const isSmall = breakpoint < Breakpoint.sm;
  const sidebarWidth = isSmall ? 90 : 184;
  // the subtracted value is used for spacing in the sidebar
  const channelItemWidth = isSmall ? sidebarWidth - 16 : sidebarWidth - 24;
  const itemHeight = isSmall ? 90 : 106;

  // Epg
  const { getEpgProps, getLayoutProps, onScrollToNow, onScrollLeft, onScrollRight } = usePlanByEpg(channels, sidebarWidth, itemHeight, config);
  const catchupHoursDict = useMemo(() => Object.fromEntries(channels.map((channel) => [channel.id, channel.catchupHours])), [channels]);

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
          renderChannel={({ channel: epgChannel }) => (
            <EpgChannelItem
              key={epgChannel.uuid}
              channel={epgChannel}
              channelItemWidth={channelItemWidth}
              sidebarWidth={sidebarWidth}
              onClick={(toChannel) => setActiveChannel(toChannel.uuid)}
              isActive={channel?.id === epgChannel.uuid}
            />
          )}
          renderProgram={({ program: programItem, ...rest }) => {
            const catchupHours = catchupHoursDict[programItem.data.channelUuid];
            const disabled = isBefore(new Date(programItem.data.since), subHours(new Date(), catchupHours));

            return (
              <EpgProgramItem
                key={programItem.data.id}
                program={programItem}
                disabled={disabled}
                onClick={(program) => !disabled && setActiveChannel(program.data.channelUuid, program.data.id)}
                isActive={program?.id === programItem.data.id}
                compact={isSmall}
                {...rest}
              />
            );
          }}
        />
      </EpgContainer>
    </div>
  );
}
