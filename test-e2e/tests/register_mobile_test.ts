import {constants, functions, selectors} from '../utils/utils';

Feature('register').tag('@mobile');

Before(({I}) => {
  I.amOnPage('http://localhost:8080?c=test--accounts');
  openModal(I);
});

Scenario('I can open the register modal', ({ I }) => {
  I.seeElement('[data-testid="registration-form"]');
});

Scenario('I can close the modal', ({ I }) => {
  I.click(selectors.closeButton);
  I.dontSeeElement(selectors.registrationForm);
  I.dontSee('Email');
  I.dontSee('Password');
  functions.openDrawer(I)
});

Scenario('I can switch to the Sign In modal', ({ I }) => {
  I.click('Sign in', selectors.registrationForm);
  I.seeElement(selectors.loginForm);
  I.see('Forgot password');
  I.dontSee(selectors.registrationForm);
  I.click('Sign up', selectors.loginForm);
  I.seeElement(selectors.registrationForm);
  I.see('Already have an account?')
  I.dontSeeElement(selectors.loginForm);
});

Scenario('The submit button is disabled when the form is incompletely filled in', async ({ I }) => {
  I.seeAttributesOnElements('button[type="submit"]', {disabled: true});
});

Scenario('I get warned when filling in incorrect credentials', async ({ I }) => {
  I.fillField('Email', 'test');
  I.pressKey('Tab');
  I.see('Please re-enter your email details');
  I.fillField('Email', '12345@test.org');
  I.dontSee('Please re-enter your email details');

  function checkColor(expectedColor) {
    I.seeCssPropertiesOnElements('text="Use a minimum of 8 characters (case sensitive) with at least one number"',
        {color: expectedColor});
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
    I.seeCssPropertiesOnElements('div[class*="passwordStrengthFill"]',
        {'background-color': expectedColor});
    I.see(expectedText);

    I.seeCssPropertiesOnElements(`text="${expectedText}"`, {color: expectedColor});

    textOptions.filter(opt => opt !== expectedText).forEach(opt => I.dontSee(opt));
  }

  checkFeedback('1111aaaa', 'orangered', 'Weak');
  checkFeedback('1111aaaA', 'orange', 'Fair');
  checkFeedback('1111aaaA!', 'yellowgreen', 'Strong');
  checkFeedback('Ax854bZ!$', 'green', 'Very strong');
});

Scenario('I can toggle to view password', async ({ I }) => {
  checkInputType('password');

  I.click('div[aria-label="View password"]');
  checkInputType('text');

  I.click('div[aria-label="Hide password"]');
  checkInputType('password');

  function checkInputType(expectedType) {
    I.seeAttributesOnElements('input[name="password"]', {type: expectedType});
  }
})

Scenario('I can\'t submit without checking required consents', async ({ I }) => {
  I.fillField('Email', 'test@123.org');
  I.fillField('Password', 'pAssword123!');

  I.click('Continue');

  I.seeCssPropertiesOnElements('input[name="terms"]', { 'border-color': '#ff0c3e'});
});

Scenario('I get warned for duplicate users', ({ I }) => {
  I.fillField('Email', constants.username);
  I.fillField('Password', 'Password123!');
  I.checkOption('Terms and Conditions');
  I.click('Continue');
  I.waitForElement('text="There is already a user with this email address"', 5);
});

Scenario('I can register', ({ I }) => {
  I.fillField('Email', `dummy-${Date.now()}-${Math.floor(Math.random()*10**6)}@jwplayer.com`);
  I.fillField('Password', `ABCDefgh${Math.floor(Math.random()*10**12)}!`);
  I.checkOption('Terms and Conditions');
  I.click('Continue');
  I.waitForElement('form[data-testid="personal_details-form"]', 15);
  I.dontSee('There is already a user with this email address');
  I.dontSee(selectors.registrationForm);
});

function openModal(I) {
  functions.openDrawer(I);

  I.click('Sign up');

  I.waitForElement(selectors.registrationForm, 5);
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
}