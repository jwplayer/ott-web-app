import React from 'react';

import { renderWithRouter } from '../../../test/testUtils';

import ConfirmationForm from './ConfirmationForm';

describe('<ConfirmationForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<ConfirmationForm onBackToLogin={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
