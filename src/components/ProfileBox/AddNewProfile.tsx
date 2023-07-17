import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ProfileBox.module.scss';

type Props = {
  onClick: () => void;
};

const AddNewProfile = ({ onClick }: Props) => {
  const { t } = useTranslation('user');
  return (
    <div onClick={onClick} className={styles.wrapper}>
      <div className={`${styles.box} ${styles.circle}`}>
        <svg width="36.67" height="36.67" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M33.6667 15.3333H22.6667V4.33329C22.6667 3.36083 22.2804 2.4282 21.5928 1.74057C20.9052 1.05293 19.9725 0.666626 19.0001 0.666626C18.0276 0.666626 17.095 1.05293 16.4074 1.74057C15.7197 2.4282 15.3334 3.36083 15.3334 4.33329V15.3333H4.33341C3.36095 15.3333 2.42832 15.7196 1.74069 16.4072C1.05306 17.0949 0.666748 18.0275 0.666748 19C0.666748 19.9724 1.05306 20.9051 1.74069 21.5927C2.42832 22.2803 3.36095 22.6666 4.33341 22.6666H15.3334V33.6666C15.3334 34.6391 15.7197 35.5717 16.4074 36.2593C17.095 36.947 18.0276 37.3333 19.0001 37.3333C19.9725 37.3333 20.9052 36.947 21.5928 36.2593C22.2804 35.5717 22.6667 34.6391 22.6667 33.6666V22.6666H33.6667C34.6392 22.6666 35.5718 22.2803 36.2595 21.5927C36.9471 20.9051 37.3334 19.9724 37.3334 19C37.3334 18.0275 36.9471 17.0949 36.2595 16.4072C35.5718 15.7196 34.6392 15.3333 33.6667 15.3333Z"
            fill="#F7F8FA"
          />
        </svg>
      </div>
      <h2 className={styles.title}>{t('account.add_profile')}</h2>
    </div>
  );
};

export default AddNewProfile;
