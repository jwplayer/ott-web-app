import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Consent, Customer, CustomerConsent, UpdateCustomerPayload } from 'types/account';
import type { CustomerFormValues, FormErrors, GenericFormValues } from 'types/form';
import { useHistory } from 'react-router-dom';

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
import Checkbox from '../Checkbox/Checkbox';
import { addQueryParam } from '../../utils/history';

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
  const history = useHistory();
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
      default:
        return;
    }
  };
  const onCancelClick = (formResetHandler?: () => void): void => {
    formResetHandler && formResetHandler();
    setEditing('none');
    onReset && onReset();
  };

  const editPasswordClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'reset-password'));
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
              <TextField
                name="email"
                label={t('account.email')}
                value={values.email as string}
                onChange={handleChange}
                error={!!errors?.email}
                helperText={errors?.email}
                disabled={isLoading}
                editing={editing === 'account'}
              />
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
              <Button label={t('account.edit_password')} type="button" onClick={() => (customer ? editPasswordClickHandler() : null)} />
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
              <h3>{t('account.terms_and_tracking')}</h3>
            </div>
            {consentsLoading ? (
              <Spinner size="small" />
            ) : publisherConsents ? (
              <div onClick={() => setEditing('consents')}>
                {publisherConsents.map((consent, index) => (
                  <Checkbox
                    key={index}
                    name={consent.name}
                    value={values.consents?.[consent.name] || ''}
                    checked={(values.consents?.[consent.name] as boolean) || false}
                    onChange={(event) => (handleChange ? handleChange(event, { nestInto: 'consents' }) : null)}
                    disabled={consent.required}
                    label={consent.label}
                  />
                ))}
                <Button
                  className={styles.submitConsents}
                  type="button"
                  label={t('account.update_consents')}
                  disabled={!hasChanged}
                  onClick={handleSubmit}
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
