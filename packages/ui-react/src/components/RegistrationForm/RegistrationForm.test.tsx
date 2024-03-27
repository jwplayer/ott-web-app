import React from 'react';

import { renderWithRouter } from '../../../test/utils';

import RegistrationForm from './RegistrationForm';

describe('<RegistrationForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(
      <RegistrationForm
        publisherConsents={null}
        onSubmit={vi.fn()}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        values={{ email: '', password: '' }}
        errors={{}}
        submitting={false}
        consentErrors={[]}
        consentValues={{}}
        loading={false}
        onConsentChange={vi.fn()}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
