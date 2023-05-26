import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import EditCardDetailsForm from '#components/EditForm/EditCardDetailsForm';
import { removeQueryParam } from '#src/utils/location';
import EditCardPaymentForm from '#src/components/EditCardPaymentForm/EditCardPaymentForm';

const EditCardDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [updatingOrder] = useState(false);

  const closeHandler = () => {
    navigate(removeQueryParam(location, 'u'), { replace: true });
  };

  const renderPaymentMethod = () => {
    return <EditCardPaymentForm onCancel={closeHandler} />;
  };

  return <EditCardDetailsForm onCancel={closeHandler} renderPaymentMethod={renderPaymentMethod} submitting={updatingOrder} />;
};

export default EditCardDetails;
