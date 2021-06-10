import React, { Fragment, ReactNode } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Close from '../../icons/Close';
import IconButton from '../../components/IconButton/IconButton';

import styles from './FilterModal.module.scss';

type Props = {
  isOpen: boolean;
  name: string;
  children: ReactNode[];
  onClose: () => void;
};

const FilterModal: React.FC<Props> = ({ isOpen, onClose, name, children }) => {
  const { t } = useTranslation('common');

  return (
    <Fragment>
      <div
        className={classNames(styles.filterModal, {
          [styles.open]: isOpen,
        })}
      >
        <div className={styles.header}>
          <IconButton aria-label={t('close')} onClick={onClose}>
            <Close />
          </IconButton>
          <h4>{name}</h4>
        </div>
        <hr className={styles.divider} />
        <div className={styles.group} onClick={onClose}>
          {children}
        </div>
      </div>
    </Fragment>
  );
};

export default FilterModal;
