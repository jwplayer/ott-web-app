import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PlayerError.module.scss';

export enum PlayerErrorState {
  GEO_BLOCKED = 'GEO_BLOCKED',
}

type Props = {
  error: keyof typeof PlayerErrorState;
};

const PlayerError: React.FC<Props> = () => {
  const { t } = useTranslation('video');
  return (
    <div className={styles.error}>
      <h2 className={styles.title}>{t('player_error.geo_blocked_title')}</h2>
      <p>{t('player_error.geo_blocked_description')}</p>
    </div>
  );
};

export default PlayerError;
