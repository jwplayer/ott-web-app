import React from 'react';
import { render } from '@testing-library/react';

import EditPasswordForm from './EditPasswordForm';

describe('<EditPasswordForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <EditPasswordForm submitting={false} onSubmit={jest.fn()} onChange={jest.fn()} value={{ password: '' }} errors={{}} />,
    );

    expect(container).toMatchSnapshot();
  });
});
