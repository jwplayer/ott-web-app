import React from 'react';

import { render } from '../../testUtils';

import ConfirmationForm from './ConfirmationForm';

describe('<ConfirmationForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<ConfirmationForm onBackToLogin={jest.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
