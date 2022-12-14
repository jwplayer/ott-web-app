import { useMemo } from 'react';
import { useEpg } from 'planby';
import { startOfToday, startOfTomorrow } from 'date-fns';

import type { EpgChannel } from '#src/services/epg.service';
import { is12HourClock } from '#src/utils/datetime';

const isBaseTimeFormat = is12HourClock();

/**
 * Return the Planby EPG props for the given channels
 */
const usePlanByEpg = (channels: EpgChannel[], sidebarWidth: number, itemHeight: number, highlightColor?: string | null, backgroundColor?: string | null) => {
  const [epgChannels, epgPrograms] = useMemo(() => {
    return [
      channels.map((channel) => ({
        uuid: channel.id,
        logo: channel.channelLogoImage?.image || '',
        channelLogoImage: channel.channelLogoImage,
        backgroundImage: channel.backgroundImage,
      })),
      channels.flatMap((channel) =>
        channel.programs.map((program) => ({
          channelUuid: channel.id,
          id: program.id,
          title: program.title,
          image: program.shelfImage?.image || '',
          // programs have the same shelfImage/backgroundImage (different API)
          shelfImage: program.shelfImage,
          backgroundImage: program.backgroundImage,
          description: program.description || '',
          till: program.endTime,
          since: program.startTime,
        })),
      ),
    ];
  }, [channels]);

  const theme = useMemo(() => makeTheme(highlightColor, backgroundColor), [highlightColor, backgroundColor]);

  // this mechanism updates the EPG component range when leaving the page open for a longer period
  // the useEpg hook doesn't accept a formatted date and re-renders when not memoize the start and end dates
  // @todo ideally we want to render the schedule X hours before and after the current time, but this doesn't work (yet)
  //       in the Planby component. E.g. `[subHours(new Date(), 12), addHours(new Date(), 12)]`. The `date` dependency
  //       must also be changed to update every hour instead of daily.
  const date = startOfToday().toJSON();
  const [startDate, endDate] = useMemo(() => [startOfToday(), startOfTomorrow()], [date]);

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
