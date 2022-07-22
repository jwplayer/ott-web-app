import { useMemo } from 'react';
import { useEpg } from 'planby';

import type { EpgChannel } from '#src/services/epg.service';

/**
 * Return the Planby EPG props for the given channels
 */
const usePlanByEpg = (channels: EpgChannel[]) => {
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

  return useEpg({
    channels: epgChannels,
    epg: epgPrograms,
    dayWidth: 7200,
    sidebarWidth: 100,
    itemHeight: 80,
    isSidebar: true,
    isTimeline: true,
    isLine: true,
    isBaseTimeFormat: true, // TODO: based on locale
  });
};

export default usePlanByEpg;
