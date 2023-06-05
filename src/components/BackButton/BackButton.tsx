import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import IconButton from '../IconButton/IconButton';
import ArrowLeft from '../../icons/ArrowLeft';

import styles from './BackButton.module.scss';

type Props = {
  className?: string;
  onClick: () => void;
};

const BackButton: React.FC<Props> = ({ className, onClick }: Props) => {
  const { t } = useTranslation('common');

  return (
    <IconButton onClick={onClick} className={classNames(styles.backButton, className)} aria-label={t('common:back')}>
      <ArrowLeft />
    </IconButton>
  );
};

export default BackButton;
