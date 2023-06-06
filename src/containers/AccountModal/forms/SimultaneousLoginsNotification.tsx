import React from 'react';
import { useLocation, useNavigate } from 'react-router';

import styles from '../AccountModal.module.scss';

import Button from '#src/components/Button/Button';
import { addQueryParam } from '#src/utils/location';

const SimultaneousLoginsNotification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  function loginClickHandler() {
    navigate(addQueryParam(location, 'u', 'login'));
  }

  return (
    <React.Fragment>
      <h1 className={styles.title}>You have been logged out because the simultaneous logins limit has been reached.</h1>
      <Button type="submit" onClick={loginClickHandler} label="Ok" variant="contained" color="primary" size="large" fullWidth />
    </React.Fragment>
  );
};
export default SimultaneousLoginsNotification;
