Feature('account').tag('@desktop')

// todo: run same test with loginMobile for @mobile

Scenario('I can see my payments data', ({ I }) => {
  I.amOnPage('http://localhost:8080?c=test--subscription');
  I.login('complete-subscription@test.org');

  I.click('div[aria-label="Open user menu"]');
  I.click('Payments');

  I.see('Subscription details');
  I.see('Payment method');
  I.see('Transactions');
})

Scenario('I can see offered subscriptions', ({ I })=> {
  I.click('Complete subscription');
  I.see('Subscription');
  I.see('All movies and series of Blender');

  within('label[for="monthly"]', () => { 
    I.see('Monthly');
    I.see('First month free');
    I.see('Cancel anytime');
    I.see('Watch on all devices');
    I.see('€');
    I.see('6,99');
    I.see('/month');
  });
  within('label[for="yearly"]', () => { 
    I.see('Yearly');
    I.see('First 14 days free');
    I.see('Cancel anytime');
    I.see('Watch on all devices');
    I.see('€');
    I.see('50,00');
    I.see('/year');
  });
  I.see('Continue');

  I.click('div[aria-label="Close"]');
  I.dontSee('Monthly');
});

Scenario('I can choose an offer', async ({ I }) => {
  I.click('Complete subscription');
  I.click('label[for="monthly"]');
  I.wait();
  I.seeCssPropertiesOnElements('label[for="monthly"]', { 'color': '#000000' });
  I.seeCssPropertiesOnElements('label[for="yearly"]', { 'color': '#ffffff' });

  I.click('label[for="yearly"]');
  I.seeCssPropertiesOnElements('label[for="monthly"]', { 'color': '#ffffff' });
  I.seeCssPropertiesOnElements('label[for="yearly"]', { 'color': '#000000' });

  I.click('Continue');
  I.wait(4);

  I.see('Yearly subscription');
  I.see('You will be charged after 14 days.');
  I.see('50,00');
  I.see('/year');

  I.see('Redeem coupon');
  I.see('Free trial');
  I.see('-50,00');
  I.see('Payment method fee');
  I.see('0,00');
  I.see('Total');
  I.see('Applicable tax (21%)');

  I.see('Credit Card');
  I.see('PayPal');

  I.see('Card number');
  I.see('Expiry date');
  I.see('CVC / CVV');
  I.see('Continue');

});

// Todo
// Scenario('I can open the PayPal site', ({ I })=>{
//   I.click('PayPal');
//   I.see('Clicking \'continue\' will bring you to the PayPal site.');
//   I.click('Continue');
//   I.seeInCurrentUrl('paypal.com');
//   I.amOnPage('http://localhost:8080/u/payments?c=test--subscription')
//   I.wait(4);
//   I.click('Complete subscription');
//   I.click('Continue');
//   I.wait(4);
// });

Scenario('I can redeem coupons', ({I}) => {
  I.click('Redeem coupon');
  I.seeElement('input[name="couponCode"]');
  I.see('Apply');
  
  I.click('div[aria-label="Close coupon form"]');
  I.dontSee('Coupon code');

  I.click('Redeem coupon');
  I.fillField('couponCode', 'test75');
  I.click('Apply');
  I.wait(4);
  I.see('Your coupon code has been applied');
  I.see('-37,50');
  I.see('12,50');
  I.see('2,17');

  I.fillField('couponCode', 'test100');
  I.click('Apply');
  I.wait(4);
  I.see('No payment needed')
  I.dontSee('12,50');
});

// Todo: how to test this recurrently?
// Scenario('I can finish my subscription', ({ I }) => {
//   I.click('Continue');
//   I.wait(4);
//   I.see('Welcome to blender');
//   I.see('Thank you for subscribing to Blender. Please enjoy all our content.');
//   I.see('Start watching (');
//   I.click('div[aria-label="Close"]');

//   I.see('Monthly subscription');
//   I.see('Next billing date is on');
//   I.see('€');
//   I.see('50,00');
//   I.see('/year');
// });

Scenario('I can cancel my subscription', ({ I }) => { 
  I.login();
  I.amOnPage('/u/payments');
  I.wait(7);
  I.click('Cancel subscription');
  I.see('We are sorry to see you go.');
  I.see('You will be unsubscribed from your current plan by clicking the unsubscribe button below.');
  I.see('Unsubscribe');
  I.see('No, thanks');
  I.click('No, thanks');
  I.dontSee('We are sorry to see you go.');

  I.click('Cancel subscription');
  I.see('We are sorry to see you go.');
  I.click('div[aria-label="Close"]');
  I.dontSee('We are sorry to see you go.');

  I.click('Cancel subscription');
  I.click('Unsubscribe');
  I.wait(6);
  I.see('Miss you already.')
  I.see('You have been successfully unsubscribed. Your current plan will expire on')

  I.click('Return to profile');
  I.see('Renew subscription');
});

Scenario('I can renew my subscription', ({ I })=> {
  I.click('Renew subscription');
  I.see('Renew your subscription');
  I.see('By clicking the button below you can renew your plan.');
  I.see('Annual subscription (recurring) to videodock');
  I.see('Next billing date will be ');
  I.see('50,00');
  I.see('/year');
  
  I.click('No, thanks');
  I.dontSee('Renew your subscription');

  I.click('Renew subscription');
  I.click('Renew subscription', 'div[class="_dialog_18t28_1"]');
  I.wait(6);
  I.see('Your subscription has been renewed');
  I.see('You have been successfully resubscribed.'); //todo: test for valid dates
  I.click('Back to profile');
  I.see('Cancel subscription');
});