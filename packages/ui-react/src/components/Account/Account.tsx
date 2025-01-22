import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import DOMPurify from 'dompurify';
import { useMutation } from 'react-query';
import type { CustomFormField } from '@jwp/ott-common/types/account';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { isTruthy, isTruthyCustomParamValue, testId } from '@jwp/ott-common/src/utils/common';
import { logError } from '@jwp/ott-common/src/logger';
import { formatConsents, formatConsentsFromValues, formatConsentsToRegisterFields, formatConsentValues } from '@jwp/ott-common/src/utils/collection';
import useToggle from '@jwp/ott-hooks-react/src/useToggle';
import Visibility from '@jwp/ott-theme/assets/icons/visibility.svg?react';
import VisibilityOff from '@jwp/ott-theme/assets/icons/visibility_off.svg?react';
import env from '@jwp/ott-common/src/env';

import type { FormSectionContentArgs, FormSectionProps } from '../Form/FormSection';
import Alert from '../Alert/Alert';
import Button from '../Button/Button';
import Form from '../Form/Form';
import IconButton from '../IconButton/IconButton';
import FormFeedback from '../FormFeedback/FormFeedback';
import TextField from '../form-fields/TextField/TextField';
import Checkbox from '../form-fields/Checkbox/Checkbox';
import CustomRegisterField from '../CustomRegisterField/CustomRegisterField';
import Icon from '../Icon/Icon';
import { modalURLFromLocation } from '../../utils/location';
import { useAriaAnnouncer } from '../../containers/AnnouncementProvider/AnnoucementProvider';

import styles from './Account.module.scss';

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
  const accountController = getModule(AccountController);

  const { t, i18n } = useTranslation('user');
  const announce = useAriaAnnouncer();
  const navigate = useNavigate();
  const location = useLocation();
  const [viewPassword, toggleViewPassword] = useToggle();
  const exportData = useMutation(accountController.exportAccountData);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const exportDataMessage = exportData.isSuccess ? t('account.export_data_success') : t('account.export_data_error');
  const htmlLang = i18n.language !== env.APP_DEFAULT_LANGUAGE ? env.APP_DEFAULT_LANGUAGE : undefined;

  useEffect(() => {
    if (exportData.isSuccess || exportData.isError) {
      setIsAlertVisible(true);
    }
  }, [exportData.isSuccess, exportData.isError]);

  const { customer, customerConsents, publisherConsents } = useAccountStore(
    ({ user, customerConsents, publisherConsents }) => ({
      customer: user,
      customerConsents,
      publisherConsents,
    }),
    shallow,
  );

  const { canChangePasswordWithOldPassword, canExportAccountData, canDeleteAccount } = accountController.getFeatures();
  // users authenticated with social (register_source: facebook, google, twitter) do not have password by default
  const registerSource = customer?.metadata?.register_source;
  const isSocialLogin = (registerSource && registerSource !== 'inplayer') || false;
  const shouldAddPassword = (isSocialLogin && !customer?.metadata?.has_password) || false;

  // load consents (move to `useConsents` hook?)
  useEffect(() => {
    if (!publisherConsents) {
      accountController.getPublisherConsents();

      return;
    }
  }, [accountController, publisherConsents]);

  const [termsConsents, nonTermsConsents] = useMemo(() => {
    const terms: CustomFormField[] = [];
    const nonTerms: CustomFormField[] = [];

    publisherConsents?.forEach((consent) => {
      if (!consent?.type || consent?.type === 'checkbox') {
        terms.push(consent);
      } else {
        nonTerms.push(consent);
      }
    });

    return [terms, nonTerms];
  }, [publisherConsents]);

  const consents = useMemo(() => formatConsents(publisherConsents, customerConsents), [publisherConsents, customerConsents]);

  const consentsValues = useMemo(() => formatConsentValues(publisherConsents, customerConsents), [publisherConsents, customerConsents]);

  const initialValues = useMemo(
    () => ({
      ...customer,
      consents,
      consentsValues,
      confirmationPassword: '',
    }),
    [customer, consents, consentsValues],
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
            formErrors.form = t('account.errors.validation_error');
            formErrors.email = t('account.errors.invalid_param_email');
            break;
          case 'Customer email already exists':
            formErrors.form = t('account.errors.validation_error');
            formErrors.email = t('account.errors.email_exists');
            break;
          case 'Please enter a valid e-mail address.':
            formErrors.form = t('account.errors.validation_error');
            formErrors.email = t('account.errors.please_enter_valid_email');
            break;
          case 'Invalid confirmationPassword': {
            formErrors.form = t('account.errors.validation_error');
            formErrors.confirmationPassword = t('account.errors.invalid_password');
            break;
          }
          case 'firstName can have max 50 characters.': {
            formErrors.form = t('account.errors.validation_error');
            formErrors.firstName = t('account.errors.first_name_too_long');
            break;
          }
          case 'lastName can have max 50 characters.': {
            formErrors.form = t('account.errors.validation_error');
            formErrors.lastName = t('account.errors.last_name_too_long');
            break;
          }
          case 'Email update not supported': {
            formErrors.form = t('account.errors.email_update_not_supported');
            break;
          }
          case 'Wrong email/password combination': {
            formErrors.form = t('account.errors.wrong_combination');
            break;
          }
          default: {
            formErrors.form = t('account.errors.unknown_error');
            logError('Account', 'Unknown error', { error });
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
            {formErrors?.form ? <FormFeedback variant="error">{formErrors.form}</FormFeedback> : null}
            {props.content?.({ ...args, errors: formErrors })}
          </>
        );
      },
    };
  }

  const editPasswordClickHandler = async () => {
    if (!customer) {
      return;
    }
    if (isSocialLogin && shouldAddPassword) {
      await accountController.resetPassword(customer.email, '');
      return navigate(modalURLFromLocation(location, 'add-password'));
    }

    navigate(modalURLFromLocation(location, canChangePasswordWithOldPassword ? 'edit-password' : 'reset-password'));
  };

  return (
    <>
      <h1 className="hideUntilFocus">{t('nav.account')}</h1>

      <Form initialValues={initialValues}>
        {[
          formSection({
            label: t('account.about_you'),
            editButton: t('account.edit_information'),
            onSubmit: async (values) => {
              const consents = formatConsentsFromValues(publisherConsents, { ...values.metadata, ...values.consentsValues });

              const response = await accountController.updateUser({
                firstName: values.firstName || '',
                lastName: values.lastName || '',
                metadata: {
                  ...values.metadata,
                  ...formatConsentsToRegisterFields(consents),
                  consents: JSON.stringify(consents),
                },
              });

              announce(t('account.update_success', { section: t('account.about_you') }), 'success');

              return response;
            },
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
                  autoComplete="given-name"
                  lang={htmlLang}
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
                  autoComplete="family-name"
                  lang={htmlLang}
                />
              </>
            ),
          }),
          formSection({
            label: t('account.email'),
            onSubmit: async (values) => {
              if (!values.email || !values.confirmationPassword) {
                throw new Error('Wrong email/password combination');
              }
              const response = await accountController.updateUser({
                email: values.email || '',
                confirmationPassword: values.confirmationPassword,
              });

              announce(t('account.update_success', { section: t('account.email') }), 'success');

              return response;
            },
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
                  autoComplete="email"
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
                    autoComplete="current-password"
                    rightControl={
                      <IconButton aria-label={t('account.view_password')} onClick={() => toggleViewPassword()} aria-pressed={viewPassword}>
                        <Icon icon={viewPassword ? Visibility : VisibilityOff} />
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
            editButton: (
              <Button
                label={shouldAddPassword ? t('account.add_password') : t('account.edit_password')}
                type="button"
                onClick={() => (customer ? editPasswordClickHandler() : null)}
              />
            ),
          }),
          formSection({
            label: t('account.terms_and_tracking'),
            saveButton: t('account.update_consents'),
            onSubmit: async (values) => {
              const response = await accountController.updateConsents(formatConsentsFromValues(publisherConsents, values.consentsValues));

              announce(t('account.update_success', { section: t('account.terms_and_tracking') }), 'success');

              return response;
            },
            content: (section) => (
              <>
                {termsConsents?.map((consent, index) => (
                  <Checkbox
                    key={index}
                    name={`consentsValues.${consent.name}`}
                    checked={isTruthyCustomParamValue(section.values.consentsValues?.[consent.name])}
                    onChange={section.onChange}
                    checkboxLabel={formatConsentLabel(consent.label)}
                    disabled={consent.required || section.isBusy}
                    required={consent.required}
                    lang={htmlLang}
                  />
                ))}
              </>
            ),
          }),
          nonTermsConsents?.length &&
            formSection({
              label: t('account.other_registration_details'),
              saveButton: t('account.update_consents'),
              onSubmit: (values) => accountController.updateConsents(formatConsentsFromValues(publisherConsents, values.consentsValues)),
              content: (section) => (
                <div className={styles.customFields} data-testid={testId('custom-reg-fields')}>
                  {nonTermsConsents.map((consent) => (
                    <CustomRegisterField
                      key={consent.name}
                      type={consent.type}
                      name={`consentsValues.${consent.name}`}
                      options={consent.options}
                      label={formatConsentLabel(consent.label)}
                      placeholder={consent.placeholder}
                      value={section.values.consentsValues[consent.name]}
                      disabled={(consent.type === 'checkbox' && consent.required) || section.isBusy}
                      onChange={section.onChange}
                      required={consent.required}
                    />
                  ))}
                </div>
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
                        navigate(modalURLFromLocation(location, shouldAddPassword ? 'warning-account-deletion' : 'delete-account'));
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
