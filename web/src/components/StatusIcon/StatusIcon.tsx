import { useTranslation } from 'react-i18next';
import { MediaStatus } from '@jwplayer/ott-common/src/utils/liveEvent';

import Tag from '../Tag/Tag';
import Today from '../../icons/Today';

type Props = {
  mediaStatus?: MediaStatus;
};

export default function StatusIcon({ mediaStatus }: Props) {
  const { t } = useTranslation('video');

  if (mediaStatus === MediaStatus.SCHEDULED || mediaStatus === MediaStatus.VOD) {
    return <Today />;
  } else if (mediaStatus === MediaStatus.LIVE) {
    return <Tag isLive>{t('live')}</Tag>;
  }

  return null;
}
