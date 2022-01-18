import * as assert from 'assert';

import {functions, constants, selectors} from '../utils/utils';

Feature('login').tag('@mobile');

Before(({I}) => {
  I.amOnPage('http://localhost:8080?c=test--accounts');
});

Scenario('Signin buttons show for config', ({ I }) => {
  functions.openDrawer(I);
});

Scenario('I can open the log in modal', ({ I }) => {
  openLoginModal(I);
});

Scenario('I can close the modal', ({ I }) => {
  openLoginModal(I);

  I.click('div[aria-label="Close"]');
  I.dontSee('Email');
  functions.openDrawer(I);
});

Scenario('I can close the modal by clicking outside', ({ I }) => {
  openLoginModal(I);

  I.forceClick('div[data-testid="backdrop"]');
  I.dontSee('Email');
  functions.openDrawer(I);
});

Scenario('I can toggle to view password', async ({ I }) => {
  openLoginModal(I);

  let inputType = await I.grabAttributeFrom('input[name="password"]', 'type');
  assert.strictEqual('password', inputType);

  async function getPasswordType() {
    return await I.grabAttributeFrom('input[name="password"]', 'type');
  }

  I.click('div[aria-label="View password"]');
  inputType = await getPasswordType();
  assert.strictEqual('text', inputType);

  I.click('div[aria-label="Hide password"]');
  inputType = await getPasswordType();
  assert.strictEqual('password', inputType);
})

Scenario('I get a warning when the form is incompletely filled in', ({ I }) => {
  openLoginModal(I);

  I.click('button[type="submit"]');
  I.see('This field is required');
  I.seeNumberOfElements('div[class="_helperText_1rxvx_5"]', 2);
  I.seeCssPropertiesOnElements('div[class="_container_1rxvx_8"]', { 'border-color': '#ff0c3e'});

  I.fillField('Email', '12345@test');
  I.fillField('password', 'test');

  I.dontSee('This field is required');
  I.see('Please re-enter your email details and try again');

  I.fillField('Email', constants.username);
  I.dontSee('Please re-enter your email details and try again');
  I.click('button[type="submit"]');
  I.waitForElement('text="Incorrect email/password combination"', 5);

  I.fillField('password', constants.password);
  I.click('button[type="submit"]');
  I.dontSee('Incorrect email/password combination');
  I.waitForInvisible('Sign in', 5);
  I.dontSee('Email');
  I.dontSee('Password');
  I.dontSee('Sign in');
});

Scenario('I can use the User menu', ({ I }) => {
  login(I);
  functions.openDrawer(I, true);

  I.see('Log out');
});

Scenario('I can log out', ({ I })=> {
  login(I);

  functions.openDrawer(I, true);

  I.click('Log out');
  I.see('Sign in');
});

function openLoginModal(I) {
  functions.openDrawer(I, false);

  I.click('Sign in');
  I.seeElement(selectors.loginForm);
  I.see('Sign in');
  I.see('Email');
  I.see('Password');
  I.see('Forgot password');
  I.see('New to Blender?');
  I.see('Sign up');
}

function login(I) {
  openLoginModal(I);
  submitLoginForm(I);
}

function submitLoginForm(I) {
  I.fillField('Email', constants.username);
  I.dontSee('Please re-enter your email details and try again');
  I.fillField('Password', constants.password);
  I.dontSee('This field is required');

  I.click('button[type="submit"]');

  I.dontSee('Incorrect email/password combination');
  I.waitForInvisible(selectors.loginForm, 5);
  I.dontSee('Email');
  I.dontSee('Password');
  I.dontSee('button[type="submit"]');
}