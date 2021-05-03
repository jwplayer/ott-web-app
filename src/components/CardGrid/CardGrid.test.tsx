import * as React from 'react';
import { render } from '@testing-library/react';

import CardGrid from './CardGrid';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

describe('<CardGrid>', () => {
  it('renders card grid and children', () => {
    const { getByText } = render((<CardGrid>aa</CardGrid>));
    const cardGrid = getByText(/aa/i);
    expect(document.body.contains(cardGrid));
  });
});
