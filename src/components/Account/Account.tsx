import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Customer } from 'types/account';

import Button from '../../components/Button/Button';

import styles from './Account.module.scss';

type Props = {
  customer: Customer;
  update: (customer: Customer) => void;
  panelClassName?: string;
  panelHeaderClassName?: string;
};

const Account = ({ customer, update, panelClassName, panelHeaderClassName }: Props): JSX.Element => {
  const { t } = useTranslation('user');

  return (
    <>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('account.email')}</h3>
        </div>
        <div>
          <strong>{t('account.email')}</strong>
          <p>{customer.email}</p>
          <Button label={t('account.edit_account')} onClick={() => update(customer)} />
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
          <p>{customer.firstName}</p>
          <strong>{t('account.lastname')}</strong>
          <p>{customer.lastName}</p>
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
