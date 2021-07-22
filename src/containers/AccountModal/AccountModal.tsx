import React, { useContext } from 'react';
import { useHistory } from 'react-router';

import { ConfigContext } from '../../providers/ConfigProvider';
import Dialog from '../../components/Dialog/Dialog';
import useQueryParam from '../../hooks/useQueryParam';
import { removeQueryParam } from '../../utils/history';

import styles from './AccountModal.module.scss';
import Login from './forms/Login';
import ChooseOffer from './forms/ChooseOffer';

const AccountModal = () => {
  const history = useHistory();
  const view = useQueryParam('u');

  const {
    assets: { banner },
  } = useContext(ConfigContext);

  const closeHandler = () => {
    history.push(removeQueryParam(history, 'u'));
  };

  return (
    <Dialog open={!!view} onClose={closeHandler}>
      <div className={styles.banner}>{banner ? <img src={banner} alt="" /> : null}</div>
      {view === 'login' ? <Login /> : null}
      {view === 'choose-offer' ? <ChooseOffer /> : null}
    </Dialog>
  );
};

export default AccountModal;
