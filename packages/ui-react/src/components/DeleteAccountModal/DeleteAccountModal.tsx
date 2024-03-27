import { getModule } from '@jwp/ott-common/src/modules/container';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import type { DeleteAccountFormData } from '@jwp/ott-common/types/account';
import useForm from '@jwp/ott-hooks-react/src/useForm';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useLocation, useNavigate } from 'react-router';
import { object, string } from 'yup';
import { FormValidationError } from '@jwp/ott-common/src/errors/FormValidationError';
import classNames from 'classnames';

import { useAriaAnnouncer } from '../../containers/AnnouncementProvider/AnnoucementProvider';
import { modalURLFromLocation } from '../../utils/location';
import Button from '../Button/Button';
import PasswordField from '../PasswordField/PasswordField';
import useQueryParam from '../../hooks/useQueryParam';
import FormFeedback from '../FormFeedback/FormFeedback';

import styles from './DeleteAccountModal.module.scss';

const DeleteAccountModal = () => {
  const accountController = getModule(AccountController);

  const { t } = useTranslation('user');
  const announce = useAriaAnnouncer();
  const u = useQueryParam('u');

  const [enteredPassword, setEnteredPassword] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();

  const {
    handleSubmit,
    handleChange,
    values,
    errors,
    setErrors,
    reset: resetForm,
  } = useForm<DeleteAccountFormData>({
    initialValues: { password: '' },
    validationSchema: object().shape({ password: string().required(t('login.field_required')) }),
    onSubmit: (values) => {
      setEnteredPassword(values.password);
      navigate(modalURLFromLocation(location, 'delete-account-confirmation'), { replace: true });
    },
  });

  const deleteAccount = useMutation(accountController.deleteAccountData, {
    onSuccess: async () => {
      navigate('/');
      await accountController.logout();
      announce(t('account.delete_account.success'), 'success');
    },
    onError: (error: unknown) => {
      if (error instanceof FormValidationError) {
        setErrors(error.errors);
        navigate(modalURLFromLocation(location, 'delete-account'), { replace: true });
      }
      setEnteredPassword('');
    },
  });

  useEffect(() => {
    // when the user navigates directly to the confirmation step
    if (u === 'delete-account-confirmation' && !enteredPassword) {
      navigate(modalURLFromLocation(location, 'delete-account'), { replace: true });
    }
  }, [location, u, navigate, enteredPassword, deleteAccount, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(modalURLFromLocation(location, null), { replace: true });
  }, [location, navigate]);

  // step 2: delete account confirmation
  if (enteredPassword) {
    return (
      <div>
        <h2 className={styles.heading}>{t('account.delete_account.title')}</h2>
        <div className={styles.disclaimer}>
          <p>{t('account.delete_account.modal.text_data_erasure')}</p>
          <p>{t('account.delete_account.modal.text_revoked_access')}</p>
          <div className={styles.warningBox}>
            <p>{t('account.delete_account.modal.warning')}</p>
          </div>
          <p>
            {t('account.delete_account.modal.text_cant_be_undone')} <br />
            {t('account.delete_account.modal.text_contacts')}
          </p>
        </div>
        <div className={styles.buttons}>
          <Button disabled={deleteAccount.isLoading} variant="text" label={t('account.cancel')} onClick={handleCancel} />
          <Button
            disabled={deleteAccount.isLoading}
            variant="delete"
            label={t('account.delete_account.title')}
            onClick={() => {
              deleteAccount.mutate(enteredPassword);
            }}
          />
        </div>
      </div>
    );
  }

  // step 1: enter your password
  return (
    <form onSubmit={handleSubmit}>
      <h2 className={styles.heading}>{t('account.delete_account.title')}</h2>
      <p className={styles.paragraph}>{t('account.delete_account.modal.description')}</p>
      {errors.form && <FormFeedback variant="error">{errors.form}</FormFeedback>}
      <PasswordField
        value={values.password}
        onChange={handleChange}
        label={t('account.password')}
        placeholder={t('account.delete_account.modal.placeholder')}
        error={!!errors.password || !!errors.form}
        helperText={errors.password}
        name="password"
        showHelperText={false}
      />
      <div className={classNames(styles.buttons, styles.stacked)}>
        <Button type="submit" color="primary" label={t('account.continue')} fullWidth />
        <Button type="button" onClick={handleCancel} variant="text" label={t('account.cancel')} fullWidth />
      </div>
    </form>
  );
};

export default DeleteAccountModal;
