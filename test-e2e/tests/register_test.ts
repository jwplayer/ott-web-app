import constants, { longTimeout, normalTimeout } from '#utils/constants';
import passwordUtils from '#utils/password_utils';
import { testConfigs } from '#test/constants';

Feature('register').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(async ({ I }) => {
  I.useConfig(testConfigs.cleengAuthvod);

  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.click('Sign up');
  I.waitForElement(constants.registrationFormSelector, normalTimeout);
});

Scenario('I can open the register modal', async ({ I }) => {
  await I.seeQueryParams({ u: 'create-account' });

  I.see('Email');
  I.see('Password');
  I.see('Use a minimum of 8 characters (case sensitive) with at least one number');
  I.see('I accept the');
  I.see('Terms and Conditions');
  I.see('of Cleeng.');
  I.see('Yes, I want to receive Blender updates by email.');
  I.see('Continue');
  I.see('Already have an account?');
  I.see('Sign in');

  I.seeElement(constants.registrationFormSelector);
});

Scenario('I can close the modal', async ({ I }) => {
  I.waitForElement(constants.registrationFormSelector, normalTimeout);

  I.clickCloseButton();
  I.dontSeeElement(constants.registrationFormSelector);
  I.dontSee('Email');
  I.dontSee('Password');

  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.see('Sign in');
  I.see('Sign up');
});

Scenario('I can switch to the Sign In modal', ({ I }) => {
  I.click('Sign in', constants.registrationFormSelector);
  I.seeElement(constants.loginFormSelector);
  I.see('Forgot password');
  I.dontSee(constants.registrationFormSelector);
  I.click('Sign up', constants.loginFormSelector);
  I.seeElement(constants.registrationFormSelector);
  I.see('Already have an account?');
  I.dontSeeElement(constants.loginFormSelector);
});

Scenario('The submit button is disabled when the form is incompletely filled in', async ({ I }) => {
  I.seeAttributesOnElements('button[type="submit"]', { disabled: true });
});

Scenario('I get warned when filling in incorrect credentials', async ({ I }) => {
  I.fillField('Email', 'test');
  I.pressKey('Tab');
  I.see('Please re-enter your email details');
  I.fillField('Email', '12345@test.org');
  I.dontSee('Please re-enter your email details');

  function checkColor(expectedColor) {
    I.seeCssPropertiesOnElements('text="Use a minimum of 8 characters (case sensitive) with at least one number"', { color: expectedColor });
  }

  checkColor('rgb(255, 255, 255)');

  I.fillField('password', '1234');
  I.pressKey('Tab');
  checkColor('rgb(255, 12, 62)');

  I.fillField('password', 'Test1234');
  checkColor('rgb(255, 255, 255)');
});

Scenario('I get strength feedback when typing in a password', async ({ I }) => {
  const textOptions = ['Weak', 'Fair', 'Strong', 'Very strong'];

  function checkFeedback(password, expectedColor, expectedText) {
    I.fillField('password', password);
    I.seeCssPropertiesOnElements('div[class*="passwordStrengthFill"]', { 'background-color': expectedColor });
    I.see(expectedText);

    I.seeCssPropertiesOnElements(`text="${expectedText}"`, { color: expectedColor });

    textOptions.filter((opt) => opt !== expectedText).forEach((opt) => I.dontSee(opt));
  }

  checkFeedback('1111aaaa', 'orangered', 'Weak');
  checkFeedback('1111aaaA', 'orange', 'Fair');
  checkFeedback('1111aaaA!', 'yellowgreen', 'Strong');
  checkFeedback('Ax854bZ!$', 'green', 'Very strong');
});

Scenario('I can toggle to view password', async ({ I }) => {
  await passwordUtils.testPasswordToggling(I);
});

Scenario('I can`t submit without checking required consents', async ({ I }) => {
  I.fillField('Email', 'test@123.org');
  I.fillField('Password', 'pAssword123!');

  I.click('Continue');

  I.seeCssPropertiesOnElements('input[name="terms"]', { 'border-color': '#ff0c3e' });
});

Scenario('I get warned for duplicate users', ({ I }) => {
  I.fillField('Email', constants.username);
  I.fillField('Password', 'Password123!');
  I.checkOption('Terms and Conditions');
  I.click('Continue');
  I.waitForLoaderDone();
  I.see(constants.duplicateUserError);
});

Scenario('I can register', async ({ I }) => {
  I.fillField('Email', passwordUtils.createRandomEmail());
  I.fillField('Password', passwordUtils.createRandomPassword());

  I.checkOption('Terms and Conditions');
  I.click('Continue');
  I.waitForElement('form[data-testid="personal_details-form"]', longTimeout);
  I.dontSee(constants.duplicateUserError);
  I.dontSee(constants.registrationFormSelector);

  I.fillField('firstName', 'John');
  I.fillField('lastName', 'Doe');

  I.click('Continue');
  I.waitForLoaderDone();

  I.see('Welcome to JW OTT Web App (AuthVod)');
});
