import React from 'react';
import { fireEvent } from '@testing-library/react';

import LanguageMenu from './LanguageMenu';

import { renderWithRouter } from '#test/testUtils';

const languages = [
  {
    displayName: 'English',
    code: 'en',
  },
  {
    displayName: 'español',
    code: 'es',
  },
];

describe('<LanguageMenu>', () => {
  test('renders and matches snapshot', () => {
    const currentLanguage = languages[1];
    const { container } = renderWithRouter(<LanguageMenu languages={languages} currentLanguage={currentLanguage} onClick={() => undefined} />);

    expect(container).toMatchSnapshot();
  });

  test('shows all languages in the menu', () => {
    const currentLanguage = languages[1];
    const { queryByText } = renderWithRouter(<LanguageMenu languages={languages} currentLanguage={currentLanguage} onClick={() => undefined} />);

    expect(queryByText('English')).toBeInTheDocument();
    expect(queryByText('español')).toBeInTheDocument();
  });

  test('renders languages and calls the onClick callback with the correct language code', () => {
    const currentLanguage = languages[1];
    const callback = vi.fn();
    const { getByText } = renderWithRouter(<LanguageMenu languages={languages} currentLanguage={currentLanguage} onClick={callback} />);

    fireEvent.click(getByText('English'));

    expect(callback).toBeCalledWith('en');
  });
});
