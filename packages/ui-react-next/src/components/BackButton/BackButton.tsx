import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import ArrowLeft from '@jwp/ott-theme/assets/icons/icon.svg?react';

import IconButton from '../IconButton/IconButton';
import Icon from '../Icon/Icon';

import styles from './BackButton.module.scss';

type Props = {
  className?: string;
  onClick: () => void;
};

const BackButton: React.FC<Props> = ({ className, onClick }: Props) => {
  const { t } = useTranslation('common');

  return (
    <IconButton onClick={onClick} className={classNames(styles.backButton, className)} aria-label={t('common:back')}>
      <Icon icon={ArrowLeft} />
    </IconButton>
  );
};

export default BackButton;
