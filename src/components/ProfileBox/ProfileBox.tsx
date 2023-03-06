import React from 'react';

import styles from './ProfileBox.module.scss';

import Edit from '#src/icons/Edit';

type Props = {
  name: string;
  image: string;
  adult?: boolean;
  editMode?: boolean;
  onClick: () => void;
  onEdit: () => void;
};

const ProfileBox = ({ name, image, adult = true, editMode = false, onClick, onEdit }: Props) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <div onClick={onClick} className={styles.box}>
          <img className={styles.image} src={image} alt="" />
          {!adult && <span className={styles.kids}>Kids</span>}
        </div>
        {editMode && (
          <div onClick={onEdit} className={styles.overlay}>
            <Edit />
          </div>
        )}
      </div>
      <h2 className={styles.title}>{name}</h2>
    </div>
  );
};

export default ProfileBox;
