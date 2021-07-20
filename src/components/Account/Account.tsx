import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Customer } from 'types/account';

import Button from '../../components/Button/Button';
import Form from '../Form/Form';

import styles from './Account.module.scss';

type Props = {
  customer: Customer;
  onUpdateEmailSubmit: (data: Record<string, string>) => void;
  onUpdateInfoSubmit: (data: Record<string, string>) => void;
  panelClassName?: string;
  panelHeaderClassName?: string;
  onDeleteAccountClick: () => void;
};

type Editing = 'none' | 'account' | 'password' | 'info';
type FormValues = Record<string, string>;

const Account = ({
  customer,
  panelClassName,
  panelHeaderClassName,
  onUpdateEmailSubmit,
  onUpdateInfoSubmit,
  onDeleteAccountClick,
}: Props): JSX.Element => {
  const { t } = useTranslation('user');
  const [editing, setEditing] = useState<Editing>('none');

  const handleSubmit = (values: FormValues) => {
    switch (editing) {
      case 'account':
        return onUpdateEmailSubmit(values);
      case 'info':
        return onUpdateInfoSubmit(values);
      default:
        return;
    }
  };

  return (
    <Form initialValues={customer} onSubmit={handleSubmit} editing={editing !== 'none'}>
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
                  <input name="confirmationPassword" value={values.confirmationPassword} onChange={onChange} />
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
                {editing === 'info' ? <input name="firstName" value={values.firstName} onChange={onChange} /> : <p>{customer.firstName}</p>}
                <strong>{t('account.lastname')}</strong>
                {editing === 'info' ? <input name="lastName" value={values.lastName} onChange={onChange} /> : <p>{customer.lastName}</p>}
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
