import React from 'react';
import { render } from '@testing-library/react';

import PersonalDetailsForm from './PersonalDetailsForm';

describe.skip('<PersonalDetailsForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<PersonalDetailsForm />);

    expect(container).toMatchSnapshot();
  });
});
