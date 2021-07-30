import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';

import Welcome from './Welcome';

describe('<Welcome>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Welcome />);

    expect(container).toMatchSnapshot();
  });

  test('calls the onCloseButtonClick callback when clicking the close button', () => {
    const onCloseButtonClick = jest.fn();
    const { getByText } = render(<Welcome onCloseButtonClick={onCloseButtonClick} />);

    fireEvent.click(getByText('checkout.start_watching'));

    expect(onCloseButtonClick).toBeCalled();
  });

  test('calls the onCloseButtonClick callback when clicking the close button', () => {
    jest.useFakeTimers();
    const onCountdownCompleted = jest.fn();

    render(<Welcome onCountdownCompleted={onCountdownCompleted} />);

    let i = 10;
    while(i--) {
      act(() => {
        jest.runAllTimers()
      });
    }

    expect(onCountdownCompleted).toBeCalled();
    jest.useRealTimers();
  });
});
