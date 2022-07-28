import React from 'react';
import { useTimeline } from 'planby';

import styles from './EpgTimeline.module.scss';

type Props = {
  isBaseTimeFormat: boolean;
  isSidebar: boolean;
  dayWidth: number;
  hourWidth: number;
  numberOfHoursInDay: number;
  offsetStartHoursRange: number;
  sidebarWidth: number;
};

const EpgTimeline: React.VFC<Props> = ({ isBaseTimeFormat, dayWidth, hourWidth, numberOfHoursInDay, offsetStartHoursRange, isSidebar, sidebarWidth }) => {
  const { time, dividers, formatTime } = useTimeline(numberOfHoursInDay, isBaseTimeFormat);

  const renderDividers = () => dividers.map((_, index) => <div className={styles.timelineDivider} key={index} style={{ marginRight: hourWidth / 4 }} />);

  const renderTime = (index: number) => (
    <div className={styles.timelineBox} key={index} style={{ width: hourWidth }}>
      <time className={styles.timelineTime}>{formatTime(index + offsetStartHoursRange).toLowerCase()}</time>
      <div className={styles.timelineDividers}>{renderDividers()}</div>
    </div>
  );

  return (
    <div className={styles.timelineContainer} style={{ width: dayWidth, left: isSidebar ? sidebarWidth : 0 }}>
      {time.map((_, index) => renderTime(index))}
    </div>
  );
};

export default EpgTimeline;
