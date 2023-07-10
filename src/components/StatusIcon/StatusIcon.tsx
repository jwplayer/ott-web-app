import { useTranslation } from 'react-i18next';

import Tag from '#components/Tag/Tag';
import Today from '#src/icons/Today';
import { MediaStatus } from '#src/utils/liveEvent';

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
