import { useQuery } from 'react-query';
import { isAfter, isBefore, subHours } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { PlaylistItem } from '#types/playlist';
import epgService, { EpgChannel, EpgProgram } from '#src/services/epg.service';

const isLiveProgram = (program: EpgProgram) => isBefore(new Date(program.startTime), new Date()) && isAfter(new Date(program.endTime), new Date());
const isVodProgram = (program: EpgProgram) =>
  isBefore(new Date(program.startTime), new Date()) &&
  isBefore(new Date(program.endTime), new Date()) &&
  isAfter(new Date(program.startTime), subHours(new Date(), 8));

const useLiveChannels = (playlist: PlaylistItem[]) => {
  const { data: channels = [] } = useQuery(['live-channels', ...playlist.map(({ mediaid }) => mediaid)], async () => {
    return await epgService.getSchedules(playlist);
  });

  const [autoUpdate, setAutoUpdate] = useState(true);
  const [channel, setChannel] = useState<EpgChannel | undefined>(channels[0]);
  const [program, setProgram] = useState<EpgProgram | undefined>();

  const isLive = useMemo(() => program && isLiveProgram(program), [program]);
  const isVod = useMemo(() => program && isVodProgram(program), [program]);

  const setLiveProgram = (currentChannel: EpgChannel | undefined) => {
    if (!currentChannel) return;
    const liveProgram = currentChannel.programs.find(isLiveProgram);

    if (!program || program.id !== liveProgram?.id) {
      setProgram(currentChannel.programs.find(isLiveProgram));
    }
  };

  useEffect(() => {
    if (!autoUpdate) return;

    const intervalId = window.setInterval(() => setLiveProgram(channel), 2_500);

    return () => clearInterval(intervalId);
  }, [channel, autoUpdate]);

  useEffect(() => {
    const currentChannel = channel || channels[0];

    // auto select first channel
    if (!channel && currentChannel) setChannel(currentChannel);

    // auto select live program
    setLiveProgram(currentChannel);
  }, [channels]);

  /**
   * Update the selected channel and optionally the program
   */
  const setActiveChannel = useCallback(
    (id: string, programId?: string) => {
      const channel = channels?.find((channel) => channel.id === id);

      if (channel) {
        const program = channel.programs.find((program) => program.id === programId);

        setChannel(channel);
        setProgram(program);
        setAutoUpdate(!!program && isLiveProgram(program));
      }
    },
    [channels],
  );

  return {
    channel,
    channels,
    program,
    setActiveChannel,
    isVod,
    isLive,
  };
};

export default useLiveChannels;
