import { LoginContext } from '#utils/password_utils';
import constants, { longTimeout, normalTimeout } from '#utils/constants';
import { goToCheckout, finishAndCheckSubscription, cancelPlan, renewPlan, addDays } from '#utils/payments';
import { testConfigs } from '#test/constants';

const loginContext: { [key: string]: LoginContext } = {};

const today = new Date();

const cardInfo = Array.of('Card number', '•••• •••• •••• 1111', 'Expiry date', '03/2030', 'CVC / CVV', '******');

const configs = new DataTable([
  'config',
  'monthlyOffer',
  'yearlyOffer',
  'paymentFields',
  'creditCard',
  'creditCardNamePresent',
  'applicableTax',
  'fieldWrapper',
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
  true,
  'iframe',
  true,
]);

// inplayer integration
configs.xadd([
  testConfigs.inplayerSvodStaging,
  constants.offers.monthlyOffer.inplayer,
  constants.offers.yearlyOffer.inplayer,
  constants.paymentFields.inplayer,
  constants.creditCard.inplayer,
  true,
  false,
  '',
  false,
]);

Feature('payments').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Data(configs).Scenario('I can see my payments data', async ({ I, current }) => {
  await I.beforeSubscription(current.config);

  loginContext[current.config.label] = await I.registerOrLogin(loginContext[current.config.label]);

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

Data(configs).Scenario('I can see offered subscriptions', async ({ I, current }) => {
  await I.beforeSubscription(current.config);

  loginContext[current.config.label] = await I.registerOrLogin(loginContext[current.config.label]);

  I.amOnPage(constants.paymentsUrl);

  I.click('Complete subscription');
  I.see('Choose plan');
  I.see('Watch this on JW OTT Web App');

  await within(current.monthlyOffer.label, () => {
    I.see('Monthly');
    I.see('First month free');
    I.see('Cancel anytime');
    I.see('Watch on all devices');
    I.see(current.monthlyOffer.price);
    I.see('/month');
  });

  await within(current.yearlyOffer.label, () => {
    I.see('Cancel anytime');
    I.see('Watch on all devices');
    I.see(current.yearlyOffer.price);
    I.see('/year');
  });

  I.see('Continue');
});

Data(configs).Scenario('I can choose an offer', async ({ I, current }) => {
  await I.beforeSubscription(current.config);

  loginContext[current.config.label] = await I.registerOrLogin(loginContext[current.config.label]);

  I.amOnPage(constants.offersUrl);

  I.click(current.monthlyOffer.label);
  I.seeCssPropertiesOnElements(current.monthlyOffer.label, { color: '#000000' });
  I.seeCssPropertiesOnElements(current.yearlyOffer.label, { color: '#ffffff' });

  I.click(current.yearlyOffer.label);
  I.seeCssPropertiesOnElements(current.monthlyOffer.label, { color: '#ffffff' });
  I.seeCssPropertiesOnElements(current.yearlyOffer.label, { color: '#000000' });

  I.click('Continue');
  I.waitForLoaderDone();

  I.see('Yearly subscription');
  I.see(current.yearlyOffer.price);
  I.see('/year');

  I.see('Redeem coupon');
  I.see(current.yearlyOffer.price);
  I.see('Payment method fee');
  I.see(current.yearlyOffer.paymentFee);
  I.see('Total');
  if (current.applicableTax) {
    I.see('Applicable tax (21%)');
  }
  I.clickCloseButton();
});

Data(configs).Scenario('I can see payment types', async ({ I, current }) => {
  await I.beforeSubscription(current.config);
  loginContext[current.config.label] = await I.registerOrLogin(loginContext[current.config.label]);

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

Data(configs).Scenario('I can open the PayPal site', async ({ I, current }) => {
  await I.beforeSubscription(current.config);
  loginContext[current.config.label] = await I.registerOrLogin(loginContext[current.config.label]);

  await goToCheckout(I);

  I.click('PayPal');
  I.click('Continue');

  I.waitInUrl('paypal.com', longTimeout);
  // I'm sorry, I don't know why, but this test ends in a way that causes the next test to fail
  I.amOnPage(constants.baseUrl);
});

Data(configs).Scenario('I can finish my subscription with credit card', async ({ I, current }) => {
  await I.beforeSubscription(current.config);
  loginContext[current.config.label] = await I.registerOrLogin(loginContext[current.config.label]);

  await goToCheckout(I);

  I.payWithCreditCard(
    current.creditCardNamePresent,
    current.creditCard,
    current.paymentFields.cardNumber,
    current.paymentFields.expiryDate,
    current.paymentFields.securityCode,
    current.fieldWrapper,
  );

  await finishAndCheckSubscription(I, addDays(today, 365), today, current.yearlyOffer.price);

  I.seeAll(cardInfo);
});

Data(configs).Scenario('I can cancel my subscription', async ({ I, current }) => {
  await I.beforeSubscription(current.config);
  loginContext[current.config.label] = await I.registerOrLogin(loginContext[current.config.label]);

  cancelPlan(I, addDays(today, 365), current.canRenewSubscription);

  // Still see payment info
  I.seeAll(cardInfo);
});

Data(configs).Scenario('I can renew my subscription', async ({ I, current }) => {
  if (current.canRenewSubscription) {
    await I.beforeSubscription(current.config);
    loginContext[current.config.label] = await I.registerOrLogin(loginContext[current.config.label]);
    renewPlan(I, addDays(today, 365), current.yearlyOffer.price);
  }
});
