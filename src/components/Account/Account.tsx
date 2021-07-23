import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Consent, Customer, CustomerConsent, UpdateCustomerPayload } from 'types/account';
import type { CustomerFormValues, FormErrors, GenericFormValues } from 'types/form';

import { formatConsentsFromValues, formatConsentValues } from '../../utils/collection';
import Visibility from '../../icons/Visibility';
import VisibilityOff from '../../icons/VisibilityOff';
import useToggle from '../../hooks/useToggle';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import Form from '../Form/Form';
import IconButton from '../IconButton/IconButton';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import TextField from '../TextField/TextField';
import MarkdownComponent from '../MarkdownComponent/MarkdownComponent';

import styles from './Account.module.scss';

type Props = {
  customer: Customer;
  errors?: FormErrors<UpdateCustomerPayload>;
  isLoading: boolean;
  consentsLoading: boolean;
  publisherConsents?: Consent[];
  customerConsents?: CustomerConsent[];
  onUpdateEmailSubmit: (data: CustomerFormValues) => void;
  onUpdateInfoSubmit: (data: CustomerFormValues) => void;
  onDeleteAccountClick: () => void;
  onUpdateConsentsSubmit: (consents: CustomerConsent[]) => void;
  onReset?: () => void;
  panelClassName?: string;
  panelHeaderClassName?: string;
};

type Editing = 'none' | 'account' | 'password' | 'info' | 'consents';

const Account = ({
  customer,
  errors,
  isLoading,
  consentsLoading,
  publisherConsents,
  customerConsents,
  panelClassName,
  panelHeaderClassName,
  onUpdateEmailSubmit,
  onUpdateInfoSubmit,
  onDeleteAccountClick,
  onUpdateConsentsSubmit,
  onReset,
}: Props): JSX.Element => {
  const { t } = useTranslation('user');
  const [editing, setEditing] = useState<Editing>('none');
  const [viewPassword, toggleViewPassword] = useToggle();
  const consentValues = useMemo(() => formatConsentValues(publisherConsents, customerConsents), [publisherConsents, customerConsents]);
  const initialValues = useMemo(() => ({ ...customer, consents: consentValues }), [customer, consentValues]);

  const handleSubmit = (values: GenericFormValues) => {
    switch (editing) {
      case 'account':
        return onUpdateEmailSubmit(values as CustomerFormValues);
      case 'info':
        return onUpdateInfoSubmit(values as CustomerFormValues);
      case 'consents':
        return onUpdateConsentsSubmit(formatConsentsFromValues(publisherConsents, values));
        break;
      default:
        return;
    }
  };
  const onCancelClick = (formResetHandler?: () => void): void => {
    formResetHandler && formResetHandler();
    setEditing('none');
    onReset && onReset();
  };

  useEffect(() => {
    !isLoading && setEditing('none');
  }, [isLoading]);

  return (
    <Form initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, handleReset, handleSubmit, hasChanged }) => (
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
                  value={values.email as string}
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
                  value={values.confirmationPassword as string}
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
                    <Button
                      label={t('account.save')}
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isLoading || !values.email || !values.confirmationPassword}
                    />
                    <Button label={t('account.cancel')} type="reset" variant="text" onClick={() => onCancelClick(handleReset)} />
                    <Button label={t('account.delete_account')} type="button" onClick={onDeleteAccountClick} />
                  </>
                ) : (
                  <Button label={t('account.edit_account')} type="button" onClick={() => setEditing('account')} />
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
              <Button label={t('account.edit_password')} type="button" onClick={() => setEditing('password')} />
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
                  value={values.firstName as string}
                  onChange={handleChange}
                  error={!!errors?.firstName}
                  helperText={errors?.firstName}
                  disabled={isLoading}
                  editing={editing === 'info'}
                />
                <TextField
                  name="lastName"
                  label={t('account.lastname')}
                  value={values.lastName as string}
                  onChange={handleChange}
                  error={!!errors?.lastName}
                  helperText={errors?.lastName}
                  disabled={isLoading}
                  editing={editing === 'info'}
                />
                <div className={styles.controls}>
                  {editing === 'info' ? (
                    <>
                      <Button label={t('account.save')} type="submit" disabled={!hasChanged} onClick={handleSubmit} />
                      <Button type="reset" variant="text" label={t('account.cancel')} onClick={() => setEditing('none')} />
                    </>
                  ) : (
                    <Button type="button" label={t('account.edit_information')} onClick={() => setEditing('info')} />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={panelClassName}>
            <div className={panelHeaderClassName}>
              <h3>{'Terms & tracking'}</h3>
            </div>
            {consentsLoading ? (
              <Spinner size="small" />
            ) : publisherConsents ? (
              <div>
                {publisherConsents.map((consent, index) => (
                  <label className={styles.checkbox} key={index}>
                    <input
                      type="checkbox"
                      name={consent.name}
                      checked={(values.consents?.[consent.name] as boolean) || false}
                      value={values.consents?.[consent.name] || ''}
                      onChange={(event) => (handleChange ? handleChange(event, { nestInto: 'consents' }) : null)}
                      disabled={consent.required}
                    />
                    <span className={styles.checkmark} />
                    <MarkdownComponent markdownString={consent.label} className={styles.checkLabel} />
                  </label>
                ))}
                <Button
                  className={styles.submitConsents}
                  type="button"
                  label={t('account.update_consents')}
                  onClick={() => {
                    setEditing('consents');
                    handleSubmit && handleSubmit();
                  }}
                />
              </div>
            ) : null}
          </div>
        </>
      )}
    </Form>
  );
};

export default Account;
