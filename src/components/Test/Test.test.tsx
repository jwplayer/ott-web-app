import * as React from 'react';
import { render } from '@testing-library/react';

import Test from './Test';

describe('<Test>', () => {
  it('renders test', () => {
    const { getByText } = render(<Test />);
    const test = getByText(/Test/i);
    expect(document.body.contains(test));
  });
});
