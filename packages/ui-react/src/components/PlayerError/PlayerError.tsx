import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PlayerError.module.scss';

export enum PlayerErrorState {
  GEO_BLOCKED = 'GEO_BLOCKED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNKNOWN = 'UNKNOWN',
}

type Props = {
  error: keyof typeof PlayerErrorState;
};

const PlayerError: React.FC<Props> = ({ error }) => {
  const { t } = useTranslation('video');

  // t('player_error.geo_blocked.title')
  // t('player_error.geo_blocked.description')
  // t('player_error.unauthorized.title')
  // t('player_error.unauthorized.description')
  // t('player_error.unknown.title')
  // t('player_error.unknown.description')
  return (
    <div className={styles.error}>
      <h2 className={styles.title}>{t(`player_error.${error.toLowerCase()}.title`)}</h2>
      <p>{t(`player_error.${error.toLowerCase()}.description`)}</p>
    </div>
  );
};

export default PlayerError;
