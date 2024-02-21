import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useCallback, useState } from 'react';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';

import Button from '../Button/Button';
import FormFeedback from '../FormFeedback/FormFeedback';
import { modalURLFromLocation } from '../../utils/location';

import styles from './DeleteAccountPasswordWarning.module.scss';

const DeleteAccountPasswordWarning = () => {
  const accountController = getModule(AccountController);

  const { t } = useTranslation('user');
  const email = useAccountStore((state) => state.user?.email);
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCancel = useCallback(() => {
    navigate(modalURLFromLocation(location, null), { replace: true });
  }, [location, navigate]);
  const proceedToAddPasswordClickHandler = async () => {
    try {
      if (email) {
        await accountController.resetPassword(email, '');
        navigate(modalURLFromLocation(location, 'add-password'));
      }
    } catch (error: unknown) {
      setErrorMessage(t('account.add_password_error'));
    }
  };

  return (
    <div className={styles.formContainer}>
      {errorMessage && (
        <div className={styles.formFeedback}>
          <FormFeedback variant="error">{errorMessage}</FormFeedback>
        </div>
      )}
      <h2 className={styles.heading}>{t('account.delete_account_password_warning.title')}</h2>
      <p className={styles.paragraph}>{t('account.delete_account_password_warning.text')}</p>
      <div className={styles.passwordButtonsContainer}>
        <Button
          type="submit"
          onClick={proceedToAddPasswordClickHandler}
          className={styles.button}
          color="primary"
          fullWidth
          label={t('account.proceed_to_adding_a_password')}
        />
        <Button type="button" onClick={handleCancel} className={styles.button} variant="text" fullWidth label={t('account.cancel')} />
      </div>
    </div>
  );
};

export default DeleteAccountPasswordWarning;
