import constants from '../../utils/constants';
import passwordUtils from '../../utils/password_utils';
import { tryToSubmitForm, fillAndCheckField, checkField } from '../../utils/login';

const fieldRequired = 'This field is required';
const invalidEmail = 'Please re-enter your email details and try again.';
const incorrectLogin = 'Incorrect email/password combination';
const formFeedback = 'div[class*=formFeedback]';

Feature('login - account').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(({ I }) => {
  I.useConfig('test--accounts', constants.loginUrl);
  I.waitForElement(constants.loginFormSelector, 10);
});

Scenario('I can close the modal', async ({ I }) => {
  I.clickCloseButton();
  I.dontSee('Email');
  I.dontSee('Password');
  I.dontSeeElement(constants.loginFormSelector);
});

Scenario('I can close the modal by clicking outside', async ({ I }) => {
  I.forceClick('div[data-testid="backdrop"]');

  I.dontSee('Email');
  I.dontSee('Password');
  I.dontSeeElement(constants.loginFormSelector);
});

Scenario('I can toggle to view password', async ({ I }) => {
  await passwordUtils.testPasswordToggling(I);
});

Scenario('I get a warning when the form is incompletely filled in', async ({ I }) => {
  tryToSubmitForm(I);

  checkField(I, 'email', fieldRequired);
  checkField(I, 'password', fieldRequired);
});

Scenario('I see email warnings', async ({ I }) => {
  I.fillField('email', 'danny@email.com');
  I.fillField('password', 'Password');

  // No errors before form is submitted
  fillAndCheckField(I, 'email', 'danny');
  fillAndCheckField(I, 'email', '');

  // Submit form and expect no loader (the form shouldn't actually post to the backend with invalid data)
  tryToSubmitForm(I);

  // Empty email warning is shown on submit
  checkField(I, 'email', fieldRequired);

  // Continue to see errors until a valid value is filled
  fillAndCheckField(I, 'email', 'danny', invalidEmail);
  fillAndCheckField(I, 'email', '', fieldRequired);

  // No error after valid value
  fillAndCheckField(I, 'email', 'danny@email.com');

  // No errors shown after a valid value
  fillAndCheckField(I, 'email', '');
  fillAndCheckField(I, 'email', 'danny');

  tryToSubmitForm(I);

  // Last check to see the invalid email warning on submit
  checkField(I, 'email', invalidEmail);
});

Scenario('I see empty password warnings', async ({ I }) => {
  I.fillField('email', 'danny@email.com');
  I.fillField('password', 'Password');

  // No errors before form is submitted
  fillAndCheckField(I, 'password', '');

  tryToSubmitForm(I);

  // Empty password warning shown after submit
  checkField(I, 'password', fieldRequired);

  // Error cleared if a valid value is filled
  fillAndCheckField(I, 'password', 'a');

  // No errors after valid value re-entered
  fillAndCheckField(I, 'password', '');

  tryToSubmitForm(I);

  // Error back after submitting again
  checkField(I, 'password', fieldRequired);
});

Scenario('I see a login error message', async ({ I }) => {
  I.fillField('email', 'danny@email.com');
  I.fillField('password', 'Password');

  I.submitForm();

  I.see(incorrectLogin);
  I.seeCssPropertiesOnElements(formFeedback, { 'background-color': 'rgb(255, 12, 62)' });

  checkField(I, 'email', true);
  checkField(I, 'password', true);

  // Failed login maintains the email but clears the password field
  I.waitForValue('input[name=email]', 'danny@email.com', 0);
  I.waitForValue('input[name=password]', '', 0);
});

Scenario('I can login', async ({ I }) => {
  I.login();

  I.dontSee('Sign in');
  I.dontSee('Sign up');

  await I.openMainMenu();

  I.dontSee('Sign in');
  I.dontSee('Sign up');

  I.see('Account');
  I.see('Favorites');
  I.see('Log out');
});

Scenario('I can log out', async ({ I }) => {
  I.login();

  const isMobile = await I.openMainMenu();

  I.click('Log out');

  if (isMobile) {
    I.openMenuDrawer();
  }

  I.see('Sign in');
  I.see('Sign up');
});
