import { useQuery } from 'react-query';
import { useCallback, useEffect, useState } from 'react';

import type { PlaylistItem } from '#types/playlist';
import epgService, { EpgChannel, EpgProgram } from '#src/services/epg.service';
import { getLiveProgram, programIsLive } from '#src/utils/epg';
import { LIVE_CHANNELS_REFETCH_INTERVAL } from '#src/config';

/**
 * This hook fetches the schedules for the given list of playlist items and manages the current channel and program.
 *
 * It automatically selects the initial channel (or first channel) and currently live program. It also updates the
 * program information when the current program is not live anymore.
 *
 * The `enableAutoUpdate` argument can be used to ignore the auto update mechanism. For example, when playing a live
 * program from the beginning, we don't want to update the program information in the middle of the program.
 *
 * @todo The `enableAutoUpdate` mechanism has a drawback, when used the program information will not be updated anymore.
 *       Meaning that when watching a program from the beginning, it will hold the current program until the user clicks
 *       on a different program. This can be solved when we implement syncing the stream PDT with the schedule. Then the
 *       program information will be reactive based on the current time in the stream.
 */
const useLiveChannels = (playlist: PlaylistItem[], initialChannelId: string | undefined, enableAutoUpdate = true) => {
  const { data: channels = [] } = useQuery(['schedules', ...playlist.map(({ mediaid }) => mediaid)], () => epgService.getSchedules(playlist), {
    refetchInterval: LIVE_CHANNELS_REFETCH_INTERVAL,
  });

  const [autoUpdate, setAutoUpdate] = useState(enableAutoUpdate);
  const [channel, setChannel] = useState<EpgChannel | undefined>();
  const [program, setProgram] = useState<EpgProgram | undefined>();

  // this effect updates the program when watching the live stream and the next program starts
  useEffect(() => {
    if (!autoUpdate || !enableAutoUpdate) return;

    const intervalId = window.setInterval(() => channel && setProgram(getLiveProgram(channel)), 5_000);

    return () => clearInterval(intervalId);
  }, [channel, autoUpdate, enableAutoUpdate]);

  // auto select initial channel (fallback to first channel) and program when the data is loaded
  // update channel and program state with the latest data
  useEffect(() => {
    const selectedChannel = channels.find(({ id }) => id === initialChannelId) || channels[0];

    // auto select first channel when no channel is selected
    if (!channel && selectedChannel) {
      setChannel(selectedChannel);

      // auto select live program
      setProgram(getLiveProgram(selectedChannel));
    }

    // update the current channel with the updated data
    if (channel) {
      const updatedChannel = channels.find(({ id }) => id === channel.id);

      // find the current program in the updated data
      let updatedProgram = program && updatedChannel?.programs.find(({ id }) => id === program?.id);

      // if the program doesn't exist, use the live program
      if (!updatedProgram && updatedChannel) {
        updatedProgram = getLiveProgram(updatedChannel);
      }

      // update channel with potential updated programs
      setChannel(updatedChannel);
      setProgram(updatedProgram);
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
