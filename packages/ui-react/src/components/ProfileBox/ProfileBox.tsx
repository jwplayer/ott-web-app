import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Edit from '@jwp/ott-theme/assets/icons/edit.svg?react';
import Check from '@jwp/ott-theme/assets/icons/check.svg?react';

import IconButton from '../IconButton/IconButton';
import Icon from '../Icon/Icon';

import styles from './ProfileBox.module.scss';

type Props = {
  name?: string;
  image: string;
  adult?: boolean;
  editMode?: boolean;
  onClick: () => void;
  onEdit: () => void;
  selected?: boolean;
};

const ProfileBox = ({ name, image, editMode = false, onClick, onEdit, selected = false }: Props) => {
  const { t } = useTranslation('user');
  const keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => (event.key === 'Enter' || event.key === ' ') && onClick();

  return (
    <div className={styles.wrapper}>
      <div className={classNames(styles.inner, selected && styles.selected)}>
        <div onClick={onClick} className={styles.box} role="button" tabIndex={0} onKeyDown={keyDownHandler}>
          <img className={styles.image} src={image} alt="" />
        </div>
        {editMode && (
          <IconButton aria-label={t('profile.edit')} onClick={onEdit} className={styles.overlay}>
            <Icon icon={Edit} />
          </IconButton>
        )}
      </div>
      {name && <h2 className={styles.title}>{name}</h2>}
      {selected && (
        <div className={styles.checkmarkContainer}>
          <Icon icon={Check} className={styles.checkmark} />
        </div>
      )}
    </div>
  );
};

export default ProfileBox;
