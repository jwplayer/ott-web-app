import React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import CookieBanner from './CookieBanner';

describe('<CookieBanner>', () => {
  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(<CookieBanner onAccept={vi.fn()} onDecline={vi.fn()} />);

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
