import { Epg as EpgContainer, Layout } from 'planby';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isBefore, subHours } from 'date-fns';
import type { EpgChannel, EpgProgram } from '@jwp/ott-common/types/epg';
import type { Config } from '@jwp/ott-common/types/config';
import usePlanByEpg from '@jwp/ott-hooks-react/src/usePlanByEpg';
import ChevronRight from '@jwp/ott-theme/assets/icons/chevron_right.svg?react';
import ChevronLeft from '@jwp/ott-theme/assets/icons/chevron_left.svg?react';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

import IconButton from '../IconButton/IconButton';
import Button from '../Button/Button';
import EpgChannelItem from '../EpgChannel/EpgChannelItem';
import EpgProgramItem from '../EpgProgramItem/EpgProgramItem';
import EpgTimeline from '../EpgTimeline/EpgTimeline';
import Spinner from '../Spinner/Spinner';
import Icon from '../Icon/Icon';

import styles from './Epg.module.scss';

type Props = {
  channels: EpgChannel[];
  onChannelClick: (channelId: string) => void;
  onProgramClick: (programId: string, channelId: string) => void;
  selectedChannel: EpgChannel | undefined;
  program: EpgProgram | undefined;
  config: Config;
};

export default function Epg({ channels, selectedChannel, onChannelClick, onProgramClick, program, config }: Props) {
  const breakpoint = useBreakpoint();
  const { t } = useTranslation('common');

  const isMobile = breakpoint < Breakpoint.sm;
  const sidebarWidth = isMobile ? 70 : 184;
  // the subtracted value is used for spacing in the sidebar
  const channelItemWidth = isMobile ? sidebarWidth - 10 : sidebarWidth - 24;
  const itemHeight = isMobile ? 80 : 106;

  // Epg
  const { highlightColor, backgroundColor } = config.styling;
  const { getEpgProps, getLayoutProps, onScrollToNow, onScrollLeft, onScrollRight } = usePlanByEpg({
    channels,
    sidebarWidth,
    itemHeight,
    highlightColor,
    backgroundColor,
  });
  const catchupHoursDict = useMemo(() => Object.fromEntries(channels.map((channel) => [channel.id, channel.catchupHours])), [channels]);
  const titlesDict = useMemo(() => Object.fromEntries(channels.map((channel) => [channel.id, channel.title])), [channels]);

  return (
    <div className={styles.epg}>
      <div className={styles.timelineControl}>
        <Button className={styles.timelineNowButton} variant="contained" label={t('now')} color="primary" onClick={onScrollToNow} size="small" />
        <IconButton className={styles.leftControl} aria-label={t('slide_left')} onClick={() => onScrollLeft()}>
          <Icon icon={ChevronLeft} />
        </IconButton>
        <IconButton className={styles.rightControl} aria-label={t('slide_right')} onClick={() => onScrollRight()}>
          <Icon icon={ChevronRight} />
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
              title={titlesDict[epgChannel.uuid] || ''}
              isActive={selectedChannel?.id === epgChannel.uuid}
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
