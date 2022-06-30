import { LoginContext } from '../utils/password_utils';
import constants from '../utils/constants';

let paidLoginContext: LoginContext;
let couponLoginContext: LoginContext;

const today = new Date();

const monthlyPrice = formatPrice(6.99);
const yearlyPrice = formatPrice(50);

const cardInfo = Array.of('Card number', '•••• •••• •••• 1111', 'Expiry date', '03/2030', 'CVC / CVV', '******');

Feature('payments');

Before(async ({ I }) => {
  // This gets used in checkoutService.getOffer to make sure the offers are geolocated for NL
  overrideIP(I);

  I.useConfig('test--subscription');
  paidLoginContext = await I.registerOrLogin(paidLoginContext);
});

Scenario('I can see my payments data', async ({ I }) => {
  await I.openMainMenu();

  I.click('Payments');
  I.see('Subscription details');
  I.see('You have no subscription. Complete your subscription to start watching all movies and series.');
  I.see('Complete subscription');

  I.see('Payment method');
  I.see('No payment methods');

  I.see('Transactions');
  I.see('No transactions');
});

Scenario('I can see offered subscriptions', async ({ I }) => {
  I.amOnPage(constants.paymentsUrl);

  I.click('Complete subscription');
  I.see('Subscription');
  I.see('All movies and series of Blender');

  await within('label[for="monthly"]', () => {
    I.see('Monthly');
    I.see('First month free');
    I.see('Cancel anytime');
    I.see('Watch on all devices');
    I.see(monthlyPrice);
    I.see('/month');
  });

  await within('label[for="yearly"]', () => {
    I.see('Yearly');
    I.see('First 14 days free');
    I.see('Cancel anytime');
    I.see('Watch on all devices');
    I.see(yearlyPrice);
    I.see('/year');
  });

  I.see('Continue');
});

Scenario('I can choose an offer', ({ I }) => {
  I.amOnPage(constants.offersUrl);

  I.click('label[for="monthly"]');
  I.seeCssPropertiesOnElements('label[for="monthly"]', { color: '#000000' });
  I.seeCssPropertiesOnElements('label[for="yearly"]', { color: '#ffffff' });

  I.click('label[for="yearly"]');
  I.seeCssPropertiesOnElements('label[for="monthly"]', { color: '#ffffff' });
  I.seeCssPropertiesOnElements('label[for="yearly"]', { color: '#000000' });

  I.click('Continue');
  I.waitForLoaderDone();

  I.see('Yearly subscription');
  I.see('You will be charged after 14 days.');
  I.see(yearlyPrice);
  I.see('/year');

  I.see('Redeem coupon');
  I.see('Free trial');
  I.see(formatPrice(-50));
  I.see('Payment method fee');
  I.see(formatPrice(0));
  I.see('Total');
  I.see('Applicable tax (21%)');
  I.clickCloseButton();
});

Scenario('I can see payment types', ({ I }) => {
  goToCheckout(I);

  I.see('Credit Card');
  I.see('PayPal');

  I.see('Card number');
  I.see('Expiry date');
  I.see('CVC / CVV');
  I.see('Continue');
  I.dontSee("Clicking 'continue' will bring you to the PayPal site.");

  I.click('PayPal');

  I.see("Clicking 'continue' will bring you to the PayPal site.");
  I.dontSee('Card number');
  I.dontSee('Expiry date');
  I.dontSee('CVC / CVV');
  I.see('Continue');
});

Scenario('I can open the PayPal site', ({ I }) => {
  goToCheckout(I);

  I.click('PayPal');
  I.click('Continue');

  I.waitInUrl('paypal.com', 15);
  // I'm sorry, I don't know why, but this test ends in a way that causes the next test to fail
  I.amOnPage(constants.baseUrl);
});

Scenario('I can finish my subscription', ({ I }) => {
  goToCheckout(I);

  I.see('Credit Card');

  // Adyen credit card form is loaded asynchronously, so wait for it
  I.waitForElement('[class*=adyen-checkout__field--cardNumber]', 5);

  // Each of the 3 credit card fields is a separate iframe
  I.switchTo('[class*="adyen-checkout__field--cardNumber"] iframe');
  I.fillField('Card number', '5555444433331111');
  I.switchTo(null); // Exit the iframe context back to the main document

  I.switchTo('[class*="adyen-checkout__field--expiryDate"] iframe');
  I.fillField('Expiry date', '03/30');
  I.switchTo(null); // Exit the iframe context back to the main document

  I.switchTo('[class*="adyen-checkout__field--securityCode"] iframe');
  I.fillField('Security code', '737');
  I.switchTo(null); // Exit the iframe context back to the main document

  finishAndCheckSubscription(I, addDays(today, 14));

  I.seeAll(cardInfo);
});

Scenario('I can cancel my subscription', ({ I }) => {
  cancelPlan(I, addDays(today, 14));

  // Still see payment info
  I.seeAll(cardInfo);
});

Scenario('I can renew my subscription', ({ I }) => {
  renewPlan(I, addDays(today, 14));
});

// This is written as a second test suite so that the login context is a different user.
// Otherwise there's no way to re-enter payment info and add a coupon code
Feature('payments-coupon');

Before(async ({ I }) => {
  // This gets used in checkoutService.getOffer to make sure the offers are geolocated for NL
  overrideIP(I);

  I.useConfig('test--subscription');

  couponLoginContext = await I.registerOrLogin(couponLoginContext);
});

Scenario('I can redeem coupons', async ({ I }) => {
  goToCheckout(I);

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
  I.see('No payment needed');
  I.dontSee(formatPrice(12.5));

  finishAndCheckSubscription(I, addYear(today));

  I.see('No payment methods');
});

Scenario('I can cancel a free subscription', async ({ I }) => {
  cancelPlan(I, addYear(today));

  I.see('No payment methods');
});

Scenario('I can renew a free subscription', ({ I }) => {
  renewPlan(I, addYear(today));
});

function goToCheckout(I: CodeceptJS.I) {
  I.amOnPage(constants.offersUrl);

  I.click('Continue');
  I.waitForLoaderDone();
}

function formatPrice(price: number) {
  // eslint-disable-next-line no-irregular-whitespace
  return `€ ${price.toFixed(2).replace('.', ',')}`;
}

function addDays(date: Date, days: number) {
  const newDate = new Date(date.valueOf());
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

function addYear(date: Date) {
  const newDate = new Date(date.valueOf());
  newDate.setFullYear(newDate.getFullYear() + 1);
  return newDate;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US');
}

function finishAndCheckSubscription(I: CodeceptJS.I, billingDate: Date) {
  I.click('Continue');
  I.waitForLoaderDone(15);
  I.see('Welcome to Blender');
  I.see('Thank you for subscribing to Blender. Please enjoy all our content.');

  I.click('Start watching');

  I.waitForLoaderDone();
  I.see('Annual subscription');
  I.see(yearlyPrice);
  I.see('/year');
  I.see('Next billing date is on ' + formatDate(billingDate));
  I.see('Cancel subscription');

  I.see('Annual subscription (recurring) to JW Player');
  I.see(formatPrice(0) + ' payed with card');
  I.see(formatDate(today));
}

function cancelPlan(I: CodeceptJS.I, expirationDate: Date) {
  I.amOnPage(constants.paymentsUrl);
  I.click('Cancel subscription');
  I.see('We are sorry to see you go.');
  I.see('You will be unsubscribed from your current plan by clicking the unsubscribe button below.');
  I.see('Unsubscribe');
  // Make sure the cancel button works
  I.click('No, thanks');

  I.dontSee('This plan will expire');

  I.click('Cancel subscription');
  I.click('Unsubscribe');
  I.waitForLoaderDone(10);
  I.see('Miss you already.');
  I.see('You have been successfully unsubscribed. Your current plan will expire on ' + formatDate(expirationDate));
  I.click('Return to profile');
  I.see('Renew subscription');
  I.see('This plan will expire on ' + formatDate(expirationDate));
}

function renewPlan(I: CodeceptJS.I, billingDate: Date) {
  I.amOnPage(constants.paymentsUrl);
  I.click('Renew subscription');
  I.see('Renew your subscription');
  I.see('By clicking the button below you can renew your plan.');
  I.see('Annual subscription (recurring) to JW Player');
  I.see('Next billing date will be ' + formatDate(billingDate));
  I.see(yearlyPrice);
  I.see('/year');

  I.click('No, thanks');
  I.see('Renew subscription');

  I.click('Renew subscription');

  I.click('Renew subscription', '[class*=_dialog]');
  I.waitForLoaderDone(10);
  I.see('Your subscription has been renewed');
  I.see(`You have been successfully resubscribed. Your fee will be ${yearlyPrice} starting from ${formatDate(billingDate)}`);
  I.click('Back to profile');

  I.see('Annual subscription');
  I.see('Next billing date is on');
  I.see('Cancel subscription');
}

function overrideIP(I: CodeceptJS.I) {
  // Set this as a cookie so it persists between page navigations (local storage would also work, but the permissions don't work)
  I.setCookie({ name: 'overrideIP', value: '101.33.29.0', domain: 'localhost', path: '/' });
}
