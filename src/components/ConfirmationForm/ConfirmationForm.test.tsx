import React from 'react';

import ConfirmationForm from './ConfirmationForm';

import { renderWithRouter } from '#test/testUtils';

describe('<ConfirmationForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<ConfirmationForm onBackToLogin={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
