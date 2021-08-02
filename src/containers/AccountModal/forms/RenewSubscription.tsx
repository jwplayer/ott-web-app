import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import { removeQueryParam } from '../../../utils/history';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import { AccountStore, updateSubscription } from '../../../stores/AccountStore';
import RenewSubscriptionForm from '../../../components/RenewSubscriptionForm/RenewSubscriptionForm';
import SubscriptionRenewed from '../../../components/SubscriptionRenewed/SubscriptionRenewed';

const RenewSubscription = () => {
  const { t } = useTranslation('account');
  const history = useHistory();
  const { subscription, user } = AccountStore.useState((s) => s);
  const [renewed, setRenewed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renewSubscriptionConfirmHandler = async () => {
    setLoading(true);
    setError(null);

    try {
      await updateSubscription('active');
      setRenewed(true);
    } catch (error: unknown) {
      setError(t('renew_subscription.unknown_error_occurred'));
    }

    setLoading(false);
  };

  const closeHandler = () => {
    history.replace(removeQueryParam(history, 'u'));
  };

  if (!subscription || !user) return null;

  return (
    <React.Fragment>
      {renewed ? (
        <SubscriptionRenewed onClose={closeHandler} subscription={subscription} customer={user} />
      ) : (
        <RenewSubscriptionForm subscription={subscription} customer={user} error={error} onConfirm={renewSubscriptionConfirmHandler} onClose={closeHandler} />
      )}
      {loading ? <LoadingOverlay inline /> : null}
    </React.Fragment>
  );
};
export default RenewSubscription;
