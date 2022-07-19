import epgService, { EpgProgram } from '#src/services/epg.service';
import scheduleFixture from '#src/fixtures/schedule.json';
import livePlaylistFixture from '#src/fixtures/livePlaylist.json';
import type { Playlist, PlaylistItem } from '#types/playlist';

const livePlaylist = livePlaylistFixture as Playlist;
const scheduleData = scheduleFixture as EpgProgram[];

describe('epgService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getSchedule fetches and validates a valid schedule', async () => {
    const spy = vitest.spyOn(epgService, 'fetchSchedule').mockImplementation(() => Promise.resolve(scheduleData));
    const schedule = await epgService.getSchedule(livePlaylist.playlist[0]);

    expect(spy).toBeCalled();
    expect(schedule.title).toEqual('Channel 1');
    expect(schedule.programs.length).toEqual(10);
  });

  test('parseSchedule should remove programs where required fields are missing', async () => {
    // missing title
    const schedule1 = await epgService.parseSchedule([
      {
        startsAt: '2022-07-19T09:00:00Z',
        endsAt: '2022-07-19T12:00:00Z',
      },
    ]);
    // missing startsAt
    const schedule2 = await epgService.parseSchedule([
      {
        title: 'The title',
        endsAt: '2022-07-19T12:00:00Z',
      },
    ]);
    // missing endsAt
    const schedule3 = await epgService.parseSchedule([
      {
        title: 'The title',
        startsAt: '2022-07-19T09:00:00Z',
      },
    ]);

    expect(schedule1.length).toEqual(0);
    expect(schedule2.length).toEqual(0);
    expect(schedule3.length).toEqual(0);
  });

  test('parseSchedule should remove programs where the startsAt or endsAt are not valid ISO8601', async () => {
    // invalid startsAt
    const schedule1 = await epgService.parseSchedule([
      {
        title: 'Test item',
        startsAt: 'this is not ISO8601',
        endsAt: '2022-07-19T12:00:00Z',
      },
    ]);
    // invalid endsAt
    const schedule2 = await epgService.parseSchedule([
      {
        title: 'The title',
        startsAt: '2022-07-19T09:00:00Z',
        endsAt: 'this is not ISO8601',
      },
    ]);

    expect(schedule1.length).toEqual(0);
    expect(schedule2.length).toEqual(0);
  });

  test('getSchedules fetches and validates multiple schedules', async () => {
    const spy = vitest.spyOn(epgService, 'fetchSchedule').mockImplementation((item: PlaylistItem) => {
      if (item.title === 'Channel 1') return Promise.resolve(scheduleData);
      if (item.title === 'Channel 2') return Promise.resolve([]);
      return Promise.reject(new Error('Something went wrong'));
    });

    // getSchedules for multiple playlist items
    const schedules = await epgService.getSchedules(livePlaylist.playlist);

    // make sure we are testing a playlist with three media items
    expect(livePlaylistFixture.playlist.length).toBe(3);
    expect(spy).toBeCalledTimes(3);

    // valid schedule with 10 programs
    expect(schedules[0].title).toEqual('Channel 1');
    expect(schedules[0].programs.length).toEqual(10);

    // empty schedule
    expect(schedules[1].title).toEqual('Channel 2');
    expect(schedules[1].programs.length).toEqual(0);

    // failed fetching the schedule request
    expect(schedules[2].title).toEqual('Channel 3');
    expect(schedules[2].programs.length).toEqual(0);
  });
});
