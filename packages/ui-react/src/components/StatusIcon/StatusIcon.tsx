import { useTranslation } from 'react-i18next';
import { MediaStatus } from '@jwp/ott-common/src/utils/liveEvent';

import Today from '../../icons/Today';
import Tag from '../Tag/Tag';

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
