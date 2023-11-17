import { LoginContext } from '#utils/password_utils';
import constants from '#utils/constants';
import { goToCheckout, formatPrice, finishAndCheckSubscription, addYear, cancelPlan, renewPlan, overrideIP } from '#utils/payments';
import { testConfigs } from '#test/constants';
import { ProviderProps } from '#test/types';

const jwProps: ProviderProps = {
  config: testConfigs.jwpSvod,
  monthlyOffer: constants.offers.monthlyOffer.inplayer,
  yearlyOffer: constants.offers.yearlyOffer.inplayer,
  paymentFields: constants.paymentFields.inplayer,
  creditCard: constants.creditCard.inplayer,
  applicableTax: 0,
  locale: undefined,
  shouldMakePayment: true,
  canRenewSubscription: false,
  hasInlineOfferSwitch: true,
};

const cleengProps: ProviderProps = {
  config: testConfigs.svod,
  monthlyOffer: constants.offers.monthlyOffer.cleeng,
  yearlyOffer: constants.offers.yearlyOffer.cleeng,
  paymentFields: constants.paymentFields.cleeng,
  creditCard: constants.creditCard.cleeng,
  applicableTax: 2.17,
  locale: 'NL',
  shouldMakePayment: false,
  canRenewSubscription: true,
  hasInlineOfferSwitch: false,
};

runTestSuite(jwProps, 'JW Player');
runTestSuite(cleengProps, 'Cleeng');

function runTestSuite(props: ProviderProps, providerName: string) {
  let couponLoginContext: LoginContext;

  const today = new Date();

  // This is written as a second test suite so that the login context is a different user.
  // Otherwise, there's no way to re-enter payment info and add a coupon code
  Feature(`payments-coupon - ${providerName}`).retry(Number(process.env.TEST_RETRY_COUNT) || 0);

  Before(async ({ I }) => {
    // This gets used in checkoutService.getOffer to make sure the offers are geolocated for NL
    overrideIP(I);
    I.useConfig(props.config);
    couponLoginContext = await I.registerOrLogin(couponLoginContext);
  });

  Scenario(`I can redeem coupons - ${providerName}`, async ({ I }) => {
    await goToCheckout(I);

    I.click('Redeem coupon');
    I.seeElement('input[name="couponCode"]');
    I.see('Apply');

    I.click('div[aria-label="Close coupon form"]');
    I.dontSee('Coupon code');

    I.click('Redeem coupon');
    I.fillField('couponCode', 'test75');
    I.click('Apply');
    I.waitForLoaderDone();
    I.see('Your coupon code has been applied');

    I.see(formatPrice(-37.5, 'EUR', props.locale));
    I.see(formatPrice(12.5, 'EUR', props.locale));
    if (props.applicableTax !== 0) {
      I.see(formatPrice(props.applicableTax, 'EUR', props.locale));
    }

    I.fillField('couponCode', 'test100');
    I.click('Apply');
    I.waitForLoaderDone();
    I.see(formatPrice(0, 'EUR', props.locale));

    if (props.shouldMakePayment) {
      await I.payWithCreditCard(
        props.paymentFields.creditCardholder,
        props.creditCard,
        props.paymentFields.cardNumber,
        props.paymentFields.expiryDate,
        props.paymentFields.securityCode,
        '',
      );
    }

    await finishAndCheckSubscription(I, addYear(today), today, props.yearlyOffer.price, props.hasInlineOfferSwitch);
  });

  Scenario(`I can cancel a free subscription - ${providerName}`, async ({ I }) => {
    cancelPlan(I, addYear(today), props.canRenewSubscription, providerName);
  });

  Scenario(`I can renew a free subscription - ${providerName}`, async ({ I }) => {
    if (props.canRenewSubscription) {
      renewPlan(I, addYear(today), props.yearlyOffer.price);
    } else {
      I.say(`Provider ${providerName} does not support renewal. Skipping test...`);
    }
  });
}
