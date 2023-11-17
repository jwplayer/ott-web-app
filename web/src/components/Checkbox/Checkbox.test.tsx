import React from 'react';
import { render } from '@testing-library/react';

import Checkbox from './Checkbox';

describe('<Checkbox>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Checkbox label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('should set the checked state', () => {
    const { getByLabelText } = render(<Checkbox label="label" name="name" value="value" checked={true} onChange={vi.fn()} />);

    expect(getByLabelText('label')).toBeChecked();
  });
});
