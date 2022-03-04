import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { GenericFormValues, CustomerFormErrors } from 'types/form';
import { useHistory } from 'react-router-dom';

import { formatConsentsFromValues, formatConsentValues } from '../../utils/collection';
import Visibility from '../../icons/Visibility';
import VisibilityOff from '../../icons/VisibilityOff';
import useToggle from '../../hooks/useToggle';
import Button from '../../components/Button/Button';
import Form from '../Form/Form';
import IconButton from '../IconButton/IconButton';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import TextField from '../TextField/TextField';
import Checkbox from '../Checkbox/Checkbox';
import { addQueryParam } from '../../utils/history';
import { AccountStore, updateConsents, updateUser } from '../../stores/AccountStore';

import styles from './Account.module.scss';

type Props = {
  panelClassName?: string;
  panelHeaderClassName?: string;
};

type Editing = 'none' | 'account' | 'password' | 'info' | 'consents';

const Account = ({ panelClassName, panelHeaderClassName }: Props): JSX.Element => {
  const { t } = useTranslation('user');
  const history = useHistory();
  const [editing, setEditing] = useState<Editing>('none');
  const [errors, setErrors] = useState<CustomerFormErrors | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [viewPassword, toggleViewPassword] = useToggle();

  const { user: customer, customerConsents, publisherConsents } = AccountStore.useState((state) => state);
  const consentValues = useMemo(() => formatConsentValues(publisherConsents, customerConsents), [publisherConsents, customerConsents]);
  const initialValues = useMemo(() => ({ ...customer, consents: consentValues }), [customer, consentValues]);

  const formatConsentLabel = (label: string): string | JSX.Element => {
    // @todo sanitize consent label to prevent XSS
    const hasHrefOpenTag = /<a(.|\n)*?>/.test(label);
    const hasHrefCloseTag = /<\/a(.|\n)*?>/.test(label);

    if (hasHrefOpenTag && hasHrefCloseTag) {
      return <span dangerouslySetInnerHTML={{ __html: label }} />;
    }

    return label;
  };

  const translateErrors = (errors?: string[]) => {
    const formErrors: CustomerFormErrors = {};

    errors?.map((error) => {
      switch (error) {
        case 'Invalid param email':
          formErrors.email = 'Invalid email address!';
          break;
        case 'Customer email already exists':
          formErrors.email = 'Email already exists!';
          break;
        case 'Please enter a valid e-mail address.':
          formErrors.email = 'Please enter a valid e-mail address.';
          break;
        case 'Invalid confirmationPassword': {
          formErrors.confirmationPassword = 'Password incorrect!';
          break;
        }
        default:
          console.info('Unknown error', error);
          return;
      }
    });
    return formErrors;
  };

  async function handleSubmit(values: GenericFormValues) {
    let response: ApiResponse | undefined = undefined;
    setIsLoading(true);
    switch (editing) {
      case 'account':
        response = await updateUser({ email: values.email, confirmationPassword: values.confirmationPassword });
        break;
      case 'info':
        response = await updateUser({ firstName: values.firstName, lastName: values.lastName });
        break;
      case 'consents':
        response = await updateConsents(formatConsentsFromValues(publisherConsents, values));
        break;
      default:
        return;
    }

    setErrors(translateErrors(response?.errors));

    if (response && !response?.errors?.length) {
      setEditing('none');
    }

    setIsLoading(false);
  }

  const onCancelClick = (formResetHandler?: () => void): void => {
    formResetHandler && formResetHandler();
    setErrors(undefined);
    setEditing('none');
  };

  const editPasswordClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'reset-password'));
  };

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
                required
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
                    <IconButton aria-label={viewPassword ? t('account.hide_password') : t('account.view_password')} onClick={() => toggleViewPassword()}>
                      {viewPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  }
                  required
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
          {publisherConsents && (
            <div className={panelClassName}>
              <div className={panelHeaderClassName}>
                <h3>{t('account.terms_and_tracking')}</h3>
              </div>
              <div className={styles.flexBox} onClick={() => setEditing('consents')}>
                {publisherConsents.map((consent, index) => (
                  <Checkbox
                    key={index}
                    name={consent.name}
                    value={consent.value || ''}
                    checked={(values.consents?.[consent.name] as boolean) || false}
                    onChange={(event) => (handleChange ? handleChange(event, { nestInto: 'consents' }) : null)}
                    label={formatConsentLabel(consent.label)}
                    disabled={consent.required}
                  />
                ))}
                <div className={styles.controls}>
                  <Button
                    id="submit_consents"
                    className={styles.submitConsents}
                    type="button"
                    label={t('account.update_consents')}
                    disabled={!hasChanged}
                    onClick={handleSubmit}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Form>
  );
};

export default Account;
