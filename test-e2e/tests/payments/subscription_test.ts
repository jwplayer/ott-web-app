import { LoginContext } from '#utils/password_utils';
import constants, { longTimeout, normalTimeout } from '#utils/constants';
import { overrideIP, goToCheckout, formatPrice, finishAndCheckSubscription, cancelPlan, renewPlan, addDays } from '#utils/payments';
import { testConfigs } from '#test/constants';

let paidLoginContext: LoginContext;

const today = new Date();

const monthlyPrice = formatPrice(6.99);
const yearlyPrice = formatPrice(50);

const monthlyLabel = `label[for="S970187168_NL"]`;
const yearlyLabel = `label[for="S467691538_NL"]`;

const cardInfo = Array.of('Card number', '•••• •••• •••• 1111', 'Expiry date', '03/2030', 'CVC / CVV', '******');

Feature('payments').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(async ({ I }) => {
  // This gets used in checkoutService.getOffer to make sure the offers are geolocated for NL
  overrideIP(I);
  I.useConfig(testConfigs.svod);
});

Scenario('I can see my payments data', async ({ I }) => {
  paidLoginContext = await I.registerOrLogin(paidLoginContext);

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
  paidLoginContext = await I.registerOrLogin(paidLoginContext);

  I.amOnPage(constants.paymentsUrl);

  I.click('Complete subscription');
  I.see('Choose plan');
  I.see('Watch this on JW OTT Web App');

  await within(monthlyLabel, () => {
    I.see('Monthly');
    I.see('First month free');
    I.see('Cancel anytime');
    I.see('Watch on all devices');
    I.see(monthlyPrice);
    I.see('/month');
  });

  await within(yearlyLabel, () => {
    I.see('Cancel anytime');
    I.see('Watch on all devices');
    I.see(yearlyPrice);
    I.see('/year');
  });

  I.see('Continue');
});

Scenario('I can choose an offer', async ({ I }) => {
  paidLoginContext = await I.registerOrLogin(paidLoginContext);

  I.amOnPage(constants.offersUrl);

  I.click(monthlyLabel);
  I.seeCssPropertiesOnElements(monthlyLabel, { color: '#000000' });
  I.seeCssPropertiesOnElements(yearlyLabel, { color: '#ffffff' });

  I.click(yearlyLabel);
  I.seeCssPropertiesOnElements(monthlyLabel, { color: '#ffffff' });
  I.seeCssPropertiesOnElements(yearlyLabel, { color: '#000000' });

  I.click('Continue');
  I.waitForLoaderDone();

  I.see('Yearly subscription');
  I.see(yearlyPrice);
  I.see('/year');

  I.see('Redeem coupon');
  I.see(formatPrice(50));
  I.see('Payment method fee');
  I.see(formatPrice(0));
  I.see('Total');
  I.see('Applicable tax (21%)');
  I.clickCloseButton();
});

Scenario('I can see payment types', async ({ I }) => {
  paidLoginContext = await I.registerOrLogin(paidLoginContext);

  await goToCheckout(I);

  I.see('Credit card');
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

Scenario('I can open the PayPal site', async ({ I }) => {
  paidLoginContext = await I.registerOrLogin(paidLoginContext);

  await goToCheckout(I);

  I.click('PayPal');
  I.click('Continue');

  I.waitInUrl('paypal.com', longTimeout);
  // I'm sorry, I don't know why, but this test ends in a way that causes the next test to fail
  I.amOnPage(constants.baseUrl);
});

Scenario('I can finish my subscription', async ({ I }) => {
  paidLoginContext = await I.registerOrLogin(paidLoginContext);

  await goToCheckout(I);

  I.see('Credit card');

  // Adyen credit card form is loaded asynchronously, so wait for it
  I.waitForElement('[class*=adyen-checkout__field--cardNumber]', normalTimeout);

  // Each of the 3 credit card fields is a separate iframe
  I.switchTo('[class*="adyen-checkout__field--cardNumber"] iframe');
  I.fillField('Card number', '5555444433331111');
  // @ts-expect-error
  I.switchTo(null); // Exit the iframe context back to the main document

  I.switchTo('[class*="adyen-checkout__field--expiryDate"] iframe');
  I.fillField('Expiry date', '03/30');
  // @ts-expect-error
  I.switchTo(null); // Exit the iframe context back to the main document

  I.switchTo('[class*="adyen-checkout__field--securityCode"] iframe');
  I.fillField('Security code', '737');
  // @ts-expect-error
  I.switchTo(null); // Exit the iframe context back to the main document

  await finishAndCheckSubscription(I, addDays(today, 365), today);

  I.seeAll(cardInfo);
});

Scenario('I can cancel my subscription', async ({ I }) => {
  paidLoginContext = await I.registerOrLogin(paidLoginContext);

  cancelPlan(I, addDays(today, 365));

  // Still see payment info
  I.seeAll(cardInfo);
});

Scenario('I can renew my subscription', async ({ I }) => {
  paidLoginContext = await I.registerOrLogin(paidLoginContext);

  renewPlan(I, addDays(today, 365));
});
