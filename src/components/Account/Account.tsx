import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../../components/Button/Button';

import styles from './Account.module.scss';

type Props = {
  account: Account;
  update: (account: Account) => void;
  panelClassName?: string;
  panelHeaderClassName?: string;
};

const Account = ({ account, update, panelClassName, panelHeaderClassName }: Props): JSX.Element => {
  const { t } = useTranslation('user');

  return (
    <>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('account.email')}</h3>
        </div>
        <div>
          <strong>{t('account.email')}</strong>
          <p>{account.email}</p>
          <Button label={t('account.edit_account')} onClick={() => update(account)} />
        </div>
      </div>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('account.security')}</h3>
        </div>
        <div>
          <strong>{t('account.password')}</strong>
          <p>****************</p>
          <Button label={t('account.edit_password')} />
        </div>
      </div>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('account.about_you')}</h3>
        </div>
        <div>
          <strong>{t('account.firstname')}</strong>
          <p>{account.firstname}</p>
          <strong>{t('account.lastname')}</strong>
          <p>{account.lastname}</p>
          <Button label={t('account.edit_information')} />
        </div>
      </div>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{'Terms & tracking'}</h3>
        </div>
        <div>
          <label className={styles.checkbox}>
            <input type="checkbox" id="terms1" name="terms 1" value="Bike" />
            <p>
              I accept the <strong>Terms of Conditions</strong> of {'<platform name>'}
            </p>
          </label>
          <Button label={t('account.update_consents')} />
        </div>
      </div>
    </>
  );
};

export default Account;
