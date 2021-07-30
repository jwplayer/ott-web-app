import React from 'react';
import { render } from '@testing-library/react';

import RegistrationForm from './RegistrationForm';

describe('<RegistrationForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <RegistrationForm
        onSubmit={jest.fn()}
        onChange={jest.fn()}
        values={{ email: '', password: '' }}
        errors={{}}
        submitting={false}
        consentErrors={[]}
        consentValues={{}}
        loading={false}
        onConsentChange={jest.fn()}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
