import * as React from 'react';
import { render } from '@testing-library/react';

import Card from './Card';

describe('<Card>', () => {
  it('renders card', () => {
    const { getByText } = render(<Card title="aa" duration={120} />);
    const card = getByText(/card/i);
    expect(card).toBeTruthy();
  });
});
