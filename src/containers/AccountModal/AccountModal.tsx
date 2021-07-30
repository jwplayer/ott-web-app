import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import { ConfigContext } from '../../providers/ConfigProvider';
import Dialog from '../../components/Dialog/Dialog';
import useQueryParam from '../../hooks/useQueryParam';
import { addQueryParam, removeQueryParam } from '../../utils/history';
import PaymentFailed from '../../components/PaymentFailed/PaymentFailed';
import Welcome from '../../components/Welcome/Welcome';
import { AccountStore } from '../../stores/AccountStore';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';

import styles from './AccountModal.module.scss';
import Login from './forms/Login';
import Registration from './forms/Registration';
import PersonalDetails from './forms/PersonalDetails';
import ChooseOffer from './forms/ChooseOffer';
import Checkout from './forms/Checkout';
import ResetPassword from './forms/ResetPassword';

const PUBLIC_VIEWS = ['login', 'create-account', 'forgot-password', 'reset-password'];

const AccountModal = () => {
  const history = useHistory();
  const viewParam = useQueryParam('u');
  const [view, setView] = useState(viewParam);
  const message = useQueryParam('message');
  const { loading, auth } = AccountStore.useState((s) => s);

  useEffect(() => {
    // make sure the last view is rendered even when the modal gets closed
    if (viewParam) setView(viewParam);
  }, [viewParam]);

  useEffect(() => {
    if (!!viewParam && !loading && !auth && !PUBLIC_VIEWS.includes(viewParam)) {
      history.push(addQueryParam(history, 'u', 'login'));
    }
  }, [viewParam, history, loading, auth]);

  const {
    assets: { banner },
  } = useContext(ConfigContext);

  const closeHandler = () => {
    history.push(removeQueryParam(history, 'u'));
  };

  const renderForm = () => {
    if (!auth && loading) {
      return (
        <div style={{ height: 300 }}>
          <LoadingOverlay inline />
        </div>
      );
    }

    switch (view) {
      case 'login':
        return <Login />;
      case 'create-account':
        return <Registration />;
      case 'reset-password':
        return <ResetPassword />;
      case 'personal-details':
        return <PersonalDetails />;
      case 'choose-offer':
        return <ChooseOffer />;
      case 'checkout':
        return <Checkout />;
      case 'paypal-error':
        return <PaymentFailed type="error" message={message} onCloseButtonClick={closeHandler} />;
      case 'paypal-cancelled':
        return <PaymentFailed type="cancelled" onCloseButtonClick={closeHandler} />;
      case 'welcome':
        return <Welcome onCloseButtonClick={closeHandler} onCountdownCompleted={closeHandler} />;
    }
  };

  return (
    <Dialog open={!!viewParam} onClose={closeHandler}>
      <div className={styles.banner}>{banner ? <img src={banner} alt="" /> : null}</div>
      {renderForm()}
    </Dialog>
  );
};

export default AccountModal;
