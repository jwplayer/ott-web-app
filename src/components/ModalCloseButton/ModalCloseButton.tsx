import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './ModalCloseButton.module.scss';

import Close from '#src/icons/Close';
import IconButton from '#components/IconButton/IconButton';

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
