import { LoginContext } from '#utils/password_utils';
import { overrideIP, goToCheckout, formatPrice, finishAndCheckSubscription, addYear, cancelPlan, renewPlan } from '#utils/payments';
import { testConfigs } from '#test/constants';

let couponLoginContext: LoginContext;

const today = new Date();

// This is written as a second test suite so that the login context is a different user.
// Otherwise there's no way to re-enter payment info and add a coupon code
Feature('payments-coupon').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(async ({ I }) => {
  // This gets used in checkoutService.getOffer to make sure the offers are geolocated for NL
  overrideIP(I);
  I.useConfig(testConfigs.svod);
});

Scenario('I can redeem coupons', async ({ I }) => {
  couponLoginContext = await I.registerOrLogin(couponLoginContext);

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
  I.see(formatPrice(-37.5));
  I.see(formatPrice(12.5));
  I.see(formatPrice(2.17));

  I.fillField('couponCode', 'test100');
  I.click('Apply');
  I.waitForLoaderDone();
  I.dontSee(formatPrice(12.5));

  await finishAndCheckSubscription(I, addYear(today), today);
});

Scenario('I can cancel a free subscription', async ({ I }) => {
  couponLoginContext = await I.registerOrLogin(couponLoginContext);

  cancelPlan(I, addYear(today));
});

Scenario('I can renew a free subscription', async ({ I }) => {
  couponLoginContext = await I.registerOrLogin(couponLoginContext);

  renewPlan(I, addYear(today));
});
