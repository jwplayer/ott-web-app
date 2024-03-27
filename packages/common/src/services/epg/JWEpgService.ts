import { array, object, string } from 'yup';
import { isValid } from 'date-fns';
import { injectable } from 'inversify';

import EpgService from '../EpgService';
import type { PlaylistItem } from '../../../types/playlist';
import type { EpgProgram } from '../../../types/epg';
import { getDataOrThrow } from '../../utils/api';
import { logDev } from '../../utils/common';

const AUTHENTICATION_HEADER = 'API-KEY';

const jwEpgProgramSchema = object().shape({
  id: string().required(),
  title: string().required(),
  startTime: string()
    .required()
    .test((value) => (value ? isValid(new Date(value)) : false)),
  endTime: string()
    .required()
    .test((value) => (value ? isValid(new Date(value)) : false)),
  chapterPointCustomProperties: array().of(
    object().shape({
      key: string().required(),
      value: string().test('required-but-empty', 'value is required', (value: unknown) => typeof value === 'string'),
    }),
  ),
});

@injectable()
export default class JWEpgService extends EpgService {
  transformProgram = async (data: unknown): Promise<EpgProgram> => {
    const program = await jwEpgProgramSchema.validate(data);
    const image = program.chapterPointCustomProperties?.find((item) => item.key === 'image')?.value || undefined;

    return {
      id: program.id,
      title: program.title,
      startTime: program.startTime,
      endTime: program.endTime,
      cardImage: image,
      backgroundImage: image,
      description: program.chapterPointCustomProperties?.find((item) => item.key === 'description')?.value || undefined,
    };
  };

  fetchSchedule = async (item: PlaylistItem) => {
    if (!item.scheduleUrl) {
      logDev('Tried requesting a schedule for an item with missing `scheduleUrl`', item);
      return undefined;
    }

    const headers = new Headers();

    // add authentication token when `scheduleToken` is defined
    if (item.scheduleToken) {
      headers.set(AUTHENTICATION_HEADER, item.scheduleToken);
    }

    try {
      const response = await fetch(item.scheduleUrl, {
        headers,
      });

      // await needed to ensure the error is caught here
      return await getDataOrThrow(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logDev(`Fetch failed for EPG schedule: '${item.scheduleUrl}'`, error);
      }
    }
  };
}
