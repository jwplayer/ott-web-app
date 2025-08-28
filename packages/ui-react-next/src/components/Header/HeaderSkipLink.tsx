import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './Header.module.scss';

const HeaderSkipLink = ({ className }: { className?: string }) => {
  const { t } = useTranslation('menu');
  return (
    <a href="#content" className={classNames(styles.skipToContent, className)}>
      {t('skip_to_content')}
    </a>
  );
};

export default HeaderSkipLink;
