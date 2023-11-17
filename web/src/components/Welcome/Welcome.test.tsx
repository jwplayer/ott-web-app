import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';

import Welcome from './Welcome';

describe('<Welcome>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Welcome siteName="Sitename!" />);

    expect(container).toMatchSnapshot();
  });

  test('calls the onCloseButtonClick callback when clicking the close button', () => {
    const onCloseButtonClick = vi.fn();
    const { getByText } = render(<Welcome onCloseButtonClick={onCloseButtonClick} siteName="Sitename!" />);

    fireEvent.click(getByText('checkout.start_watching'));

    expect(onCloseButtonClick).toBeCalled();
  });

  test('calls the onCloseButtonClick callback when clicking the close button', () => {
    vi.useFakeTimers();
    const onCountdownCompleted = vi.fn();

    render(<Welcome onCountdownCompleted={onCountdownCompleted} siteName="Sitename!" />);

    let i = 10;
    while (i--) {
      act(() => {
        vi.runAllTimers();
      });
    }

    expect(onCountdownCompleted).toBeCalled();
    vi.useRealTimers();
  });
});
