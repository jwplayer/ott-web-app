import { useQuery } from 'react-query';
import { useCallback, useEffect, useState } from 'react';

import type { PlaylistItem } from '#types/playlist';
import epgService, { EpgChannel, EpgProgram } from '#src/services/epg.service';
import { getLiveProgram, programIsLive } from '#src/utils/epg';

/**
 * This hook fetches the schedules for the given list of playlist items and manages the current channel and program.
 *
 * It automatically selects the first channel and currently live program. It also updates the program information when
 * the current program is not live anymore.
 *
 * The `enableAutoUpdate` argument can be used to ignore the auto update mechanism. For example, when playing a live
 * program from the beginning, we don't want to update the program information in the middle of the program.
 */
const useLiveChannels = (playlist: PlaylistItem[], enableAutoUpdate = true) => {
  const { data: channels = [] } = useQuery(['schedules', ...playlist.map(({ mediaid }) => mediaid)], () => epgService.getSchedules(playlist));

  const [autoUpdate, setAutoUpdate] = useState(enableAutoUpdate);
  const [channel, setChannel] = useState<EpgChannel | undefined>();
  const [program, setProgram] = useState<EpgProgram | undefined>();

  // this effect updates the program when watching the live stream and the next program starts
  useEffect(() => {
    if (!autoUpdate || !enableAutoUpdate) return;

    const intervalId = window.setInterval(() => channel && setProgram(getLiveProgram(channel)), 5_000);

    return () => clearInterval(intervalId);
  }, [channel, autoUpdate, enableAutoUpdate]);

  // auto select first channel and program when the data is loaded
  useEffect(() => {
    const firstChannel = channels[0];

    // auto select first channel when no channel is selected
    if (!channel && firstChannel) {
      setChannel(firstChannel);

      // auto select live program
      setProgram(getLiveProgram(firstChannel));
    }
  }, [channels]);

  // update the selected channel and optionally the program
  const setActiveChannel = useCallback(
    (id: string, programId?: string) => {
      const channel = channels?.find((channel) => channel.id === id);

      // early return when no channel was found
      if (!channel) {
        return;
      }

      // select the found program or live program when no programId is given
      const program = programId ? channel.programs.find((program) => program.id === programId) : getLiveProgram(channel);

      setChannel(channel);
      setProgram(program);

      // enable auto update when there is no program information or when the program is live
      // when the user clicks on a VOD item, we don't want to update the information automatically
      setAutoUpdate(!program || programIsLive(program));
    },
    [channels],
  );

  return {
    channel,
    channels,
    program,
    setActiveChannel,
  };
};

export default useLiveChannels;
