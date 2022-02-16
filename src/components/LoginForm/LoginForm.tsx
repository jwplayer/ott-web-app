import React from 'react';
import type { LoginFormData } from 'types/account';
import type { FormErrors } from 'types/form';

import Button from '../Button/Button';
import { getLoginUrl } from '../../services/sso.service';

import styles from './LoginForm.module.scss';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  errors: FormErrors<LoginFormData>;
  values: LoginFormData;
  submitting: boolean;
  siteName?: string;
};

const LoginForm: React.FC<Props> = () => {
  return (
    <div className={styles.wrapper}>
      <span>Your session has expired, please login again.</span>
      <Button color="primary" label={'Sign in Again'} to={getLoginUrl()} />
    </div>
  );
};

export default LoginForm;
