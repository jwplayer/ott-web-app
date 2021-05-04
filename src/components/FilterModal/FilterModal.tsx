import React, { Fragment, ReactNode } from 'react';
import classNames from 'classnames';

import Close from '../../icons/Close';

import styles from './FilterModal.module.scss';

type Props = {
  isOpen: boolean;
  name: string;
  children: ReactNode[];
  onClose: () => void;
};

const FilterModal: React.FC<Props> = ({ isOpen, onClose, name, children }) => {
  return (
    <Fragment>
      <div
        className={classNames(styles.filterModal, {
          [styles.open]: isOpen,
        })}
        onClick={onClose}
      >
        <div className={styles.header} aria-label="close menu" role="button">
          <Close />
          <h4>{name}</h4>
        </div>
        <hr className={styles.divider} />
        <div className={styles.group}>{children}</div>
      </div>
    </Fragment>
  );
};

export default FilterModal;
