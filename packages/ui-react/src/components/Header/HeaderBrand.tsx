import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import Logo from '../Logo/Logo';

import styles from './Header.module.scss';

type Props = {
  className?: string;
  siteName?: string;
  logoSrc?: string | null;
  setLogoLoaded: (loaded: boolean) => void;
};

const HeaderBrand = ({ className, siteName, logoSrc, setLogoLoaded }: Props) => {
  const { t } = useTranslation('menu');

  if (!logoSrc) return null;

  return (
    <div className={classNames(styles.brand, className)}>
      <Logo alt={t('logo_alt', { siteName })} src={logoSrc} onLoad={() => setLogoLoaded(true)} />
    </div>
  );
};

export default HeaderBrand;
