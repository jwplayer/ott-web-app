import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Close from '@jwp/ott-theme/assets/icons/close.svg?react';

import IconButton from '../IconButton/IconButton';
import Icon from '../Icon/Icon';

import styles from './ModalCloseButton.module.scss';

type Props = {
  onClick?: () => void;
  visible?: boolean;
};

const ModalCloseButton: React.FC<Props> = ({ onClick, visible = true }: Props) => {
  const { t } = useTranslation('common');

  return (
    <IconButton onClick={onClick} aria-label={t('close_modal')} className={classNames(styles.modalCloseButton, { [styles.hidden]: !visible })}>
      <Icon icon={Close} />
    </IconButton>
  );
};

export default ModalCloseButton;
