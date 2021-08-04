import React from 'react';

import { render } from '../../testUtils';

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
        canSubmit={true}
        onConsentChange={jest.fn()}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
