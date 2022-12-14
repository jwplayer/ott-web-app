import { Epg as EpgContainer, Layout } from 'planby';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isBefore, subHours } from 'date-fns';

import styles from './Epg.module.scss';

import type { Config } from '#types/Config';
import IconButton from '#components/IconButton/IconButton';
import Button from '#components/Button/Button';
import EpgChannelItem from '#components/EpgChannel/EpgChannelItem';
import EpgProgramItem from '#components/EpgProgramItem/EpgProgramItem';
import EpgTimeline from '#components/EpgTimeline/EpgTimeline';
import Spinner from '#components/Spinner/Spinner';
import type { EpgChannel, EpgProgram } from '#src/services/epg.service';
import ChevronRight from '#src/icons/ChevronRight';
import ChevronLeft from '#src/icons/ChevronLeft';
import usePlanByEpg from '#src/hooks/usePlanByEpg';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';

type Props = {
  channels: EpgChannel[];
  onChannelClick: (channelId: string) => void;
  onProgramClick: (programId: string, channelId: string) => void;
  channel: EpgChannel | undefined;
  program: EpgProgram | undefined;
  config: Config;
};

export default function Epg({ channels, onChannelClick, onProgramClick, channel, program, config }: Props) {
  const breakpoint = useBreakpoint();
  const { t } = useTranslation('common');

  const isMobile = breakpoint < Breakpoint.sm;
  const sidebarWidth = isMobile ? 70 : 184;
  // the subtracted value is used for spacing in the sidebar
  const channelItemWidth = isMobile ? sidebarWidth - 10 : sidebarWidth - 24;
  const itemHeight = isMobile ? 80 : 106;

  // Epg
  const { highlightColor, backgroundColor } = config.styling;
  const { getEpgProps, getLayoutProps, onScrollToNow, onScrollLeft, onScrollRight } = usePlanByEpg(
    channels,
    sidebarWidth,
    itemHeight,
    highlightColor,
    backgroundColor,
  );
  const catchupHoursDict = useMemo(() => Object.fromEntries(channels.map((channel) => [channel.id, channel.catchupHours])), [channels]);

  return (
    <div className={styles.epg}>
      <div className={styles.timelineControl}>
        <Button className={styles.timelineNowButton} variant="contained" label={t('now')} color="primary" onClick={onScrollToNow} size="small" />
        <IconButton className={styles.leftControl} aria-label={t('slide_left')} onClick={() => onScrollLeft()}>
          <ChevronLeft />
        </IconButton>
        <IconButton className={styles.rightControl} aria-label={t('slide_right')} onClick={() => onScrollRight()}>
          <ChevronRight />
        </IconButton>
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
              onClick={(toChannel) => {
                onChannelClick(toChannel.uuid);
                onScrollToNow();
              }}
              isActive={channel?.id === epgChannel.uuid}
            />
          )}
          renderProgram={({ program: programItem, isBaseTimeFormat }) => {
            const catchupHours = catchupHoursDict[programItem.data.channelUuid];
            const disabled = isBefore(new Date(programItem.data.since), subHours(new Date(), catchupHours));

            return (
              <EpgProgramItem
                key={programItem.data.id}
                program={programItem}
                disabled={disabled}
                onClick={(program) => !disabled && onProgramClick(program.data.id, program.data.channelUuid)}
                isActive={program?.id === programItem.data.id}
                compact={isMobile}
                isBaseTimeFormat={isBaseTimeFormat}
              />
            );
          }}
        />
      </EpgContainer>
    </div>
  );
}
