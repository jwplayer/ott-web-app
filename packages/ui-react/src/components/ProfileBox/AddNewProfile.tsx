import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Plus from '@jwp/ott-theme/assets/icons/plus.svg?react';

import Icon from '../Icon/Icon';

import styles from './ProfileBox.module.scss';

type Props = {
  onClick: () => void;
};

const AddNewProfile = ({ onClick }: Props) => {
  const { t } = useTranslation('user');
  const keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => (event.key === 'Enter' || event.key === ' ') && onClick();

  return (
    <div onClick={onClick} tabIndex={0} onKeyDown={keyDownHandler} className={classNames(styles.wrapper, styles.addProfileContainer)} role="button">
      <div className={styles.iconContainer}>
        <div className={`${styles.box} ${styles.circle}`}>
          <Icon icon={Plus} />
        </div>
      </div>
      <h2 className={styles.title}>{t('account.add_profile')}</h2>
    </div>
  );
};

export default AddNewProfile;
