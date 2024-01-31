import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { modalURLFromLocation, createURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';
import useQueryParam from '@jwp/ott-ui-react/src/hooks/useQueryParam';

import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import Welcome from '../../components/Welcome/Welcome';
import PaymentFailed from '../../components/PaymentFailed/PaymentFailed';
import Dialog from '../../components/Dialog/Dialog';
import DeleteAccountModal from '../../components/DeleteAccountModal/DeleteAccountModal';
import FinalizePayment from '../../components/FinalizePayment/FinalizePayment';
import WaitingForPayment from '../../components/WaitingForPayment/WaitingForPayment';
import UpgradeSubscription from '../../components/UpgradeSubscription/UpgradeSubscription';
import DeleteAccountPasswordWarning from '../../components/DeleteAccountPasswordWarning/DeleteAccountPasswordWarning';
import UpdatePaymentMethod from '../UpdatePaymentMethod/UpdatePaymentMethod';

import EditCardDetails from './forms/EditCardDetails';
import EditPassword from './forms/EditPassword';
import RenewSubscription from './forms/RenewSubscription';
import CancelSubscription from './forms/CancelSubscription';
import ResetPassword from './forms/ResetPassword';
import Checkout from './forms/Checkout';
import ChooseOffer from './forms/ChooseOffer';
import PersonalDetails from './forms/PersonalDetails';
import Registration from './forms/Registration';
import Login from './forms/Login';
import styles from './AccountModal.module.scss';

// @todo: connect with route typings
const PUBLIC_VIEWS = ['login', 'create-account', 'forgot-password', 'reset-password', 'send-confirmation', 'edit-password', 'simultaneous-logins'];

export type AccountModals = {
  login: 'login';
  'create-account': 'create-account';
  'personal-details': 'personal-details';
  'choose-offer': 'choose-offer';
  'edit-card': 'edit-card';
  'upgrade-subscription': 'upgrade-subscription';
  'upgrade-subscription-error': 'upgrade-subscription-error';
  'upgrade-subscription-success': 'upgrade-subscription-success';
  'upgrade-subscription-pending': 'upgrade-subscription-pending';
  checkout: 'checkout';
  'payment-error': 'payment-error';
  'payment-cancelled': 'payment-cancelled';
  welcome: 'welcome';
  'reset-password': 'reset-password';
  'forgot-password': 'forgot-password';
  'add-password': 'add-password';
  'delete-account': 'delete-account';
  'delete-account-confirmation': 'delete-account-confirmation';
  'warning-account-deletion': 'warning-account-deletion';
  'send-confirmation': 'send-confirmation';
  'edit-password': 'edit-password';
  unsubscribe: 'unsubscribe';
  'renew-subscription': 'renew-subscription';
  'payment-method': 'payment-method';
  'payment-method-success': 'payment-method-success';
  'waiting-for-payment': 'waiting-for-payment';
  'finalize-payment': 'finalize-payment';
};

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
    navigate(modalURLFromLocation(location, 'login'));
  });

  useEffect(() => {
    // make sure the last view is rendered even when the modal gets closed
    if (viewParam) setView(viewParam);
  }, [viewParam]);

  useEffect(() => {
    if (!!viewParam && !loading && !user && !isPublicView) {
      toLogin();
    }
  }, [viewParam, loading, isPublicView, user, toLogin]);

  const closeHandler = useEventCallback(() => {
    navigate(createURLFromLocation(location, { u: null, message: null }));
  });

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
        return <Login messageKey={message} />;
      case 'create-account':
        return <Registration />;
      case 'personal-details':
        return <PersonalDetails />;
      case 'choose-offer':
        return <ChooseOffer />;
      case 'edit-card':
        return <EditCardDetails />;
      case 'upgrade-subscription':
        return <ChooseOffer />;
      case 'upgrade-subscription-error':
        return <UpgradeSubscription type="error" onCloseButtonClick={closeHandler} />;
      case 'upgrade-subscription-success':
        return <UpgradeSubscription type="success" onCloseButtonClick={closeHandler} />;
      case 'upgrade-subscription-pending':
        return <UpgradeSubscription type="pending" onCloseButtonClick={closeHandler} />;
      case 'checkout':
        return <Checkout />;
      case 'payment-error':
        return <PaymentFailed type="error" message={message} onCloseButtonClick={closeHandler} />;
      case 'payment-cancelled':
        return <PaymentFailed type="cancelled" message={message} onCloseButtonClick={closeHandler} />;
      case 'welcome':
        return <Welcome onCloseButtonClick={closeHandler} onCountdownCompleted={closeHandler} siteName={siteName} />;
      case 'reset-password':
        return <ResetPassword type="reset" />;
      case 'forgot-password':
        return <ResetPassword type="forgot" />;
      case 'add-password':
        return <EditPassword type="add" />;
      case 'delete-account':
      case 'delete-account-confirmation':
        return <DeleteAccountModal />;
      case 'warning-account-deletion':
        return <DeleteAccountPasswordWarning />;
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

  const shouldShowBanner = !['delete-account', 'delete-account-confirmation', 'edit-card', 'warning-account-deletion'].includes(view ?? '');
  const dialogSize = ['delete-account-confirmation'].includes(view ?? '') ? 'large' : 'small';

  return (
    <Dialog size={dialogSize} open={!!viewParam} onClose={closeHandler} role="dialog">
      {shouldShowBanner && banner && <div className={styles.banner}>{<img src={banner} alt="" />}</div>}
      {renderForm()}
    </Dialog>
  );
};

export default AccountModal;
