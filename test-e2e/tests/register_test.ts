import * as assert from "assert";

Feature('register').tag('@desktop');

Scenario('I can open the register modal', ({ I }) => {
  I.amOnPage('http://localhost:8080?c=test--accounts');
  I.click('Sign up');
  I.see('Email');
  I.see('Password');
  I.see('Use a minimum of 8 characters (case sensitive) with at least one number');
  I.see('I accept the');
  I.see('Terms and Conditions');
  I.see('of Cleeng.');
  I.see('Yes, I want to receive videodock and videodock.org updates by email.');
  I.see('Continue');
  I.see('Already have an account?');
  I.see('Sign in');
});

Scenario('I can close the modal', ({ I }) => {
  I.click('div[aria-label="Close"]');
  I.dontSee('Email');
  I.click('Sign up');
  I.see('Email');
});

Scenario('I can switch to the Sign In modal', ({ I }) => {
  I.click('a[class="_link_1uj3n_1"]');
  I.see('Forgot password');
  I.click('a[class="_link_1uj3n_1"]');
  I.see('Already have an account?')
});

Scenario('The submit button is disabled when the form is incompletely filled in', async ({ I }) => {
  const submitDisabled = await I.grabAttributeFrom('button[type="submit"]', 'disabled');
  assert.strictEqual(true, submitDisabled);
});

Scenario('I get warned when filling in incorrect credentials', async ({ I }) => {
  I.fillField('Email', 'test');
  I.pressKey('Tab');
  I.see('Please re-enter your email details');
  I.fillField('Email', '12345@test.org');
  I.dontSee('Please re-enter your email details');

  let color
  color = await I.grabCssPropertyFrom('div[class="_helperText_1rxvx_5"]', 'color');
  assert.strictEqual('rgb(255, 255, 255)', color);

  I.fillField('password', '1234');
  I.pressKey('Tab');
  color = await I.grabCssPropertyFrom('div[class="_helperText_1rxvx_5"]', 'color');
  assert.strictEqual('rgb(255, 12, 62)', color);

  I.fillField('password', 'Test1234');
  color = await I.grabCssPropertyFrom('div[class="_helperText_1rxvx_5"]', 'color');
  assert.strictEqual('rgb(255, 255, 255)', color);
});

Scenario('I get strength feedback when typing in a password', ({ I }) => {
  I.fillField('password', '1111aaaa');
  I.see('Weak');
  I.dontSee('Strong');

  I.fillField('password', '1111aaaA');
  I.see('Fair');
  I.fillField('password', '1111aaaA!');
  I.see('Strong');

  I.fillField('password', 'Ax854bZ!$');
  I.see('Very strong');
});

Scenario('I can toggle to view/hide my password', async ({ I }) => {
  let inputType = await I.grabAttributeFrom('input[name="password"]', 'type');
  assert.strictEqual('password', inputType);

  I.click('div[aria-label="View password"]');
  inputType = await I.grabAttributeFrom('input[name="password"]', 'type');
  assert.strictEqual('text', inputType);

  I.click('div[aria-label="Hide password"]');
  inputType = await I.grabAttributeFrom('input[name="password"]', 'type');
  assert.strictEqual('password', inputType);
})

Scenario('I can\'t submit without checking requird consents', async ({ I }) => {
  I.click('Continue');
  I.seeCssPropertiesOnElements('input[name="terms"]', { 'border-color': '#ff0c3e'});
});

Scenario('I can submit to register', ({ I }) => {
  I.checkOption('Terms and Conditions');
  I.click('Continue');
  I.wait(5);

  I.see('There is already a user with this email');

  // todo: Add a random script to register with a unique email?
});