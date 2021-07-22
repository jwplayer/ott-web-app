import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Customer, UpdateCustomerPayload } from 'types/account';

import Visibility from '../../icons/Visibility';
import VisibilityOff from '../../icons/VisibilityOff';
import type { FormErrors } from '../../hooks/useForm';
import useToggle from '../../hooks/useToggle';
import Button from '../../components/Button/Button';
import Form from '../Form/Form';
import IconButton from '../IconButton/IconButton';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import TextField from '../TextField/TextField';

import styles from './Account.module.scss';

type Props = {
  customer: Customer;
  errors: FormErrors<UpdateCustomerPayload>;
  isLoading: boolean;
  onUpdateEmailSubmit: (data: Record<string, string>) => void;
  onUpdateInfoSubmit: (data: Record<string, string>) => void;
  onDeleteAccountClick: () => void;
  onReset: () => void;
  panelClassName?: string;
  panelHeaderClassName?: string;
};

type Editing = 'none' | 'account' | 'password' | 'info';
type FormValues = Record<string, string>;

const Account = ({
  customer,
  errors,
  isLoading,
  panelClassName,
  panelHeaderClassName,
  onUpdateEmailSubmit,
  onUpdateInfoSubmit,
  onDeleteAccountClick,
  onReset,
}: Props): JSX.Element => {
  const { t } = useTranslation('user');
  const [editing, setEditing] = useState<Editing>('none');
  const [viewPassword, toggleViewPassword] = useToggle();

  const handleSubmit = (values: FormValues) => {
    switch (editing) {
      case 'account':
        return onUpdateEmailSubmit(values);
      case 'info':
        return onUpdateInfoSubmit(values);
      default:
        return;
    }
  };
  const onCancelClick = (formResetHandler?: () => void): void => {
    formResetHandler && formResetHandler();
    setEditing('none');
    onReset();
  };

  useEffect(() => {
    !isLoading && setEditing('none');
  }, [isLoading]);

  return (
    <Form initialValues={customer} onSubmit={handleSubmit} editing={editing !== 'none'}>
      {({ values, handleChange, handleSubmit, handleReset }) => (
        <>
          {isLoading && <LoadingOverlay transparentBackground />}
          <div className={panelClassName}>
            <div className={panelHeaderClassName}>
              <h3>{t('account.email')}</h3>
            </div>
            <div className={styles.flexBox}>
              {editing === 'account' ? (
                <TextField
                  name="email"
                  label={t('account.email')}
                  value={values.email}
                  onChange={handleChange}
                  error={!!errors?.email}
                  helperText={errors?.email}
                  disabled={isLoading}
                />
              ) : (
                <p>{customer.email}</p>
              )}
              {editing === 'account' && (
                <TextField
                  name="confirmationPassword"
                  label={t('account.confirm_password')}
                  value={values.confirmationPassword}
                  onChange={handleChange}
                  error={!!errors?.confirmationPassword}
                  helperText={errors?.confirmationPassword}
                  type={viewPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  rightControl={
                    <IconButton
                      aria-label={viewPassword ? t('account.hide_password') : t('account.view_password')}
                      onClick={() => toggleViewPassword()}
                    >
                      {viewPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  }
                />
              )}
              <div className={styles.controls}>
                {editing === 'account' ? (
                  <>
                    <Button label={t('account.save')} onClick={handleSubmit} disabled={isLoading || !values.email || !values.confirmationPassword} />
                    <Button variant="text" label={t('account.cancel')} onClick={() => onCancelClick(handleReset)} />
                    <Button label={t('account.delete_account')} onClick={onDeleteAccountClick} />
                  </>
                ) : (
                  <Button label={t('account.edit_account')} onClick={() => setEditing('account')} />
                )}
              </div>
            </div>
          </div>
          <div className={panelClassName}>
            <div className={panelHeaderClassName}>
              <h3>{t('account.security')}</h3>
            </div>
            <div>
              <strong>{t('account.password')}</strong>
              <p>****************</p>
              <Button label={t('account.edit_password')} onClick={() => setEditing('password')} />
            </div>
          </div>
          <div className={panelClassName}>
            <div className={panelHeaderClassName}>
              <h3>{t('account.about_you')}</h3>
            </div>
            <div>
              <div className={styles.flexBox}>
                <TextField
                  name="firstName"
                  label={t('account.firstname')}
                  value={values.firstName}
                  onChange={handleChange}
                  error={!!errors?.firstName}
                  helperText={errors?.firstName}
                  disabled={isLoading}
                  editing={editing === 'info'}
                />
                <TextField
                  name="lastName"
                  label={t('account.lastname')}
                  value={values.lastName}
                  onChange={handleChange}
                  error={!!errors?.lastName}
                  helperText={errors?.lastName}
                  disabled={isLoading}
                  editing={editing === 'info'}
                />
                <div className={styles.controls}>
                  {editing === 'info' ? (
                    <>
                      <Button label={t('account.save')} onClick={handleSubmit} />
                      <Button variant="text" label={t('account.cancel')} onClick={() => setEditing('none')} />
                    </>
                  ) : (
                    <Button label={t('account.edit_information')} onClick={() => setEditing('info')} />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={panelClassName}>
            <div className={panelHeaderClassName}>
              <h3>{'Terms & tracking'}</h3>
            </div>
            <div>
              <label className={styles.checkbox}>
                <input type="checkbox" id="terms1" name="terms 1" value="Bike" />
                <p>
                  I accept the <strong>Terms of Conditions</strong> of {'<platform name>'}
                </p>
              </label>
              <Button label={t('account.update_consents')} />
            </div>
          </div>
        </>
      )}
    </Form>
  );
};

export default Account;
