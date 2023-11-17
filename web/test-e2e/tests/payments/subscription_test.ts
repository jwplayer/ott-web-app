import { LoginContext } from '#utils/password_utils';
import constants, { longTimeout } from '#utils/constants';
import { goToCheckout, finishAndCheckSubscription, cancelPlan, renewPlan, overrideIP, addYear } from '#utils/payments';
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
  hasInlineOfferSwitch: true,
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
  hasInlineOfferSwitch: false,
};

runTestSuite(jwProps, 'JW Player');
runTestSuite(cleengProps, 'Cleeng');

function runTestSuite(props: ProviderProps, providerName: string) {
  let paidLoginContext: LoginContext;

  const today = new Date();

  const cardInfo = Array.of('Card number', '•••• •••• •••• 1111', 'Expiry date', '03/2030', 'Security code', '******');

  Feature(`payments - ${providerName}`).retry(Number(process.env.TEST_RETRY_COUNT) || 0);

  Before(async ({ I }) => {
    // This gets used in checkoutService.getOffer to make sure the offers are geolocated for NL
    overrideIP(I);
    I.useConfig(props.config);
  });

  Scenario(`I can see my payments data - ${providerName}`, async ({ I }) => {
    paidLoginContext = await I.registerOrLogin(paidLoginContext);

    await I.openMainMenu();

    I.click('Payments');
    I.see('Subscription details');
    I.see('You have no subscription. Complete your subscription to start watching all movies and series.');
    I.see('Complete subscription');

    I.see('Payment method');
    I.see('No payment methods');

    I.see('Billing history');
    I.see('No transactions');
  });

  Scenario(`I can see offered subscriptions - ${providerName}`, async ({ I }) => {
    paidLoginContext = await I.registerOrLogin(paidLoginContext);

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
    paidLoginContext = await I.registerOrLogin(paidLoginContext);

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
    paidLoginContext = await I.registerOrLogin(paidLoginContext);

    await goToCheckout(I);

    I.waitForText('Credit card');
    I.waitForText('PayPal');
    I.waitForText(props.paymentFields.creditCardholder);
    I.waitForText('Card number');
    I.waitForText('Expiry date');
    I.waitForText('Security code');
    I.waitForText('Continue');
    I.dontSee("Clicking 'continue' will bring you to the PayPal site.");

    I.click('PayPal');

    I.waitForText("Clicking 'continue' will bring you to the PayPal site.");
    I.dontSee('Card number');
    I.dontSee('Expiry date');
    I.dontSee('Security code');
    I.waitForText('Continue');
  });

  Scenario(`I can open the PayPal site - ${providerName}`, async ({ I }) => {
    paidLoginContext = await I.registerOrLogin(paidLoginContext);

    await goToCheckout(I);

    I.click('PayPal');
    I.click('Continue');

    I.waitInUrl('paypal.com', longTimeout);
    // I'm sorry, I don't know why, but this test ends in a way that causes the next test to fail
    I.amOnPage(constants.baseUrl);
  });

  Scenario(`I can finish my subscription with credit card - ${providerName}`, async ({ I }) => {
    paidLoginContext = await I.registerOrLogin(paidLoginContext);

    await goToCheckout(I);

    await I.payWithCreditCard(
      props.paymentFields.creditCardholder,
      props.creditCard,
      props.paymentFields.cardNumber,
      props.paymentFields.expiryDate,
      props.paymentFields.securityCode,
      props.fieldWrapper,
    );

    await finishAndCheckSubscription(I, addYear(today), today, props.yearlyOffer.price, props.hasInlineOfferSwitch);

    cardInfo.forEach((s) => I.waitForText(s));
  });

  Scenario(`I can cancel my subscription - ${providerName}`, async ({ I }) => {
    paidLoginContext = await I.registerOrLogin(paidLoginContext);

    cancelPlan(I, addYear(today), props.canRenewSubscription, providerName);

    // Still see payment info
    cardInfo.forEach((s) => I.waitForText(s));
  });

  Scenario(`I can renew my subscription - ${providerName}`, async ({ I }) => {
    if (props.canRenewSubscription) {
      paidLoginContext = await I.registerOrLogin(paidLoginContext);
      renewPlan(I, addYear(today), props.yearlyOffer.price);
    }
  });

  Scenario(`I can view my invoices - ${providerName}`, async ({ I }) => {
    if (props.canRenewSubscription) {
      paidLoginContext = await I.registerOrLogin(paidLoginContext);
      I.amOnPage(constants.paymentsUrl);
      I.waitForLoaderDone();
      I.see('Billing history');
      I.dontSee('No transactions');

      I.scrollPageToBottom();

      // Open the invoice which is opened in a new tab
      I.click('Show receipt');
      I.switchToNextTab();

      // Assert invoice functionality by validating the presence of the purchase button
      I.seeElement('.purchase-button');
      I.closeCurrentTab();
    }
  });
}
