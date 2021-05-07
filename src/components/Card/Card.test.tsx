import * as React from 'react';
import { render } from '@testing-library/react';

import Card from './Card';

describe('<Card>', () => {
  it('renders card with video title', () => {
    const { getByText } = render(<Card title="aa" duration={120} onClick={() => ''} />);
    expect(getByText(/aa/i)).toBeTruthy();
  });

  it('renders tag with correct duration', () => {
    const { getByText } = render(<Card title="aa" duration={120} onClick={() => ''} />);
    expect(getByText(/2/i)).toBeTruthy();
  });
});
