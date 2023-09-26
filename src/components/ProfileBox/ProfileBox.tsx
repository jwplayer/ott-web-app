import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './ProfileBox.module.scss';

import Edit from '#src/icons/Edit';
import Check from '#src/icons/Check';
import IconButton from '#components/IconButton/IconButton';

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
            <Edit />
          </IconButton>
        )}
      </div>
      {name && <h2 className={styles.title}>{name}</h2>}
      {selected && (
        <div className={styles.checkmarkContainer}>
          <Check className={styles.checkmark} />
        </div>
      )}
    </div>
  );
};

export default ProfileBox;
