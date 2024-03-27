import React from 'react';
import ArrowLeft from '@jwp/ott-theme/assets/icons/arrow_left.svg?react';
import { useTranslation } from 'react-i18next';

import Icon from '../Icon/Icon';
import IconButton from '../IconButton/IconButton';

import styles from './DialogBackButton.module.scss';

type Props = {
  onClick?: () => void;
};

const DialogBackButton: React.FC<Props> = ({ onClick }: Props) => {
  const { t } = useTranslation();

  return (
    <IconButton onClick={onClick} className={styles.dialogBackButton} aria-label={t('common:back')}>
      <Icon icon={ArrowLeft} />
    </IconButton>
  );
};

export default DialogBackButton;
