import constants from './constants';

const yearlyPrice = formatPrice(50);

export function goToCheckout(I: CodeceptJS.I) {
  I.amOnPage(constants.offersUrl);

  I.click('Continue');
  I.waitForLoaderDone();
}

export function formatPrice(price: number) {
  // eslint-disable-next-line no-irregular-whitespace
  return `€ ${price.toFixed(2).replace('.', ',')}`;
}

export function addDays(date: Date, days: number) {
  const newDate = new Date(date.valueOf());
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

export function addYear(date: Date) {
  const newDate = new Date(date.valueOf());
  newDate.setFullYear(newDate.getFullYear() + 1);
  return newDate;
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US');
}

export function finishAndCheckSubscription(I: CodeceptJS.I, billingDate: Date, today: Date) {
  I.click('Continue');
  I.waitForLoaderDone(15);
  I.see('Welcome to Blender');
  I.see('Thank you for subscribing to Blender (svod/tvod). Please enjoy all our content.');

  I.click('Start watching');

  I.waitForLoaderDone();
  I.see('Annual subscription');
  I.see(yearlyPrice);
  I.see('/year');
  I.see('Next billing date is on ' + formatDate(billingDate));
  I.see('Cancel subscription');

  I.see('Annual subscription (recurring) to JW Player');

  I.see(formatDate(today));
}

export function cancelPlan(I: CodeceptJS.I, expirationDate: Date) {
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

export function renewPlan(I: CodeceptJS.I, billingDate: Date) {
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

export function overrideIP(I: CodeceptJS.I) {
  // Set this as a cookie so it persists between page navigations (local storage would also work, but the permissions don't work)
  I.setCookie({ name: 'overrideIP', value: '101.33.29.0', domain: 'localhost', path: '/' });
}
