import { useMemo } from 'react';
import { useEpg } from 'planby';

import type { Config } from '#types/Config';
import type { EpgChannel } from '#src/services/epg.service';

/**
 * Return the Planby EPG props for the given channels
 */
const usePlanByEpg = (channels: EpgChannel[], sidebarWidth: number, itemHeight: number, config: Config) => {
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

  const theme = useMemo(() => makeTheme(config.styling.highlightColor, config.styling.backgroundColor), [config]);
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

// Theme configuration for the Planby EPG with only the colors set that are used
// Fixed values are used because the default highlightColor and backgroundColor are only available in SCSS

const makeTheme = (primaryColor?: string | null, backgroundColor?: string | null) => ({
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
