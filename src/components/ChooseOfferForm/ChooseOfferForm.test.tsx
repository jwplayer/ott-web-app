import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import monthlyOffer from '../../fixtures/monthlyOffer.json';
import yearlyOffer from '../../fixtures/yearlyOffer.json';
import tvodOffer from '../../fixtures/tvodOffer.json';
import type { Offer } from '../../../types/checkout';

import ChooseOfferForm from './ChooseOfferForm';

describe('<OffersForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <ChooseOfferForm
        values={{ offerId: 'S916977979_NL' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        monthlyOffer={monthlyOffer as Offer}
        yearlyOffer={yearlyOffer as Offer}
        tvodOffers={[tvodOffer as Offer]}
        offerType={'svod'}
        setOfferType={vi.fn()}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot', () => {
    const { container } = render(
      <ChooseOfferForm
        values={{ offerId: 'R892134629_NL' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        monthlyOffer={monthlyOffer as Offer}
        yearlyOffer={yearlyOffer as Offer}
        tvodOffers={[tvodOffer as Offer]}
        offerType={'tvod'}
        setOfferType={vi.fn()}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('checks the monthly offer correctly', () => {
    const { getByLabelText } = render(
      <ChooseOfferForm
        values={{ offerId: 'S916977979_NL' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        monthlyOffer={monthlyOffer as Offer}
        yearlyOffer={yearlyOffer as Offer}
        tvodOffers={[tvodOffer as Offer]}
        offerType={'svod'}
        setOfferType={vi.fn()}
      />,
    );

    expect(getByLabelText('choose_offer.monthly_subscription')).toBeChecked();
  });

  test('checks the yearly offer correctly', () => {
    const { getByLabelText } = render(
      <ChooseOfferForm
        values={{ offerId: 'S345569153_NL' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        monthlyOffer={monthlyOffer as Offer}
        yearlyOffer={yearlyOffer as Offer}
        tvodOffers={[tvodOffer as Offer]}
        offerType={'svod'}
        setOfferType={vi.fn()}
      />,
    );

    expect(getByLabelText('choose_offer.yearly_subscription')).toBeChecked();
  });

  test('checks the tvod offer correctly', () => {
    const { getByLabelText } = render(
      <ChooseOfferForm
        values={{ offerId: 'R892134629_NL' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        monthlyOffer={monthlyOffer as Offer}
        yearlyOffer={yearlyOffer as Offer}
        tvodOffers={[tvodOffer as Offer]}
        offerType={'tvod'}
        setOfferType={vi.fn()}
      />,
    );

    expect(getByLabelText('One Time - TVOD offer')).toBeChecked();
  });

  test('calls the onChange callback when changing the offer', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <ChooseOfferForm
        values={{ offerId: 'S916977979_NL' }}
        errors={{}}
        onChange={onChange}
        onSubmit={vi.fn()}
        submitting={false}
        monthlyOffer={monthlyOffer as Offer}
        yearlyOffer={yearlyOffer as Offer}
        tvodOffers={[tvodOffer as Offer]}
        offerType={'svod'}
        setOfferType={vi.fn()}
      />,
    );

    fireEvent.click(getByLabelText('choose_offer.yearly_subscription'));

    expect(onChange).toBeCalled();
  });

  test('calls the onSubmit callback when submitting the form', () => {
    const onSubmit = vi.fn();
    const { getByTestId } = render(
      <ChooseOfferForm
        values={{ offerId: 'S916977979_NL' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        submitting={false}
        monthlyOffer={monthlyOffer as Offer}
        yearlyOffer={yearlyOffer as Offer}
        tvodOffers={[tvodOffer as Offer]}
        offerType={'svod'}
        setOfferType={vi.fn()}
      />,
    );

    fireEvent.submit(getByTestId('choose-offer-form'));

    expect(onSubmit).toBeCalled();
  });
});
