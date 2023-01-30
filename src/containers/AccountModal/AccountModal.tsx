import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import shallow from 'zustand/shallow';

import styles from './AccountModal.module.scss';
import Login from './forms/Login';
import Registration from './forms/Registration';
import PersonalDetails from './forms/PersonalDetails';
import ChooseOffer from './forms/ChooseOffer';
import Checkout from './forms/Checkout';
import ResetPassword from './forms/ResetPassword';
import CancelSubscription from './forms/CancelSubscription';
import RenewSubscription from './forms/RenewSubscription';
import EditPassword from './forms/EditPassword';

import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import useQueryParam from '#src/hooks/useQueryParam';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import Welcome from '#components/Welcome/Welcome';
import PaymentFailed from '#components/PaymentFailed/PaymentFailed';
import Dialog from '#components/Dialog/Dialog';
import { addQueryParam, removeQueryParam } from '#src/utils/location';
import WaitingForPayment from '#src/components/WaitingForPayment/WaitingForPayment';

const PUBLIC_VIEWS = ['login', 'create-account', 'forgot-password', 'reset-password', 'send-confirmation', 'edit-password'];

const AccountModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewParam = useQueryParam('u');
  const [view, setView] = useState(viewParam);
  const message = useQueryParam('message');
  const { loading, auth } = useAccountStore(({ loading, auth }) => ({ loading, auth }), shallow);
  const config = useConfigStore((s) => s.config);
  const {
    assets: { banner },
    siteName,
  } = config;
  const isPublicView = viewParam && PUBLIC_VIEWS.includes(viewParam);

  useEffect(() => {
    // make sure the last view is rendered even when the modal gets closed
    if (viewParam) setView(viewParam);
  }, [viewParam]);

  useEffect(() => {
    if (!!viewParam && !loading && !auth && !isPublicView) {
      navigate(addQueryParam(location, 'u', 'login'));
    }
  }, [viewParam, navigate, location, loading, auth, isPublicView]);

  const closeHandler = () => {
    navigate(removeQueryParam(location, 'u'));
  };

  const renderForm = () => {
    if (!auth && loading && !isPublicView) {
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
      case 'personal-details':
        return <PersonalDetails />;
      case 'choose-offer':
        return <ChooseOffer />;
      case 'checkout':
        return <Checkout />;
      case 'payment-error':
        return <PaymentFailed type="error" message={message} onCloseButtonClick={closeHandler} />;
      case 'payment-cancelled':
        return <PaymentFailed type="cancelled" onCloseButtonClick={closeHandler} />;
      case 'welcome':
        return <Welcome onCloseButtonClick={closeHandler} onCountdownCompleted={closeHandler} siteName={siteName} />;
      case 'reset-password':
        return <ResetPassword type="reset" />;
      case 'forgot-password':
        return <ResetPassword type="forgot" />;
      case 'send-confirmation':
        return <ResetPassword type="confirmation" />;
      case 'edit-password':
        return <EditPassword />;
      case 'unsubscribe':
        return <CancelSubscription />;
      case 'renew-subscription':
        return <RenewSubscription />;
      case 'waiting-for-payment':
        return <WaitingForPayment />;
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
