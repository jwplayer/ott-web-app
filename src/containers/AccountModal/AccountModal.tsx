import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import { ConfigContext } from '../../providers/ConfigProvider';
import Dialog from '../../components/Dialog/Dialog';
import useQueryParam from '../../hooks/useQueryParam';
import { removeQueryParam } from '../../utils/history';
import PaymentFailed from '../../components/PaymentFailed/PaymentFailed';
import Welcome from '../../components/Welcome/Welcome';

import styles from './AccountModal.module.scss';
import Login from './forms/Login';
import ChooseOffer from './forms/ChooseOffer';
import Checkout from './forms/Checkout';

const AccountModal = () => {
  const history = useHistory();
  const viewParam = useQueryParam('u');
  const [view, setView] = useState(viewParam);
  const message = useQueryParam('message');

  useEffect(() => {
    // make sure the last view is rendered even when the modal gets closed
    if (viewParam) setView(viewParam);
  }, [viewParam]);

  const {
    assets: { banner },
  } = useContext(ConfigContext);

  const closeHandler = () => {
    history.push(removeQueryParam(history, 'u'));
  };

  return (
    <Dialog open={!!viewParam} onClose={closeHandler}>
      <div className={styles.banner}>{banner ? <img src={banner} alt="" /> : null}</div>
      {view === 'login' ? <Login /> : null}
      {view === 'choose-offer' ? <ChooseOffer /> : null}
      {view === 'checkout' ? <Checkout /> : null}
      {view === 'paypal-error' ? <PaymentFailed type="error" message={message} onCloseButtonClick={closeHandler} /> : null}
      {view === 'paypal-cancelled' ? <PaymentFailed type="cancelled" onCloseButtonClick={closeHandler} /> : null}
      {view === 'welcome' ? <Welcome onCloseButtonClick={closeHandler} onCountdownCompleted={closeHandler} /> : null}
    </Dialog>
  );
};

export default AccountModal;
