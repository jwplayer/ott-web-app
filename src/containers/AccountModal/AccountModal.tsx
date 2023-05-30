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
import FinalizePayment from '#components/FinalizePayment/FinalizePayment';
import WaitingForPayment from '#components/WaitingForPayment/WaitingForPayment';
import UpdatePaymentMethod from '#src/containers/UpdatePaymentMethod/UpdatePaymentMethod';
import useEventCallback from '#src/hooks/useEventCallback';

const PUBLIC_VIEWS = ['login', 'create-account', 'forgot-password', 'reset-password', 'send-confirmation', 'edit-password'];

const AccountModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewParam = useQueryParam('u');
  const [view, setView] = useState(viewParam);
  const message = useQueryParam('message');
  const { loading, user } = useAccountStore(({ loading, user }) => ({ loading, user }), shallow);
  const config = useConfigStore((s) => s.config);
  const {
    assets: { banner },
    siteName,
  } = config;
  const isPublicView = viewParam && PUBLIC_VIEWS.includes(viewParam);

  const toLogin = useEventCallback(() => {
    navigate(addQueryParam(location, 'u', 'login'));
  });

  const closeHandler = useEventCallback(() => {
    navigate(removeQueryParam(location, 'u'));
  });

  useEffect(() => {
    // make sure the last view is rendered even when the modal gets closed
    if (viewParam) setView(viewParam);
  }, [viewParam]);

  useEffect(() => {
    if (!!viewParam && !loading && !user && !isPublicView) {
      toLogin();
    }
  }, [viewParam, loading, user, isPublicView, toLogin]);

  const renderForm = () => {
    if (!user && loading && !isPublicView) {
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
      case 'upgrade-subscription':
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
      case 'payment-method':
      case 'payment-method-success':
        return <UpdatePaymentMethod onCloseButtonClick={closeHandler} />;
      case 'waiting-for-payment':
        return <WaitingForPayment />;
      case 'finalize-payment':
        return <FinalizePayment />;
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
