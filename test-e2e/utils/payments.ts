import constants, { longTimeout } from './constants';

import { overrideIPCookieKey } from '#test/constants';

export async function goToCheckout(I: CodeceptJS.I) {
  await I.openMainMenu();
  I.click('Payments');
  I.click('Complete subscription');
  I.waitForLoaderDone();
  I.click('Yearly');
  I.click('Continue');
  I.waitForLoaderDone();
}

export function formatPrice(price: number, currency = 'EUR', country?: string) {
  return new Intl.NumberFormat(country || undefined, {
    style: 'currency',
    currency: currency,
  }).format(price);
}

export function addYear(date: Date) {
  const newDate = new Date(date.valueOf());
  newDate.setFullYear(newDate.getFullYear() + 1);
  return newDate;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export async function finishAndCheckSubscription(I: CodeceptJS.I, billingDate: Date, today: Date, yearlyPrice: string, hasInlineOfferSwitch: boolean) {
  I.click('Continue');
  I.waitForText(`Welcome to JW OTT Web App (SVOD)`, longTimeout);
  I.waitForText(`Thank you for subscribing to JW OTT Web App (SVOD). Please enjoy all our content.`);

  I.click('Start watching');

  const transactionText = 'Annual subscription';

  // It takes a few seconds for transactions to load, so try and refresh a few times
  for (let i = 0; i < 5; i++) {
    I.waitForLoaderDone();

    if ((await I.grabTextFrom('body')).indexOf(transactionText) >= 0) {
      break;
    }
    I.wait(2);
    I.refreshPage();
  }

  I.waitForText(transactionText);

  I.waitForText(yearlyPrice);
  I.waitForText('/year');
  I.waitForText('Next billing date is on ' + formatDate(billingDate));

  if (hasInlineOfferSwitch) {
    I.waitForElement('[data-testid="change-subscription-button"]', 10);
    I.click('[data-testid="change-subscription-button"]');
  }

  I.waitForElement('[data-testid="cancel-subscription-button"]', 10);

  I.waitForElement('[class*="transactionItem"]', 10);

  I.waitForText(formatDate(today));
}

export function cancelPlan(I: CodeceptJS.I, expirationDate: Date, canRenewSubscription: boolean, providerName?: string) {
  I.amOnPage(constants.paymentsUrl);
  I.waitForLoaderDone();

  if (providerName?.includes('JW')) {
    I.waitForElement('[data-testid="change-subscription-button"]', 10);
    I.click('[data-testid="change-subscription-button"]');
  }

  I.waitForElement('[data-testid="cancel-subscription-button"]', 10);
  I.click('[data-testid="cancel-subscription-button"]');
  I.see('We are sorry to see you go.');
  I.see('You will be unsubscribed from your current plan by clicking the unsubscribe button below.');
  I.see('Unsubscribe');
  // Make sure the cancel button works
  I.click('No, thanks');

  I.dontSee('This plan will expire');

  I.waitForElement('[data-testid="cancel-subscription-button"]', 10);
  I.click('[data-testid="cancel-subscription-button"]');
  I.click('Unsubscribe');
  I.waitForText('Miss you already.', longTimeout);
  I.see('You have been successfully unsubscribed. Your current plan will expire on ' + formatDate(expirationDate));
  I.click('Return to profile');

  if (canRenewSubscription) {
    I.waitForText('Renew subscription');
  }

  I.waitForText('This plan will expire on ' + formatDate(expirationDate), longTimeout);
}

export function renewPlan(I: CodeceptJS.I, billingDate: Date, yearlyPrice: string) {
  I.amOnPage(constants.paymentsUrl);
  I.waitForLoaderDone();

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
  I.waitForLoaderDone();
  I.see('Your subscription has been renewed');
  I.see(`You have been successfully resubscribed. Your fee will be ${yearlyPrice} starting from ${formatDate(billingDate)}`);
  I.click('Back to profile');

  I.see('Annual subscription');
  I.see('Next billing date is on');
  I.waitForElement('[data-testid="cancel-subscription-button"]', 10);
}

export function overrideIP(I: CodeceptJS.I) {
  // Set this as a cookie, so it persists between page navigations (local storage would also work, but the permissions don't work)
  I.setCookie({ name: overrideIPCookieKey, value: '5.132.0.0', domain: 'localhost', path: '/' });
}
