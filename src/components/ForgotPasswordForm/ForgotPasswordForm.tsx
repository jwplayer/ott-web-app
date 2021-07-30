import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, Link } from 'react-router-dom';

import Button from '../Button/Button';
import TextField from '../TextField/TextField';
import type { FormErrors } from '../../../types/form';
import type { EmailField } from '../../../types/account';
import FormFeedback from '../FormFeedback/FormFeedback';
import { addQueryParam } from '../../utils/history';

import styles from './ForgotPasswordForm.module.scss';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  errors: FormErrors<EmailField>;
  value: EmailField;
  submitting: boolean;
  type: string;
};

const ForgotPasswordForm: React.FC<Props> = ({ onSubmit, onChange, value, errors, submitting, type }: Props) => {
  const { t } = useTranslation('account');
  const history = useHistory();

  const onBackToLogin = () => {
    history.push(addQueryParam(history, 'u', 'login'));
  };

  if (type === 'confirmation') {
    return (
      <div className={styles.forgotPasswordForm}>
        <h2 className={styles.title}>{t('reset.link_sent')}</h2>
        <p className={styles.text}>{t('reset.link_sent_text', { email: value.email })}</p>
        <Button onClick={onBackToLogin} className={styles.button} fullWidth color="primary" disabled={submitting} label={t('reset.back_login')} />
        <span className={styles.notSure}>{t('reset.not_sure')}</span>
        <Link className={styles.link} to={addQueryParam(history, 'u', 'forgot-password')}>
          {t('reset.try_again')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} data-testid="forgot-password-form" noValidate className={styles.forgotPasswordForm}>
      <h2 className={styles.title}>{t('reset.forgot_password')}</h2>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
      <p className={styles.text}>{t('reset.forgot_text')}</p>
      <TextField
        value={value.email}
        onChange={onChange}
        label={t('reset.email')}
        placeholder={t('reset.email')}
        error={!!errors.email || !!errors.form}
        helperText={errors.email}
        required
        name="email"
        type="email"
      />
      <Button type="submit" className={styles.button} fullWidth color="primary" disabled={submitting} label={t('reset.email_me')} />
    </form>
  );
};

export default ForgotPasswordForm;
