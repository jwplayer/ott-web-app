import type { LanguageDefinition } from '@jwp/ott-common/types/i18n';
import classNames from 'classnames';
import { type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { testId } from '@jwp/ott-common/src/utils/common';
import Language from '@jwp/ott-theme/assets/icons/language.svg?react';

import Link from '../Link/Link';
import Panel from '../Panel/Panel';
import Popover from '../Popover/Popover';
import Icon from '../Icon/Icon';
import HeaderActionButton from '../Header/HeaderActionButton';

import styles from './LanguageMenu.module.scss';

type Props = {
  onClick: (code: string) => void | null;
  className?: string;
  languages: LanguageDefinition[];
  currentLanguage: LanguageDefinition | undefined;
  languageMenuOpen: boolean;
  openLanguageMenu: () => void;
  closeLanguageMenu: () => void;
};

const LanguageMenu = ({ onClick, className, languages, currentLanguage, languageMenuOpen, closeLanguageMenu, openLanguageMenu }: Props) => {
  const { t } = useTranslation('menu');

  const handleLanguageSelect = (event: MouseEvent<HTMLElement>, code: string) => {
    event.preventDefault();
    onClick?.(code);

    closeLanguageMenu();
  };

  const handleMenuToggle = () => {
    if (languageMenuOpen) {
      closeLanguageMenu();
    } else {
      openLanguageMenu();
    }
  };

  return (
    <div>
      <HeaderActionButton
        data-testid={testId('language-menu-button')}
        aria-controls="language-panel"
        aria-expanded={languageMenuOpen}
        aria-haspopup="menu"
        className={className}
        aria-label={t('language_menu')}
        onClick={handleMenuToggle}
        onBlur={closeLanguageMenu}
      >
        <Icon icon={Language} />
      </HeaderActionButton>
      <Popover isOpen={languageMenuOpen} onClose={closeLanguageMenu}>
        <Panel id="language-panel">
          <ul className={styles.menuItems}>
            {languages.map(({ code, displayName }) => {
              const isActive = currentLanguage?.code === code;
              const menuItemClassname = classNames(styles.menuItem, { [styles.menuItemActive]: isActive });
              return (
                <li key={code} className={menuItemClassname} onClick={(event) => handleLanguageSelect(event, code)}>
                  <Link onFocus={openLanguageMenu} onBlur={closeLanguageMenu} href="#" aria-current={isActive}>
                    {displayName}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      </Popover>
    </div>
  );
};

export default LanguageMenu;
