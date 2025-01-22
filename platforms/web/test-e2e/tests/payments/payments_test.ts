import { testConfigs } from '@jwp/ott-testing/constants';

import { LoginContext } from '#utils/password_utils';
import constants, { longTimeout } from '#utils/constants';
import { goToCheckout, finishSubscription, cancelPlan, renewPlan, overrideIP, addYear, formatDate, checkSubscription } from '#utils/payments';
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
  cardInfo: Array.of(['Card number', '•••• •••• •••• 1111'], ['Expiry date', '03/2030'], ['Security code', '******']),
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
  cardInfo: Array.of(['Card number', '•••• •••• •••• 1115'], ['Expiry date', '03/2030'], ['Security code', '******']),
};

runTestSuite(jwProps, 'JW Player');
runTestSuite(cleengProps, 'Cleeng');

function runTestSuite(props: ProviderProps, providerName: string) {
  let paidLoginContext: LoginContext;

  const today = new Date();

  Feature(`payments - ${providerName}`).retry(Number(process.env.TEST_RETRY_COUNT) || 0);

  Before(async ({ I }) => {
    // This gets used in checkoutService.getOffer to make sure the offers are geolocated for NL
    overrideIP(I);
    I.useConfig(props.config);
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

    const alreadySubscribed = await tryTo(() => {
      I.waitForText('Next billing date is on ' + formatDate(today));
    });

    if (!alreadySubscribed) {
      await I.payWithCreditCard(
        props.paymentFields.creditCardholder,
        props.creditCard,
        props.paymentFields.cardNumber,
        props.paymentFields.expiryDate,
        props.paymentFields.securityCode,
        props.fieldWrapper,
      );

      await finishSubscription(I);
    }

    await checkSubscription(I, addYear(today), today, props.yearlyOffer.price, props.hasInlineOfferSwitch);

    props.cardInfo?.forEach(([label, value]) => I.seeInField(label, value));
  });

  Scenario(`I can cancel my subscription - ${providerName}`, async ({ I }) => {
    paidLoginContext = await I.registerOrLogin(paidLoginContext);

    await cancelPlan(I, addYear(today), props.canRenewSubscription, providerName);

    // Still see payment info
    props.cardInfo?.forEach(([label, value]) => I.seeInField(label, value));
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
    }
  });
}
