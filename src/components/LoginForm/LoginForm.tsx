import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';

import useToggle from '../../hooks/useToggle';
import { addQueryParam } from '../../utils/history';
import TextField from '../TextField/TextField';
import Button from '../Button/Button';
import Link from '../Link/Link';
import IconButton from '../IconButton/IconButton';
import Visibility from '../../icons/Visibility';
import VisibilityOff from '../../icons/VisibilityOff';

import styles from './LoginForm.module.scss';

export type LoginFormData = {
  email: string;
  password: string;
};

type Props = {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>, formData: LoginFormData) => void;
};

const LoginForm: React.FC<Props> = ({ onSubmit }: Props) => {
  const [viewPassword, toggleViewPassword] = useToggle();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const { t } = useTranslation('account');
  const history = useHistory();

  const formSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (onSubmit) {
      onSubmit(event, formData);
    }
  };

  const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((data) => ({ ...data, [event.target.name]: event.target.value }));
  };

  return (
    <form onSubmit={formSubmitHandler} noValidate>
      <h2 className={styles.title}>{t('login.sign_in')}</h2>
      <TextField
        value={formData.email}
        onChange={inputChangeHandler}
        label={t('login.email')}
        placeholder={t('login.email')}
        name="email"
        type="email"
      />
      <TextField
        value={formData.password}
        onChange={inputChangeHandler}
        label={t('login.password')}
        placeholder={t('login.password')}
        name="password"
        type={viewPassword ? 'text' : 'password'}
        rightControl={
          <IconButton aria-label={viewPassword ? t('login.hide_password') : t('login.view_password')} onClick={() => toggleViewPassword()}>
            {viewPassword ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        }
      />
      <Link className={styles.link} to={addQueryParam(history, 'u', 'forgot-password')}>
        {t('login.forgot_password')}
      </Link>
      <Button label={t('login.sign_in')} variant="contained" color="primary" size="large" fullWidth />
    </form>
  );
};

export default LoginForm;
