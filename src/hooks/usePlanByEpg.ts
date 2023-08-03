import { useMemo } from 'react';
import { useEpg } from 'planby';
import { startOfDay, startOfToday, startOfTomorrow } from 'date-fns';

import type { EpgChannel, EpgProgram } from '#src/services/epg.service';
import { is12HourClock } from '#src/utils/datetime';

const isBaseTimeFormat = is12HourClock();

export const formatChannel = ({ id, channelLogoImage, backgroundImage }: EpgChannel) => ({
  uuid: id,
  logo: channelLogoImage,
  channelLogoImage: channelLogoImage,
  backgroundImage: backgroundImage,
});

export const formatProgram = (channelId: string, { id, title, cardImage, backgroundImage, description, endTime, startTime }: EpgProgram) => ({
  channelUuid: channelId,
  id: id,
  title: title,
  image: cardImage || '',
  // programs have the same cardImage/backgroundImage (different API)
  cardImage: cardImage || '',
  backgroundImage: backgroundImage || '',
  description: description || '',
  till: endTime,
  since: startTime,
});

/**
 * Return the Planby EPG props for the given channels
 */
const usePlanByEpg = ({
  channels,
  sidebarWidth,
  itemHeight,
  highlightColor,
  backgroundColor,
}: {
  channels: EpgChannel[];
  sidebarWidth: number;
  itemHeight: number;
  highlightColor?: string | null;
  backgroundColor?: string | null;
}) => {
  const [epgChannels, epgPrograms] = useMemo(() => {
    return [channels.map(formatChannel), channels.flatMap((channel) => channel.programs.map((program) => formatProgram(channel.id, program)))];
  }, [channels]);

  const theme = useMemo(() => makeTheme(highlightColor, backgroundColor), [highlightColor, backgroundColor]);

  // this mechanism updates the EPG component range when leaving the page open for a longer period
  // the useEpg hook doesn't accept a formatted date and re-renders when not memoize the start and end dates
  // @todo ideally we want to render the schedule X hours before and after the current time, but this doesn't work (yet)
  //       in the Planby component. E.g. `[subHours(new Date(), 12), addHours(new Date(), 12)]`. The `date` dependency
  //       must also be changed to update every hour instead of daily.
  const date = startOfToday().toJSON();
  const [startDate, endDate] = useMemo(() => [startOfDay(new Date(date)), startOfTomorrow()], [date]);

  return useEpg({
    channels: epgChannels,
    epg: epgPrograms,
    dayWidth: 7200,
    sidebarWidth,
    itemHeight,
    isSidebar: true,
    isTimeline: true,
    isLine: true,
    isBaseTimeFormat,
    startDate,
    endDate,
    theme,
  });
};

// Theme configuration for the Planby EPG with only the colors set that are used
// Fixed values are used because the default highlightColor and backgroundColor are only available in SCSS
export const makeTheme = (primaryColor?: string | null, backgroundColor?: string | null) => ({
  primary: {
    600: backgroundColor || '#141523',
    900: backgroundColor || '#141523',
  },
  grey: {
    300: primaryColor || '#fff',
  },
  white: primaryColor || '#fff',
  green: {
    300: primaryColor || '#fff',
  },
  loader: {
    teal: '',
    purple: '',
    pink: '',
    bg: '',
  },
  scrollbar: {
    border: '',
    thumb: {
      bg: '',
    },
  },
  gradient: {
    blue: {
      300: '',
      600: '',
      900: '',
    },
  },
  text: {
    grey: {
      300: '',
      500: '',
    },
  },
  timeline: {
    divider: {
      bg: '',
    },
  },
});

export default usePlanByEpg;
