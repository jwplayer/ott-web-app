import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Customer } from 'types/account';

import Button from '../../components/Button/Button';
import Form from '../Form/Form';

import styles from './Account.module.scss';

type Props = {
  customer: Customer;
  update: (customer: Customer) => void;
  panelClassName?: string;
  panelHeaderClassName?: string;
  onDeleteAccountClick: () => void;
};

type Editing = 'none' | 'account' | 'password' | 'info';

const Account = ({ customer, update, onDeleteAccountClick, panelClassName, panelHeaderClassName }: Props): JSX.Element => {
  const { t } = useTranslation('user');
  const [editing, setEditing] = useState<Editing>('none');

  return (
    <Form initialValues={{ test: 'test' }} onSubmit={(values) => update(values as Customer)}>
      {({ values, onChange, handleSubmit }) => (
        <>
          <div className={panelClassName}>
            <div className={panelHeaderClassName}>
              <h3>{t('account.email')}</h3>
            </div>
            <div className={styles.flexBox}>
              <strong>{t('account.email')}</strong>
              {editing === 'account' ? <input name="email" value={values.email} onChange={onChange} /> : <p>{customer.email}</p>}
              {editing === 'account' && (
                <>
                  <strong>{t('account.confirm_password')}</strong>
                  <input name="emailConfirm" value={values.emailConfirm} onChange={onChange} />
                </>
              )}
              <div className={styles.controls}>
                {editing === 'account' ? (
                  <>
                    <Button label={t('account.save')} onClick={handleSubmit} />
                    <Button variant="text" label={t('account.cancel')} onClick={() => setEditing('none')} />
                    <Button label={t('account.delete_account')} onClick={onDeleteAccountClick} />
                  </>
                ) : (
                  <Button label={t('account.edit_account')} onClick={() => setEditing('account')} />
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
              <Button label={t('account.edit_password')} onClick={() => setEditing('password')} />
            </div>
          </div>
          <div className={panelClassName}>
            <div className={panelHeaderClassName}>
              <h3>{t('account.about_you')}</h3>
            </div>
            <div>
              <div className={styles.flexBox}>
                <strong>{t('account.firstname')}</strong>
                {editing === 'info' ? <input name="firstName" value={values.firstName} /> : <p>{customer.firstName}</p>}
                <strong>{t('account.lastname')}</strong>
                {editing === 'info' ? <input name="lastName" value={values.lastName} /> : <p>{customer.lastName}</p>}
                <div className={styles.controls}>
                  {editing === 'info' ? (
                    <>
                      <Button label={t('account.save')} onClick={handleSubmit} />
                      <Button variant="text" label={t('account.cancel')} onClick={() => setEditing('none')} />
                    </>
                  ) : (
                    <Button label={t('account.edit_information')} onClick={() => setEditing('info')} />
                  )}
                </div>
              </div>
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
      )}
    </Form>
  );
};

export default Account;
