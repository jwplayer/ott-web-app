import { useTranslation } from 'react-i18next';
import { type SchemaOf, object, string } from 'yup';
import { useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import { useMutation } from 'react-query';

import PasswordField from '../PasswordField/PasswordField';
import Button from '../Button/Button';

import styles from './DeleteAccountModal.module.scss';

import type { DeleteAccountFormData } from '#types/account';
import useForm from '#src/hooks/useForm';
import { addQueryParam, removeQueryParam } from '#src/utils/location';
import { deleteAccountData, logout } from '#src/stores/AccountController';

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
      handleCancel();
    },
  });

  const navigate = useNavigate();
  const location = useLocation();

  const validationSchema: SchemaOf<DeleteAccountFormData> = object().shape({
    password: string().required(t('login.field_required')),
  });
  const initialValues: DeleteAccountFormData = { password: '' };
  const { handleSubmit, handleChange, values, errors } = useForm(
    initialValues,
    () => {
      setEnteredPassword(values.password);
      navigate(addQueryParam(location, 'confirmation', 'true'));
    },
    validationSchema,
  );

  const handleCancel = () => {
    const removedU = removeQueryParam(location, 'u');
    navigate(removedU.split('&confirmation')[0]);
  };

  return enteredPassword ? (
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>{t('account.delete_account_title')}</h2>
      <div className={styles.innerContainer}>
        <p className={styles.paragraph}>{t('account.delete_account_modal_text_1')}</p>
        <p className={styles.paragraph}>{t('account.delete_account_modal_text_2')}</p>
        <div className={styles.warningBox}>
          <p className={styles.paragraph}>{t('account.delete_account_modal_warning_1')}</p>
          <p className={styles.paragraph}>{t('account.delete_account_modal_warning_2')}</p>
        </div>
        <p className={styles.paragraph}>
          {t('account.delete_account_modal_text_3')} <br />
          {t('account.delete_account_modal_text_4')}
        </p>
      </div>
      <div className={styles.buttonsContainer}>
        <Button disabled={deleteAccount.isLoading} variant="text" label={t('account.cancel')} onClick={handleCancel} />
        <Button
          disabled={deleteAccount.isLoading}
          variant="delete"
          label={t('account.delete_account_title')}
          onClick={() => {
            deleteAccount.mutate(enteredPassword);
          }}
        />
      </div>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className={`${styles.formContainer} ${styles.formContainerSmall}`}>
      <h2 className={styles.heading}>{t('account.delete_account_modal_title')}</h2>
      <PasswordField
        value={values.password}
        onChange={handleChange}
        label={t('account.password')}
        placeholder={t('account.delete_account_modal_placeholder')}
        error={!!errors.password || !!errors.form}
        name="password"
        showHelperText={false}
      />
      <div className={styles.passwordButtonsContainer}>
        <Button type="submit" className={styles.button} color="primary" fullWidth label={t('account.continue')} />
        <Button onClick={handleCancel} className={styles.button} variant="text" fullWidth label={t('account.cancel')} />
      </div>
    </form>
  );
};

export default DeleteAccountModal;
