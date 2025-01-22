import React from 'react';
import { axe } from 'vitest-axe';
import AccountCircle from '@jwp/ott-theme/assets/icons/account_circle.svg?react';
import 'vitest-axe/extend-expect';

import { renderWithRouter } from '../../../test/utils';
import Icon from '../Icon/Icon';

import Button from './Button';

describe('<Button>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(
      <>
        <Button label="Default button" />
        <Button label="Active button" active />
        <Button label="Disabled button" disabled />
        <Button label="Busy button" busy />
        <Button label="Small button" size="small" />
        <Button label="Large button" size="large" />
        <Button label="Full width button" fullWidth />
        <Button label="With start icon" startIcon={<Icon icon={AccountCircle} />} />
        <Button label="Button link" to="https://jwplayer.com" />
      </>,
    );

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = renderWithRouter(
      <>
        <Button label="Default button" />
        <Button label="Active button" active />
        <Button label="Disabled button" disabled />
        <Button label="Busy button" busy />
        <Button label="Small button" size="small" />
        <Button label="Large button" size="large" />
        <Button label="Full width button" fullWidth />
        <Button label="With start icon" startIcon={<Icon icon={AccountCircle} />} />
        <Button label="Button link" to="https://jwplayer.com" fullWidth />
      </>,
    );

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
