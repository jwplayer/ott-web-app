import { Epg as EpgLayout, Layout } from 'planby';
import React from 'react';

import usePlanByEpg from '../../hooks/usePlanByEpg';
import ChevronLeft from '../../icons/ChevronLeft';
import ChevronRight from '../../icons/ChevronRight';
import type { EpgChannel, EpgProgram } from '../../services/epg.service';
import Button from '../Button/Button';
import EpgChannelItem from '../EpgChannel/EpgChannelItem';
import EpgProgramItem from '../EpgProgramItem/EpgProgramItem';
import EpgTimeline from '../EpgTimeline/EpgTimeline';

import styles from './Epg.module.scss';

const theme = {
  primary: {
    600: 'rgba(256, 256, 256, 0.08)',
    900: 'transparent',
  },
  grey: { 300: '#d1d1d1' },
  white: '#fff',
  green: {
    300: '#2C7A7B',
  },
  loader: {
    teal: '#5DDADB',
    purple: '#3437A2',
    pink: '#F78EB6',
    bg: '#171923db',
  },
  scrollbar: {
    border: '#171923db',
    thumb: {
      bg: '#171923db',
    },
  },
  gradient: {
    blue: {
      300: '#002eb3',
      600: '#002360',
      900: '#051937',
    },
  },
  text: {
    grey: {
      300: '#a0aec0',
      500: '#718096',
    },
  },
  timeline: {
    divider: {
      bg: '#718096',
    },
  },
};

type Props = {
  channels: EpgChannel[];
  setActiveChannel: (id: string, programId?: string | undefined) => void;
  program: EpgProgram | undefined;
};

export default function Epg({ channels, setActiveChannel, program }: Props) {
  const { getEpgProps, getLayoutProps, onScrollToNow, onScrollLeft, onScrollRight } = usePlanByEpg(channels, 160);

  return (
    <>
      <div className={styles.timelineControl}>
        <Button className={styles.timelineNowButton} variant="contained" label={'now'} color="primary" onClick={onScrollToNow} />
        <div className={styles.leftControl} role="button" onClick={() => onScrollLeft()}>
          <ChevronLeft />
        </div>
        <div className={styles.rightControl} role="button" onClick={() => onScrollRight()}>
          <ChevronRight />
        </div>
      </div>
      <EpgLayout style={{ padding: 0 }} isLoading={false} {...getEpgProps()} theme={theme}>
        <Layout
          {...getLayoutProps()}
          channelsInScrollContainer={false}
          renderTimeline={(props) => <EpgTimeline {...props} />}
          renderProgram={({ program: programItem, ...rest }) => (
            <EpgProgramItem
              key={programItem.data.id}
              program={programItem}
              onClick={(program) => setActiveChannel(program.data.channelUuid, program.data.id)}
              isActive={program?.id === programItem.data.id}
              {...rest}
            />
          )}
          renderChannel={({ channel }) => <EpgChannelItem key={channel.uuid} channel={channel} />}
        />
      </EpgLayout>
    </>
  );
}
