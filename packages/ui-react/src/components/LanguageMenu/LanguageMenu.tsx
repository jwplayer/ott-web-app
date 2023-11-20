import React from 'react';
import classNames from 'classnames';
import type { LanguageDefinition } from '@jwp/ott-common/types/i18n';

import Link from '../Link/Link';

import styles from './LanguageMenu.module.scss';

type Props = {
  onClick?: (code: string) => void;
  languages: LanguageDefinition[];
  currentLanguage: LanguageDefinition | undefined;
};

const LanguageMenu = ({ onClick, languages, currentLanguage }: Props) => {
  return (
    <ul className={styles.menuItems}>
      {languages.map(({ code, displayName }) => (
        <li key={code} className={classNames(styles.menuItem, { [styles.menuItemActive]: currentLanguage?.code === code })}>
          <Link onClick={() => onClick?.(code)}>{displayName}</Link>
        </li>
      ))}
    </ul>
  );
};

export default LanguageMenu;
