import { useMemo } from 'react';
import { useEpg } from 'planby';
import { startOfDay, startOfToday, startOfTomorrow } from 'date-fns';
import type { EpgChannel, EpgProgram } from '@jwp/ott-common/types/epg';
import { is12HourClock } from '@jwp/ott-common/src/utils/datetime';

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

  const theme = useMemo(() => makeTheme(), []);

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

export const makeTheme = () => ({
  primary: {
    600: 'var(--epg-background-color, var(--body-background-color))',
    900: 'var(--epg-background-color, var(--body-background-color))',
  },
  grey: {
    300: '#fff',
  },
  white: '#fff',
  green: {
    300: '#fff',
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
