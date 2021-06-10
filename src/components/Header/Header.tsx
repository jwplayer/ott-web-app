import React, { ReactFragment } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Logo from '../Logo/Logo';
import Menu from '../../icons/Menu';
import IconButton from '../../components/IconButton/IconButton';

import styles from './Header.module.scss';

type TypeHeader = 'static' | 'fixed';

type Props = {
  headerType?: TypeHeader;
  onMenuButtonClick: () => void;
  logoSrc?: string;
  children?: ReactFragment;
};

const Header: React.FC<Props> = ({ headerType = 'static', onMenuButtonClick, children, logoSrc }) => {
  const { t } = useTranslation('menu');

  return (
    <header className={classNames(styles.header, styles[headerType])}>
      <div className={styles.container}>
        <div className={styles.menu}>
          <IconButton aria-label={t('open_menu')} onClick={onMenuButtonClick}>
            <Menu />
          </IconButton>
        </div>
        {logoSrc && <Logo src={logoSrc} />}
        <nav className={styles.nav} aria-label="menu">
          {children}
        </nav>
        <div className={styles.search}></div>
      </div>
    </header>
  );
};

export default Header;
