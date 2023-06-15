import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import shallow from 'zustand/shallow';
import DOMPurify from 'dompurify';
import { useMutation } from 'react-query';

import styles from './Account.module.scss';

import type { FormSectionContentArgs, FormSectionProps } from '#components/Form/FormSection';
import Alert from '#components/Alert/Alert';
import Visibility from '#src/icons/Visibility';
import VisibilityOff from '#src/icons/VisibilityOff';
import Button from '#components/Button/Button';
import Form from '#components/Form/Form';
import IconButton from '#components/IconButton/IconButton';
import TextField from '#components/TextField/TextField';
import Checkbox from '#components/Checkbox/Checkbox';
import HelperText from '#components/HelperText/HelperText';
import useToggle from '#src/hooks/useToggle';
import { formatConsentsFromValues, formatConsentValues } from '#src/utils/collection';
import { addQueryParam } from '#src/utils/location';
import { useAccountStore } from '#src/stores/AccountStore';
import { isTruthy, logDev } from '#src/utils/common';
import { exportAccountData, updateConsents, updateUser } from '#src/stores/AccountController';

type Props = {
  panelClassName?: string;
  panelHeaderClassName?: string;
  canUpdateEmail?: boolean;
};

interface FormErrors {
  email?: string;
  confirmationPassword?: string;
  firstName?: string;
  lastName?: string;
  form?: string;
}

const Account = ({ panelClassName, panelHeaderClassName, canUpdateEmail = true }: Props): JSX.Element => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const location = useLocation();
  const [viewPassword, toggleViewPassword] = useToggle();
  const exportData = useMutation(exportAccountData);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const exportDataMessage = exportData.isSuccess ? t('account.export_data_success') : t('account.export_data_error');

  useEffect(() => {
    if (exportData.isSuccess || exportData.isError) {
      setIsAlertVisible(true);
    }
  }, [exportData.isSuccess, exportData.isError]);

  const { customer, customerConsents, publisherConsents, canChangePasswordWithOldPassword, canExportAccountData, canDeleteAccount } = useAccountStore(
    ({ user, customerConsents, publisherConsents, canChangePasswordWithOldPassword, canExportAccountData, canDeleteAccount }) => ({
      customer: user,
      customerConsents,
      publisherConsents,
      canChangePasswordWithOldPassword,
      canExportAccountData,
      canDeleteAccount,
    }),
    shallow,
  );

  const consentValues = useMemo(() => formatConsentValues(publisherConsents, customerConsents), [publisherConsents, customerConsents]);

  const initialValues = useMemo(
    () => ({
      ...customer,
      consents: consentValues,
      confirmationPassword: '',
    }),
    [customer, consentValues],
  );

  const formatConsentLabel = (label: string): string | JSX.Element => {
    const sanitizedLabel = DOMPurify.sanitize(label);
    const hasHrefOpenTag = /<a(.|\n)*?>/.test(sanitizedLabel);
    const hasHrefCloseTag = /<\/a(.|\n)*?>/.test(sanitizedLabel);

    if (hasHrefOpenTag && hasHrefCloseTag) {
      return <span dangerouslySetInnerHTML={{ __html: label }} />;
    }

    return label;
  };

  function translateErrors(errors?: string[]): FormErrors {
    const formErrors: FormErrors = {};
    // Some errors are combined in a single CSV string instead of one string per error
    errors
      ?.flatMap((e) => e.split(','))
      .forEach((error) => {
        switch (error.trim()) {
          case 'Invalid param email':
            formErrors.email = t('account.errors.invalid_param_email');
            break;
          case 'Customer email already exists':
            formErrors.email = t('account.errors.email_exists');
            break;
          case 'Please enter a valid e-mail address.':
            formErrors.email = t('account.errors.please_enter_valid_email');
            break;
          case 'Invalid confirmationPassword': {
            formErrors.confirmationPassword = t('account.errors.invalid_password');
            break;
          }
          case 'firstName can have max 50 characters.': {
            formErrors.firstName = t('account.errors.first_name_too_long');
            break;
          }
          case 'lastName can have max 50 characters.': {
            formErrors.lastName = t('account.errors.last_name_too_long');
            break;
          }
          case 'Email update not supported': {
            formErrors.form = t('account.errors.email_update_not_supported');
            break;
          }
          default: {
            formErrors.form = t('account.errors.unknown_error');
            logDev('Unknown error', error);
            break;
          }
        }
      });

    return formErrors;
  }

  function formSection(props: FormSectionProps<typeof initialValues, FormErrors>) {
    return {
      ...props,
      className: panelClassName,
      panelHeaderClassName: panelHeaderClassName,
      saveButton: t('account.save'),
      cancelButton: t('account.cancel'),
      content: (args: FormSectionContentArgs<typeof initialValues, string[]>) => {
        // This function just allows the sections below to use the FormError type instead of an array of errors
        const formErrors = translateErrors(args.errors);

        // Render the section content, but also add a warning text if there's a form level error
        return (
          <>
            {props.content?.({ ...args, errors: formErrors })}
            <HelperText error={!!formErrors?.form}>{formErrors?.form}</HelperText>
          </>
        );
      },
    };
  }

  const editPasswordClickHandler = () => {
    const modal = canChangePasswordWithOldPassword ? 'edit-password' : 'reset-password';
    navigate(addQueryParam(location, 'u', modal));
  };

  return (
    <>
      <Form initialValues={initialValues}>
        {[
          formSection({
            label: t('account.about_you'),
            editButton: t('account.edit_information'),
            onSubmit: (values) => updateUser({ firstName: values.firstName || '', lastName: values.lastName || '' }),
            content: (section) => (
              <>
                <TextField
                  name="firstName"
                  label={t('account.firstname')}
                  value={section.values.firstName || ''}
                  onChange={section.onChange}
                  error={!!section.errors?.firstName}
                  helperText={section.errors?.firstName}
                  disabled={section.isBusy}
                  editing={section.isEditing}
                />
                <TextField
                  name="lastName"
                  label={t('account.lastname')}
                  value={section.values.lastName || ''}
                  onChange={section.onChange}
                  error={!!section.errors?.lastName}
                  helperText={section.errors?.lastName}
                  disabled={section.isBusy}
                  editing={section.isEditing}
                />
              </>
            ),
          }),
          formSection({
            label: t('account.email'),
            onSubmit: (values) =>
              updateUser({
                email: values.email || '',
                confirmationPassword: values.confirmationPassword,
              }),
            canSave: (values) => !!(values.email && values.confirmationPassword),
            editButton: t('account.edit_account'),
            readOnly: !canUpdateEmail,
            content: (section) => (
              <>
                <TextField
                  name="email"
                  label={t('account.email')}
                  value={section.values.email || ''}
                  onChange={section.onChange}
                  error={!!section.errors?.email}
                  helperText={section.errors?.email}
                  disabled={section.isBusy}
                  editing={section.isEditing}
                  required
                />
                {section.isEditing && (
                  <TextField
                    name="confirmationPassword"
                    label={t('account.confirm_password')}
                    value={section.values.confirmationPassword}
                    onChange={section.onChange}
                    error={!!section.errors?.confirmationPassword}
                    helperText={section.errors?.confirmationPassword}
                    type={viewPassword ? 'text' : 'password'}
                    disabled={section.isBusy}
                    rightControl={
                      <IconButton aria-label={viewPassword ? t('account.hide_password') : t('account.view_password')} onClick={() => toggleViewPassword()}>
                        {viewPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    }
                    required
                  />
                )}
              </>
            ),
          }),
          formSection({
            label: t('account.security'),
            editButton: <Button label={t('account.edit_password')} type="button" onClick={() => (customer ? editPasswordClickHandler() : null)} />,
          }),
          formSection({
            label: t('account.terms_and_tracking'),
            saveButton: t('account.update_consents'),
            onSubmit: (values) => updateConsents(formatConsentsFromValues(publisherConsents, values)),
            content: (section) => (
              <>
                {publisherConsents?.map((consent, index) => (
                  <Checkbox
                    key={index}
                    name={`consents.${consent.name}`}
                    value={consent.value || ''}
                    checked={(section.values.consents?.[consent.name] as boolean) || false}
                    onChange={section.onChange}
                    label={formatConsentLabel(consent.label)}
                    disabled={consent.required || section.isBusy}
                  />
                ))}
              </>
            ),
          }),
          canExportAccountData &&
            formSection({
              label: t('account.export_data_title'),
              content: (section) => (
                <div className={styles.textWithButtonContainer}>
                  <div>
                    <Trans t={t} i18nKey="account.export_data_body" values={{ email: section.values.email }} />
                  </div>
                  <div>
                    <Button
                      label={t('account.export_data_title')}
                      type="button"
                      disabled={exportData.isLoading}
                      onClick={async () => {
                        exportData.mutate();
                      }}
                    />
                  </div>
                </div>
              ),
            }),
          canDeleteAccount &&
            formSection({
              label: t('account.delete_account.title'),
              content: () => (
                <div className={styles.textWithButtonContainer}>
                  <div>{t('account.delete_account.body')}</div>
                  <div>
                    <Button
                      label={t('account.delete_account.title')}
                      type="button"
                      variant="danger"
                      onClick={() => {
                        navigate(addQueryParam(location, 'u', 'delete-account'));
                      }}
                    />
                  </div>
                </div>
              ),
            }),
        ].filter(isTruthy)}
      </Form>
      {canExportAccountData && (
        <Alert open={isAlertVisible} message={exportDataMessage} onClose={() => setIsAlertVisible(false)} isSuccess={exportData.isSuccess} />
      )}
    </>
  );
};

export default Account;
