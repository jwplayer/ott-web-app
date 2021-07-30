import React from 'react';
import { useHistory } from 'react-router-dom';

import { resetPassword } from '../../../stores/AccountStore';
import { removeQueryParam } from '../../../utils/history';
import ResetPasswordForm from '../../../components/ResetPasswordForm/ResetPasswordForm';

const ResetPassword: React.FC = () => {
  const history = useHistory();

  const onCancelClickHandler = () => {
    history.push(removeQueryParam(history, 'u'));
  };

  const onResetClickHandler = async () => {
    const resetUrl = `${window.location.origin}/u/my-account?u=edit-password`;

    try {
      const response = await resetPassword(resetUrl);
      if (response.errors.length > 0) throw new Error(response.errors[0]);

      history.push('/u/logout');
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('invalid param email')) {
          console.info(error.message);
        }
      }
    }
  };

  return <ResetPasswordForm onCancel={onCancelClickHandler} onReset={onResetClickHandler} />;
};

export default ResetPassword;
