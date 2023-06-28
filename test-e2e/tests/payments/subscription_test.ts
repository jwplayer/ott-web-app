import { LoginContext } from '#utils/password_utils';
import constants, { longTimeout } from '#utils/constants';
import { goToCheckout, finishAndCheckSubscription, cancelPlan, renewPlan, overrideIP, addYear, registerAndSubscribe } from '#utils/payments';
import { testConfigs } from '#test/constants';
import { ProviderProps } from '#test/types';

const jwProps: ProviderProps = {
  config: testConfigs.jwpSvod,
  monthlyOffer: constants.offers.monthlyOffer.inplayer,
  yearlyOffer: constants.offers.yearlyOffer.inplayer,
  paymentFields: constants.paymentFields.inplayer,
  creditCard: constants.creditCard.inplayer,
  applicableTax: 0,
  canRenewSubscription: false,
  fieldWrapper: '',
};

const cleengProps: ProviderProps = {
  config: testConfigs.svod,
  monthlyOffer: constants.offers.monthlyOffer.cleeng,
  yearlyOffer: constants.offers.yearlyOffer.cleeng,
  paymentFields: constants.paymentFields.cleeng,
  creditCard: constants.creditCard.cleeng,
  applicableTax: 21,
  canRenewSubscription: true,
  fieldWrapper: 'iframe',
};

runTestSuite(jwProps, 'JW Player');
runTestSuite(cleengProps, 'Cleeng');

function runTestSuite(props: ProviderProps, providerName: string) {
  const today = new Date();

  const cardInfo = Array.of('Card number', '•••• •••• •••• 1111', 'Expiry date', '03/2030', 'Security code', '******');

  Feature(`payments - ${providerName}`).retry(Number(process.env.TEST_RETRY_COUNT) || 0);

  Before(async ({ I }) => {
    // This gets used in checkoutService.getOffer to make sure the offers are geolocated for NL
    overrideIP(I);
    I.useConfig(props.config);
  });

  Scenario(`I can see my payments data - ${providerName}`, async ({ I }) => {
    await I.registerOrLogin();

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

  Scenario(`I can see offered subscriptions - ${providerName}`, async ({ I }) => {
    await I.registerOrLogin();

    I.amOnPage(constants.paymentsUrl);

    I.click('Complete subscription');
    I.see('Choose plan');
    I.see('Watch this on JW OTT Web App');

    await within(props.monthlyOffer.label, () => {
      I.see('Monthly');
      I.see('First month free');
      I.see('Cancel anytime');
      I.see('Watch on all devices');
      I.see(props.monthlyOffer.price);
      I.see('/month');
    });

    await within(props.yearlyOffer.label, () => {
      I.see('Cancel anytime');
      I.see('Watch on all devices');
      I.see(props.yearlyOffer.price);
      I.see('/year');
    });

    I.see('Continue');
  });

  Scenario(`I can choose an offer - ${providerName}`, async ({ I }) => {
    await I.registerOrLogin();

    I.amOnPage(constants.offersUrl);

    I.click(props.monthlyOffer.label);
    I.seeCssPropertiesOnElements(props.monthlyOffer.label, { color: '#000000' });
    I.seeCssPropertiesOnElements(props.yearlyOffer.label, { color: '#ffffff' });

    I.click(props.yearlyOffer.label);
    I.seeCssPropertiesOnElements(props.monthlyOffer.label, { color: '#ffffff' });
    I.seeCssPropertiesOnElements(props.yearlyOffer.label, { color: '#000000' });

    I.click('Continue');
    I.waitForLoaderDone();

    I.see('Yearly subscription');
    I.see(props.yearlyOffer.price);
    I.see('/year');

    I.see('Redeem coupon');
    I.see(props.yearlyOffer.price);
    I.dontSee('Payment method fee');
    I.dontSee(props.yearlyOffer.paymentFee);
    I.see('Total');
    if (props.applicableTax !== 0) {
      I.see('Applicable tax (21%)');
    }
    I.clickCloseButton();
  });

  Scenario(`I can see payment types - ${providerName}`, async ({ I }) => {
    await I.registerOrLogin();

    await goToCheckout(I);

    I.waitForElement('#card', longTimeout);
    I.see('Credit card');
    I.see('PayPal');

    I.see('Card number');
    I.see('Expiry date');
    I.see('Security code');
    I.see('Continue');
    I.dontSee("Clicking 'continue' will bring you to the PayPal site.");

    I.click('PayPal');

    I.see("Clicking 'continue' will bring you to the PayPal site.");
    I.dontSee('Card number');
    I.dontSee('Expiry date');
    I.dontSee('Security code');
    I.see('Continue');
  });

  Scenario(`I can open the PayPal site - ${providerName}`, async ({ I }) => {
    await I.registerOrLogin();

    await goToCheckout(I);

    I.click('PayPal');
    I.click('Continue');

    I.waitInUrl('paypal.com', longTimeout);
    // I'm sorry, I don't know why, but this test ends in a way that causes the next test to fail
    I.amOnPage(constants.baseUrl);
  });

  Scenario(`I can finish my subscription with credit card - ${providerName}`, async ({ I }) => {
    await registerAndSubscribe(I, props, today);

    I.seeAll(cardInfo);
  });

  Scenario(`I can cancel my subscription - ${providerName}`, async ({ I }) => {
    await registerAndSubscribe(I, props, today);

    cancelPlan(I, addYear(today), props.canRenewSubscription);

    // Still see payment info
    I.seeAll(cardInfo);
  });

  Scenario(`I can renew my subscription - ${providerName}`, async ({ I }) => {
    if (props.canRenewSubscription) {
      await registerAndSubscribe(I, props, today);
      cancelPlan(I, addYear(today), props.canRenewSubscription);
      renewPlan(I, addYear(today), props.yearlyOffer.price);
    }
  });

  Scenario(`I can view my invoices - ${providerName}`, async ({ I }) => {
    if (props.canRenewSubscription) {
      await registerAndSubscribe(I, props, today);
      I.amOnPage(constants.paymentsUrl);
      I.waitForLoaderDone(25);
      I.see('Transactions');
      I.dontSee('No transactions');

      I.scrollTo('[class*="mainColumn"] :last-child');

      // Open the invoice which is opened in a new tab
      I.click('Show receipt');
      I.switchToNextTab();

      // Assert invoice functionality by validating the presence of the purchase button
      I.seeElement('.purchase-button');
      I.closeCurrentTab();
    }
  });
}
