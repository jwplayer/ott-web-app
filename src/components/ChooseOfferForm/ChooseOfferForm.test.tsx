import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import monthlyOffer from '../../fixtures/monthlyOffer.json';
import yearlyOffer from '../../fixtures/yearlyOffer.json';
import type { Offer } from '../../../types/checkout';

import ChooseOfferForm from './ChooseOfferForm';

describe('<OffersForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <ChooseOfferForm
        values={{ periodicity: 'monthly' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        monthlyOffer={monthlyOffer as Offer}
        yearlyOffer={yearlyOffer as Offer}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('checks the monthly offer correctly', () => {
    const { getByLabelText } = render(
      <ChooseOfferForm
        values={{ periodicity: 'monthly' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        monthlyOffer={monthlyOffer as Offer}
        yearlyOffer={yearlyOffer as Offer}
      />,
    );

    expect(getByLabelText('choose_offer.monthly_subscription')).toBeChecked();
  });

  test('checks the yearly offer correctly', () => {
    const { getByLabelText } = render(
      <ChooseOfferForm
        values={{ periodicity: 'yearly' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        monthlyOffer={monthlyOffer as Offer}
        yearlyOffer={yearlyOffer as Offer}
      />,
    );

    expect(getByLabelText('choose_offer.yearly_subscription')).toBeChecked();
  });

  test('calls the onChange callback when changing the offer', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <ChooseOfferForm
        values={{ periodicity: 'monthly' }}
        errors={{}}
        onChange={onChange}
        onSubmit={vi.fn()}
        submitting={false}
        monthlyOffer={monthlyOffer as Offer}
        yearlyOffer={yearlyOffer as Offer}
      />,
    );

    fireEvent.click(getByLabelText('choose_offer.yearly_subscription'));

    expect(onChange).toBeCalled();
  });

  test('calls the onSubmit callback when submitting the form', () => {
    const onSubmit = vi.fn();
    const { getByTestId } = render(
      <ChooseOfferForm
        values={{ periodicity: 'monthly' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        submitting={false}
        monthlyOffer={monthlyOffer as Offer}
        yearlyOffer={yearlyOffer as Offer}
      />,
    );

    fireEvent.submit(getByTestId('choose-offer-form'));

    expect(onSubmit).toBeCalled();
  });
});
