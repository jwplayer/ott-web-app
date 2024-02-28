import { useTranslation } from 'react-i18next';
import { MediaStatus } from '@jwp/ott-common/src/utils/liveEvent';
import Today from '@jwp/ott-theme/assets/icons/today.svg?react';

import Tag from '../Tag/Tag';
import Icon from '../Icon/Icon';

import styles from './StatusIcon.module.scss';

type Props = {
  mediaStatus?: MediaStatus;
};

export default function StatusIcon({ mediaStatus }: Props) {
  const { t } = useTranslation('video');

  if (mediaStatus === MediaStatus.SCHEDULED || mediaStatus === MediaStatus.VOD) {
    return <Icon icon={Today} className={styles.icon} />;
  } else if (mediaStatus === MediaStatus.LIVE) {
    return (
      <Tag isLive className={styles.icon}>
        {t('live')}
      </Tag>
    );
  }

  return null;
}
