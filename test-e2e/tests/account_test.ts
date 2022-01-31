import * as assert from 'assert';

Feature('account').tag('@desktop')

// todo: run same test with loginMobile for @mobile

Scenario('I can see my account data', ({ I }) => {
  I.amOnPage('http://localhost:8080?c=test--subscription');
  I.login();

  I.click('div[aria-label="Open user menu"]');
  I.click('Account');

  I.see('Email');
  I.see('12345@test.org');
  I.see('Edit account');

  I.see('Security');
  I.see('Password');
  I.see('****************');
  I.see('Edit password');

  I.see('About you');
  I.see('First name');
  I.see('Last name');
  I.see('Edit information');

  I.see('Terms & tracking');
  I.wait(3);
  I.see('I accept the Terms and Conditions of Cleeng');
  I.see('Yes, I want to receive videodock and videodock.org updates by email');
  I.see('Update consents');
});

Scenario('I can edit my email', ({ I }) => {
  I.click('Edit account');
  I.see('Confirm password');

  I.click('Cancel');
  I.dontSee('Confirm password');

  I.click('Edit account');
  I.fillField('email', '12345@test.org');
  I.fillField('confirmationPassword', 'Ax854bZ!$');
  I.click('Save');
  I.wait(2);
  I.see('Email already exists!');
  //todo: missing 'wrong password' message in application

  I.click('Edit account');
  I.fillField('email', '123456@test.org');
  I.fillField('confirmationPassword', 'Ax854bZ!$');
  I.click('Save');
  I.wait(2);
  I.dontSee('Email already exists');
  I.dontSee('Confirm password');

  // Reset email for future testing scenario's
  I.click('Edit account');
  I.fillField('email', '12345@test.org');
  I.fillField('confirmationPassword', 'Ax854bZ!$');
  I.click('Save');
  I.wait(2);
  I.dontSee('Email already exists');
  I.dontSee('Confirm password');
  I.see('12345@test.org');
});

Scenario('I can toggle to view/hide my password', async ({ I }) => {
  I.click('Edit account');
  let inputType = await I.grabAttributeFrom('input[name="confirmationPassword"]', 'type');
  assert.strictEqual('password', inputType);

  I.click('div[aria-label="View password"]');
  inputType = await I.grabAttributeFrom('input[name="confirmationPassword"]', 'type');
  assert.strictEqual('text', inputType);

  I.click('div[aria-label="Hide password"]');
  inputType = await I.grabAttributeFrom('input[name="confirmationPassword"]', 'type');
  assert.strictEqual('password', inputType);

  I.click('Cancel');
})

Scenario('I can reset my password', ({ I }) => {
  I.click('Edit password');
  I.see('If you want to edit your password, click \'YES, Reset\' to receive password reset instruction on your mail');
  I.see('Yes, reset');
  I.see('No, thanks');

  I.click('No, thanks');
  I.dontSee('Yes, reset');
  I.click('Edit password');
  I.see('Yes, reset');
  I.click('div[aria-label="Close"]');
  I.dontSee('Yes, reset');
  I.click('Edit password');

  I.click('Yes, reset');
  I.see('Password link sent');
  I.see('Please check your inbox at 12345@test.org');
  I.see('Back to login');

  I.click('Back to login');
  I.see('Sign in');

  I.click('div[aria-label="Close"]')
  I.login();
  I.click('div[aria-label="Open user menu"]');
  I.click('Account');
})

Scenario('I can update my personal details', ({ I }) => {
  I.click('Edit information');
  I.see('(Optional)');
  I.see('Save');
  I.see('Cancel');

  I.click('Cancel');
  I.dontSee('Save');

  I.click('Edit information');
  I.fillField('firstName', 'Testbot New Name');
  I.fillField('lastName', 'Generated');
  I.click('Save');
  I.dontSee('Save');

  // Reset for future testing purposes
  I.click('Edit information');
  I.fillField('firstName', 'Testbot');
  I.fillField('lastName', 'CodeceptJS');
  I.click('Save');
  I.dontSee('Save');
  I.see('Testbot');
});

Scenario('I can update my consents', async ({ I })=> {
  let submitDisabled = await I.grabAttributeFrom('button[id="submit_consents"]', 'disabled');
  assert.strictEqual(true, submitDisabled);

  I.checkOption('Yes, I want to receive videodock and videodock.org updates by email.');
  submitDisabled = await I.grabAttributeFrom('button[id="submit_consents"]', 'disabled');
  assert.strictEqual(null, submitDisabled);

  I.click("Update consents");
  submitDisabled = await I.grabAttributeFrom('button[id="submit_consents"]', 'disabled');
  assert.strictEqual(true, submitDisabled);

  // Reset
  I.uncheckOption('Yes, I want to receive videodock and videodock.org updates by email.');
  I.click("Update consents");
  I.wait(4);
})