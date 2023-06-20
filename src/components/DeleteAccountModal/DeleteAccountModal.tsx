import { useTranslation } from 'react-i18next';
import { type SchemaOf, object, string } from 'yup';
import { useNavigate, useLocation } from 'react-router';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';

import PasswordField from '../PasswordField/PasswordField';
import Button from '../Button/Button';

import styles from './DeleteAccountModal.module.scss';

import type { DeleteAccountFormData } from '#types/account';
import useForm from '#src/hooks/useForm';
import { addQueryParam, removeQueryParam } from '#src/utils/location';
import { deleteAccountData, logout } from '#src/stores/AccountController';
import Alert from '#components/Alert/Alert';

const DeleteAccountModal = () => {
  const { t } = useTranslation('user');

  const [enteredPassword, setEnteredPassword] = useState<string>('');

  const deleteAccount = useMutation(deleteAccountData, {
    onSuccess: async () => {
      await logout();
      navigate('/');
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
      navigate(addQueryParam(location, 'u', 'delete-account-confirmation'), { replace: true });
    },
    validationSchema,
  );

  useEffect(() => {
    if (!location.search.includes('delete-account-confirmation') && enteredPassword) {
      // handle back button
      setEnteredPassword('');
      deleteAccount.reset();
      resetForm();
    }
    if (location.search.includes('delete-account-confirmation') && !enteredPassword) {
      navigate(addQueryParam(location, 'u', 'delete-account'), { replace: true });
    }
  }, [location, location.search, navigate, enteredPassword, deleteAccount, resetForm]);

  const handleError = useCallback(() => {
    deleteAccount.reset();
    resetForm();
    setEnteredPassword('');
    navigate(addQueryParam(location, 'u', 'delete-account'), { replace: true });
  }, [location, navigate, setEnteredPassword, deleteAccount, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(removeQueryParam(location, 'u'), { replace: true });
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
