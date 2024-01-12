import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { modalURL } from '@jwp/ott-ui-react/src/utils/location';

import EditCardDetailsForm from '../../../components/EditForm/EditCardDetailsForm';
import EditCardPaymentForm from '../../../components/EditCardPaymentForm/EditCardPaymentForm';

const EditCardDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [updatingCardDetails, setUpdatingCardDetails] = useState(false);

  const closeHandler = () => {
    navigate(modalURL(location, null), { replace: false });
  };

  const renderPaymentMethod = () => {
    return <EditCardPaymentForm onCancel={closeHandler} setUpdatingCardDetails={setUpdatingCardDetails} />;
  };

  return <EditCardDetailsForm onCancel={closeHandler} renderPaymentMethod={renderPaymentMethod} submitting={updatingCardDetails} />;
};

export default EditCardDetails;
