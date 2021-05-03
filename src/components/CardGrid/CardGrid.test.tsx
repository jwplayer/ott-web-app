import * as React from 'react';
import { render } from '@testing-library/react';

import './matchMedia.mock';
import CardGrid from './CardGrid';

describe('<CardGrid>', () => {
  it('renders card grid and children', () => {
    const { getByText } = render((<CardGrid>aa</CardGrid>));
    const cardGrid = getByText(/aa/i);
    expect(document.body.contains(cardGrid));
  });
});
