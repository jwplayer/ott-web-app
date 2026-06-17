import { object, string } from 'yup';
import { parse } from 'date-fns';
import { injectable } from 'inversify';

import EpgService from '../EpgService';
import type { PlaylistItem } from '../../../types/playlist';
import type { EpgProgram } from '../../../types/epg';
import { logError, logWarn } from '../../logger';

const xmltvEpgProgramSchema = object().shape({
  'episode-num': object().shape({
    '#text': string().required(),
  }),
  title: object().shape({
    '#text': string().required(),
  }),
  desc: object().shape({
    '#text': string(),
  }),
  icon: object().shape({
    src: string(),
  }),
  start: string().required(),
  stop: string().required(),
});

const parseData = (date: string): string => parse(date, 'yyyyMdHms xxxx', new Date()).toISOString();

@injectable()
export default class XmltvEpgService extends EpgService {
  transformProgram = async (data: unknown): Promise<EpgProgram> => {
    const program = await xmltvEpgProgramSchema.validate(data);

    return {
      id: program['episode-num']['#text'],
      title: program['title']['#text'],
      startTime: parseData(program['start']),
      endTime: parseData(program['stop']),
      description: program?.['desc']?.['#text'],
      cardImage: program?.['icon']?.['src'],
      backgroundImage: program?.['icon']?.['src'],
    };
  };

  fetchSchedule = async (item: PlaylistItem) => {
    const { XMLParser } = await import('fast-xml-parser');

    const scheduleUrl = item.scheduleUrl;

    if (!scheduleUrl) {
      logWarn('XmltvEpgService', 'Tried requesting a schedule for an item with missing `scheduleUrl`', { item });
      return undefined;
    }

    const xmlParserOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: '',
    };

    try {
      const data = await fetch(scheduleUrl).then((res) => res.text());
      const parser = new XMLParser(xmlParserOptions);
      const schedule = parser.parse(data);

      return schedule?.tv?.programme || [];
    } catch (error: unknown) {
      if (error instanceof Error) {
        logError('XmltvEpgService', `Fetch failed for XMLTV EPG schedule: '${scheduleUrl}'`, { error });
      }
    }
  };
}
