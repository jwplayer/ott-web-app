import constants from '../utils/constants';
import passwordUtils from '../utils/password_utils';

const fieldRequired = 'This field is required';
const invalidEmail = 'Please re-enter your email details and try again.';
const incorrectLogin = 'Incorrect email/password combination';
const formFeedback = 'div[class*=formFeedback]';

Feature('login');

Scenario('Sign-in buttons show for accounts config', async ({ I }) => {
  I.useConfig('test--accounts');

  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.see('Sign in');
  I.see('Sign up');
});

Scenario("Sign-in buttons don't show for config without accounts", async ({ I }) => {
  I.useConfig('test--no-cleeng');

  I.dontSee('Sign in');
  I.dontSee('Sign up');

  if (await I.isMobile()) {
    I.openMenuDrawer();

    I.dontSee('Sign in');
    I.dontSee('Sign up');
  }
});

Scenario('I can open the log in modal', async ({ I }) => {
  I.useConfig('test--accounts');

  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.click('Sign in');
  I.waitForElement(constants.loginFormSelector, 15);

  I.seeCurrentUrlEquals(constants.loginUrl);

  I.see('Sign in');
  I.see('Email');
  I.see('Password');
  I.see('Forgot password');
  I.see('New to Blender?');
  I.see('Sign up');
});

Feature('login - start from login page');

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

function tryToSubmitForm(I: CodeceptJS.I) {
  I.submitForm(false);
  I.dontSeeElement(formFeedback);
  I.dontSee('Incorrect email/password combination');
}

function fillAndCheckField(I: CodeceptJS.I, field, value, error: string | boolean = false) {
  if (value === '') {
    // For some reason the Codecept/playwright clear and fillField with empty string do not fire the change events
    // so use key presses to clear the field to avoid test-induced bugs
    I.click(`input[name="${field}"]`);
    I.pressKey(['Control', 'a']);
    I.pressKey('Backspace');
  } else {
    I.fillField(field, value);
  }

  I.mo;

  checkField(I, field, error);
}

function checkField(I: CodeceptJS.I, field, error: string | boolean = false) {
  const hoverColor = 'rgba(255, 255, 255, 0.7)';
  const activeColor = error ? 'rgb(255, 12, 62)' : 'rgb(255, 255, 255)';
  const restingColor = error ? 'rgb(255, 12, 62)' : 'rgba(255, 255, 255, 0.34)';

  // If error === true, there's an error, but no associated message
  if (error && error !== true) {
    I.see(error, `[data-testid=login-${field}-input]`);
    I.seeCssPropertiesOnElements(`[data-testid="login-${field}-input"] [class*=helperText]`, { color: '#ff0c3e' });
  } else {
    I.dontSeeElement('[class*=helperText]', `[data-testid="${field}-input"]`);
  }

  // There are 3 css states for the input fields, hover, active, and 'resting'. Check all 3.
  // This isn't so much for testing functionality, as it is to avoid test bugs caused by codecept placing the mouse
  // different places and accidentally triggering the wrong css color
  // Hover:
  I.click(`input[name="${field}"]`);
  I.seeCssPropertiesOnElements(`[data-testid="login-${field}-input"] [class*=container]`, { 'border-color': hoverColor });
  // Active (no hover):
  I.moveCursorTo('button[type=submit]');
  I.seeCssPropertiesOnElements(`[data-testid="login-${field}-input"] [class*=container]`, { 'border-color': activeColor });
  // Resting:
  I.click('div[class*=banner]');
  I.seeCssPropertiesOnElements(`[data-testid="login-${field}-input"] [class*=container]`, { 'border-color': restingColor });
}
