import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import styles from '../AccountModal.module.scss';

import Button from '#src/components/Button/Button';
import { addQueryParam } from '#src/utils/location';

const SimultaneousLoginsNotification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');
  function loginClickHandler() {
    navigate(addQueryParam(location, 'u', 'login'));
  }

  return (
    <React.Fragment>
      <h1 className={styles.simultaneousLoginsTitle}> {t('login.simultaneous_logins')}</h1>
      <Button type="submit" onClick={loginClickHandler} label="Ok" variant="contained" color="primary" size="large" fullWidth />
    </React.Fragment>
  );
};
export default SimultaneousLoginsNotification;
