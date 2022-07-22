import React from 'react';
import { TimelineBox, TimelineDivider, TimelineDividers, TimelineTime, TimelineWrapper, useTimeline } from 'planby';

type Props = {
  isBaseTimeFormat: boolean;
  isSidebar: boolean;
  dayWidth: number;
  hourWidth: number;
  numberOfHoursInDay: number;
  offsetStartHoursRange: number;
  sidebarWidth: number;
};

const Timeline: React.VFC<Props> = ({ isBaseTimeFormat, isSidebar, dayWidth, hourWidth, numberOfHoursInDay, offsetStartHoursRange, sidebarWidth }) => {
  const { time, dividers, formatTime } = useTimeline(numberOfHoursInDay, isBaseTimeFormat);

  const renderTime = (index: number) => (
    <TimelineBox key={index} width={hourWidth}>
      <TimelineTime>{formatTime(index + offsetStartHoursRange).toLowerCase()}</TimelineTime>
      <TimelineDividers>{renderDividers()}</TimelineDividers>
    </TimelineBox>
  );

  const renderDividers = () => dividers.map((_, index) => <TimelineDivider key={index} width={hourWidth} />);

  return (
    <TimelineWrapper dayWidth={dayWidth} sidebarWidth={sidebarWidth} isSidebar={isSidebar}>
      {time.map((_, index) => renderTime(index))}
    </TimelineWrapper>
  );
};

export default Timeline;
