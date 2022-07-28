import { useMemo } from 'react';
import { useEpg } from 'planby';

import type { EpgChannel } from '#src/services/epg.service';

/**
 * Return the Planby EPG props for the given channels
 */
const usePlanByEpg = (channels: EpgChannel[], sidebarWidth: number, itemHeight: number) => {
  const [epgChannels, epgPrograms] = useMemo(() => {
    return [
      channels.map((channel) => ({ uuid: channel.id, logo: channel.image })),
      channels.flatMap((channel) =>
        channel.programs.map((program) => ({
          channelUuid: channel.id,
          id: program.id,
          title: program.title,
          image: program.image || '',
          description: program.description || '',
          till: program.endTime,
          since: program.startTime,
        })),
      ),
    ];
  }, [channels]);

  // Theme configuration for the Planby EPG with only the colors set that are used
  // Fixed values are used because of the tecnical dept we have with the current setup of the config colors values and the theme values
  const theme = {
    primary: {
      600: '#141523',
      900: '#141523',
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
  };

  return useEpg({
    channels: epgChannels,
    epg: epgPrograms,
    dayWidth: 7200,
    sidebarWidth,
    itemHeight,
    isSidebar: true,
    isTimeline: true,
    isLine: true,
    isBaseTimeFormat: true, // TODO: based on locale
    theme,
  });
};

export default usePlanByEpg;
