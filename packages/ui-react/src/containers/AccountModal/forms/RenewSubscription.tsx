import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';

import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import RenewSubscriptionForm from '../../../components/RenewSubscriptionForm/RenewSubscriptionForm';
import SubscriptionRenewed from '../../../components/SubscriptionRenewed/SubscriptionRenewed';
import { useAriaAnnouncer } from '../../AnnouncementProvider/AnnoucementProvider';

const RenewSubscription = () => {
  const accountController = getModule(AccountController);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');
  const announce = useAriaAnnouncer();
  const { subscription, user } = useAccountStore(({ subscription, user }) => ({ subscription, user }), shallow);
  const [renewed, setRenewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renewSubscriptionConfirmHandler = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await accountController.updateSubscription('active');
      announce(t('renew_subscription.success'), 'success');
      setRenewed(true);
    } catch (error: unknown) {
      setError(t('renew_subscription.unknown_error_occurred'));
    }

    setSubmitting(false);
  };

  const closeHandler = () => {
    navigate(modalURLFromLocation(location, null), { replace: true });
  };

  if (!subscription || !user) return null;

  return (
    <React.Fragment>
      {renewed ? (
        <SubscriptionRenewed onClose={closeHandler} subscription={subscription} customer={user} />
      ) : (
        <RenewSubscriptionForm
          subscription={subscription}
          customer={user}
          error={error}
          onConfirm={renewSubscriptionConfirmHandler}
          onClose={closeHandler}
          submitting={submitting}
        />
      )}
      {submitting ? <LoadingOverlay inline /> : null}
    </React.Fragment>
  );
};
export default RenewSubscription;
