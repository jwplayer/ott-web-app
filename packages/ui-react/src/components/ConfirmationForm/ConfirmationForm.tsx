import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import Button from '../Button/Button';
import { modalURLFromLocation } from '../../utils/location';

import styles from './ConfirmationForm.module.scss';

type Props = {
  email?: string;
  loggedIn?: boolean;
  onBackToLogin: () => void;
};

const ConfirmationForm: React.FC<Props> = ({ email, onBackToLogin, loggedIn }: Props) => {
  const { t } = useTranslation('account');
  const location = useLocation();

  return (
    <div className={styles.forgotPasswordForm}>
      <h2 className={styles.title}>{t('reset.link_sent')}</h2>
      <p className={styles.text}>{t('reset.link_sent_text', { email: email })}</p>
      <Button onClick={onBackToLogin} className={styles.button} fullWidth color="primary" label={t('reset.back_login')} />
      {!loggedIn && (
        <React.Fragment>
          <span className={styles.notSure}>{t('reset.not_sure')}</span>
          <Link className={styles.link} to={modalURLFromLocation(location, 'forgot-password')}>
            {t('reset.try_again')}
          </Link>
        </React.Fragment>
      )}
    </div>
  );
};

export default ConfirmationForm;
