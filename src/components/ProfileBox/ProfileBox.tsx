import React from 'react';
import classNames from 'classnames';

import styles from './ProfileBox.module.scss';

import Edit from '#src/icons/Edit';
import Check from '#src/icons/Check';
import IconButton from '#components/IconButton/IconButton';
import defaultAvatar from '#src/assets/profiles/default_avatar.png';

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
  return (
    <div className={styles.wrapper}>
      <div className={classNames(styles.inner, selected && styles.selected)}>
        <div onClick={onClick} className={styles.box}>
          <img className={styles.image} src={image || defaultAvatar} alt="" />
        </div>
        {editMode && (
          <IconButton aria-label="edit-profile-button" onClick={onEdit} className={styles.overlay}>
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
