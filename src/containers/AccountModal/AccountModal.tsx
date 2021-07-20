import React, { useContext } from 'react';
import { useHistory } from 'react-router';

import Button from '../../components/Button/Button';
import { ConfigContext } from '../../providers/ConfigProvider';
import Dialog from '../../components/Dialog/Dialog';
import useQueryParam from '../../hooks/useQueryParam';
import { removeQueryParam } from '../../utils/history';

import styles from './AccountModal.module.scss';

const AccountModal = () => {
  const history = useHistory();
  const view = useQueryParam('u');

  const {
    assets: { banner },
  } = useContext(ConfigContext);

  const closeHandler = () => {
    removeQueryParam(history, 'u');
  }

  return (
    <Dialog open={!!view} onClose={closeHandler}>
      <div className={styles.banner}>{banner ? <img src={banner} alt="" /> : null}</div>
      <h2 className={styles.title}>Login!</h2>
      <form>form</form>
      <Button label="Sign in" variant="contained" color="primary" fullWidth />
    </Dialog>
  );
};

export default AccountModal;
