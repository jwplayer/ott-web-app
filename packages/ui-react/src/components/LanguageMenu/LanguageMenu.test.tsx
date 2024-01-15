import { cleanup, fireEvent, render } from '@testing-library/react';
import type { LanguageDefinition } from '@jwp/ott-common/types/i18n';

import LanguageMenu from './LanguageMenu';

const languages = [
  { displayName: 'English', code: 'en' },
  { displayName: 'español', code: 'es' },
];

const onClickCb = vi.fn();
const openLanguageMenuCb = vi.fn();
const closeLanguageMenuCb = vi.fn();

describe('<LanguageMenu>', () => {
  afterEach(() => {
    onClickCb.mockClear();
    openLanguageMenuCb.mockClear();
    closeLanguageMenuCb.mockClear();
    cleanup();
  });

  const renderLanguageMenu = (currentLanguage: LanguageDefinition, languageMenuOpen: boolean) => {
    return render(
      <LanguageMenu
        languages={languages}
        currentLanguage={currentLanguage}
        onClick={onClickCb}
        languageMenuOpen={languageMenuOpen}
        openLanguageMenu={openLanguageMenuCb}
        closeLanguageMenu={closeLanguageMenuCb}
      />,
    );
  };

  test('renders and matches snapshot', () => {
    const { container } = renderLanguageMenu(languages[0], false);
    expect(container).toMatchSnapshot();
  });

  test('Renders the correct items in the LanguageMenu', () => {
    const { queryByText } = renderLanguageMenu(languages[0], true);

    expect(queryByText(languages[0].displayName)).toBeInTheDocument();
    expect(queryByText(languages[1].displayName)).toBeInTheDocument();
  });

  test('Check if the correct language item is selected onclick', () => {
    const { getByText } = renderLanguageMenu(languages[0], true);
    fireEvent.click(getByText(languages[0].displayName));
    expect(onClickCb).toHaveBeenCalledWith(languages[0].code);
  });
});
