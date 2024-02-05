import { useTranslation } from 'react-i18next';
import { object, type SchemaOf, string } from 'yup';
import { useLocation, useNavigate } from 'react-router';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import type { DeleteAccountFormData } from '@jwp/ott-common/types/account';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import useForm from '@jwp/ott-hooks-react/src/useForm';

import PasswordField from '../PasswordField/PasswordField';
import Button from '../Button/Button';
import Alert from '../Alert/Alert';
import { modalURLFromLocation } from '../../utils/location';

import styles from './DeleteAccountModal.module.scss';

const DeleteAccountModal = () => {
  const accountController = getModule(AccountController);

  const { t } = useTranslation('user');

  const [enteredPassword, setEnteredPassword] = useState<string>('');

  const deleteAccount = useMutation(accountController.deleteAccountData, {
    onSuccess: async () => {
      navigate('/');
      await accountController.logout();
    },
    onError: () => {
      setEnteredPassword('');
    },
  });

  const navigate = useNavigate();
  const location = useLocation();

  const validationSchema: SchemaOf<DeleteAccountFormData> = object().shape({
    password: string().required(t('login.field_required')),
  });
  const initialValues: DeleteAccountFormData = { password: '' };
  const {
    handleSubmit,
    handleChange,
    values,
    errors,
    reset: resetForm,
  } = useForm(
    initialValues,
    () => {
      setEnteredPassword(values.password);
      navigate(modalURLFromLocation(location, 'delete-account-confirmation'), { replace: true });
    },
    validationSchema,
  );

  useEffect(() => {
    if (!location.search.includes('delete-account-confirmation') && enteredPassword) {
      // handle back button
      setEnteredPassword('');
      resetForm();
    }
    if (location.search.includes('delete-account-confirmation') && !enteredPassword) {
      navigate(modalURLFromLocation(location, 'delete-account'), { replace: true });
    }
  }, [location, location.search, navigate, enteredPassword, deleteAccount, resetForm]);

  const handleError = useCallback(() => {
    deleteAccount.reset();
    resetForm();
    setEnteredPassword('');
    navigate(modalURLFromLocation(location, 'delete-account'), { replace: true });
  }, [location, navigate, setEnteredPassword, deleteAccount, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(modalURLFromLocation(location, null), { replace: true });
  }, [location, navigate]);

  if (deleteAccount.isError) {
    return <Alert open isSuccess={false} onClose={handleError} message={t('account.delete_account.error')} />;
  }

  return enteredPassword ? (
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>{t('account.delete_account.title')}</h2>
      <div className={styles.innerContainer}>
        <p className={styles.paragraph}>{t('account.delete_account.modal.text_data_erasure')}</p>
        <p className={styles.paragraph}>{t('account.delete_account.modal.text_revoked_access')}</p>
        <div className={styles.warningBox}>
          <p className={styles.paragraph}>{t('account.delete_account.modal.warning')}</p>
        </div>
        <p className={styles.paragraph}>
          {t('account.delete_account.modal.text_cant_be_undone')} <br />
          {t('account.delete_account.modal.text_contacts')}
        </p>
      </div>
      <div className={styles.buttonsContainer}>
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
  ) : (
    <form onSubmit={handleSubmit} className={`${styles.formContainer} ${styles.formContainerSmall}`}>
      <h2 className={styles.heading}>{t('account.delete_account.modal.title')}</h2>
      <PasswordField
        value={values.password}
        onChange={handleChange}
        label={t('account.password')}
        placeholder={t('account.delete_account.modal.placeholder')}
        error={!!errors.password || !!errors.form}
        name="password"
        showHelperText={false}
      />
      <div className={styles.passwordButtonsContainer}>
        <Button type="submit" className={styles.button} color="primary" fullWidth label={t('account.continue')} />
        <Button type="button" onClick={handleCancel} className={styles.button} variant="text" fullWidth label={t('account.cancel')} />
      </div>
    </form>
  );
};

export default DeleteAccountModal;
