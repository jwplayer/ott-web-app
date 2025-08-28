import { type PropsWithChildren } from 'react';
import classNames from 'classnames';

import createInjectableComponent from '../../modules/createInjectableComponent';

import styles from './Header.module.scss';

export const HeaderIdentifier = Symbol(`HEADER`);

type TypeHeader = 'static' | 'fixed';

export type HeaderProps = {
  headerType?: TypeHeader;
  className?: string;
  searchActive: boolean;
};

const Header = ({ children, className, headerType = 'static', searchActive }: PropsWithChildren<HeaderProps>) => {
  const headerClassName = classNames(styles.header, styles[headerType], className, {
    [styles.searchActive]: searchActive,
  });

  return (
    <header className={headerClassName}>
      <div className={styles.container}>{children}</div>
    </header>
  );
};

export default createInjectableComponent(HeaderIdentifier, Header);
