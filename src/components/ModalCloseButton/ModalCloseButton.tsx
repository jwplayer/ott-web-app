import React from 'react';

import styles from './ModalCloseButton.module.scss';
import classNames from 'classnames';
import Close from '../../icons/Close';
import IconButton from '../IconButton/IconButton';
import { useTranslation } from 'react-i18next';

type Props = {
  onClick?: () => void;
  visible?: boolean;
};

const ModalCloseButton: React.FC<Props> = ({ onClick, visible = true }: Props) => {
  const { t } = useTranslation('common');

  return (
    <IconButton onClick={onClick} aria-label={t('close_modal')} className={classNames(styles.modalCloseButton, { [styles.hidden]: !visible })}>
      <Close />
    </IconButton>
  );
};

export default ModalCloseButton;
