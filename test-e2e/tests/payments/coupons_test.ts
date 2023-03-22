import { LoginContext } from '#utils/password_utils';
import constants from '#utils/constants';
import { goToCheckout, formatPrice, finishAndCheckSubscription, addYear, cancelPlan, renewPlan } from '#utils/payments';
import { testConfigs } from '#test/constants';

const context: { [key: string]: LoginContext } = {};

const today = new Date();

const configs = new DataTable([
  'config',
  'monthlyOffer',
  'yearlyOffer',
  'paymentFields',
  'creditCard',
  'creditCardNamePresent',
  'applicableTax',
  'locale',
  'shouldMakePayment',
  'canRenewSubscription',
]);

// cleeng integration
configs.add([
  testConfigs.svod,
  constants.offers.monthlyOffer.cleeng,
  constants.offers.yearlyOffer.cleeng,
  constants.paymentFields.cleeng,
  constants.creditCard.cleeng,
  false,
  2.17,
  'NL',
  false,
  true,
]);

// inplayer integration
configs.add([
  testConfigs.jwpSvod,
  constants.offers.monthlyOffer.inplayer,
  constants.offers.yearlyOffer.inplayer,
  constants.paymentFields.inplayer,
  constants.creditCard.inplayer,
  true,
  0,
  undefined,
  true,
  false,
]);

// This is written as a second test suite so that the login context is a different user.
// Otherwise there's no way to re-enter payment info and add a coupon code
Feature('payments-coupon').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Data(configs).Scenario('I can redeem coupons', async ({ I, current }) => {
  await I.beforeSubscription(current.config);

  context[current.config.label] = await I.registerOrLogin(context[current.config.label]);

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

  I.see(formatPrice(-37.5, 'EUR', current.locale));
  I.see(formatPrice(12.5, 'EUR', current.locale));
  I.see(formatPrice(current.applicableTax, 'EUR', current.locale));

  I.fillField('couponCode', 'test100');
  I.click('Apply');
  I.waitForLoaderDone();
  I.see(formatPrice(0, 'EUR', current.locale));

  if (current.shouldMakePayment) {
    I.payWithCreditCard(
      current.creditCardNamePresent,
      current.creditCard,
      current.paymentFields.cardNumber,
      current.paymentFields.expiryDate,
      current.paymentFields.securityCode,
      '',
    );
  }

  await finishAndCheckSubscription(I, addYear(today), today, current.yearlyOffer.price);
});

Data(configs).Scenario('I can cancel a free subscription', async ({ I, current }) => {
  await I.beforeSubscription(current.config);
  context[current.config.label] = await I.registerOrLogin(context[current.config.label]);
  cancelPlan(I, addYear(today), current.canRenewSubscription);
});

Data(configs).Scenario('I can renew a free subscription', async ({ I, current }) => {
  if (current.canRenewSubscription) {
    await I.beforeSubscription(current.config);
    context[current.config.label] = await I.registerOrLogin(context[current.config.label]);
    renewPlan(I, addYear(today), current.yearlyOffer.price);
  }
});
