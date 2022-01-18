import * as assert from "assert";

Feature('login').tag('@desktop');

Scenario('Signing buttons show for config', ({ I }) => {
  I.amOnPage('http://localhost:8080?c=test--accounts');
  I.see('Sign in');
  I.see('Sign up');
});

Scenario('I can open the log in modal', ({ I }) => {
  I.click('Sign in');
  I.see('Sign in');
  I.see('Email');
  I.see('Password');
  I.see('Forgot password');
  I.see('New to Blender?');
  I.see('Sign up');
});

Scenario('I can close the modal', ({ I }) => {
  I.click('div[aria-label="Close"]');
  I.dontSee('Email');
  I.click('Sign in');
  I.see('Email');

  I.forceClick('div[data-testid="backdrop"]');
  I.dontSee('Email');
  I.click('Sign in');
  I.see('Email');
});

Scenario('I can toggle to view password', async ({ I }) => {
  let inputType = await I.grabAttributeFrom('input[name="password"]', 'type');
  assert.strictEqual('password', inputType);

  I.click('div[aria-label="View password"]');
  inputType = await I.grabAttributeFrom('input[name="password"]', 'type');
  assert.strictEqual('text', inputType);

  I.click('div[aria-label="Hide password"]');
  inputType = await I.grabAttributeFrom('input[name="password"]', 'type');
  assert.strictEqual('password', inputType);
})

Scenario('I get a warning when the form is incompletely filled in', ({ I }) => {
  I.click('button[type="submit"]');
  I.see('This field is required');
  I.seeNumberOfElements('div[class="_helperText_1rxvx_5"]', 2);
  I.seeCssPropertiesOnElements('div[class="_container_1rxvx_8"]', { 'border-color': '#ff0c3e'});

  I.fillField('Email', '12345@test');
  I.fillField('password', 'test');

  I.dontSee('This field is required');
  I.see('Please re-enter your email details and try again');

  I.fillField('Email', '12345@test.org');
  I.dontSee('Please re-enter your email details and try again');
  I.click('button[type="submit"]');
  I.see('Incorrect email/password combination');


  I.fillField('password', 'Ax854bZ!$');
  I.click('button[type="submit"]');
  I.dontSee('Incorrect email/password combination');
  I.wait(3);
  I.dontSee('Email');
});

Scenario('I can use the User menu', ({ I }) => {
  I.click('div[aria-label="Open user menu"]');
  I.see('Account');
  I.see('Favorites');
  I.see('Log out');
});

Scenario('I can log out', ({ I })=> {
  I.click('Log out');
  I.see('Sign in');
});
