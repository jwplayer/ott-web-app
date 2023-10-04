import passwordUtils, { LoginContext } from '#utils/password_utils';
import constants, { longTimeout, normalTimeout } from '#utils/constants';
import { testConfigs } from '#test/constants';

const editAccount = 'Edit account';
const editDetails = 'Edit information';
const emailField = 'email';
const passwordField = 'confirmationPassword';
const firstNameField = 'firstName';
const lastNameField = 'lastName';
const consentCheckbox = 'Yes, I want to receive Blender updates by email';

const firstName = 'John Q.';
const lastName = 'Tester';

runTestSuite(testConfigs.jwpSvod, 'JW Player', 'direct', false);
runTestSuite(testConfigs.svod, 'Cleeng', 'resetLink', true);

function runTestSuite(config: typeof testConfigs.svod, providerName: string, resetPasswordType: string, canEditEmail: boolean) {
  let loginContext: LoginContext;

  Feature(`account - ${providerName}`).retry(Number(process.env.TEST_RETRY_COUNT) || 0);

  Before(async ({ I }) => {
    I.useConfig(config);

    loginContext = await I.registerOrLogin(loginContext, () => {
      I.fillField('firstName', firstName);
      I.fillField('lastName', lastName);

      I.click('Continue');
      I.waitForLoaderDone();

      I.clickCloseButton();
    });
  });

  Scenario(`I can see my account data - ${providerName}`, async ({ I }) => {
    I.seeInCurrentUrl(constants.baseUrl);
    await I.openMainMenu();

    I.click('Account');

    I.see('Email');
    I.see(loginContext.email);

    if (canEditEmail) {
      I.see(editAccount);
    }

    I.see('Password');
    I.see('Edit password');

    I.see('Profile info');
    I.see('First name');
    I.see(firstName);
    I.see('Last name');
    I.see(lastName);
    I.see('Edit information');

    I.see('Legal & Marketing');
    I.see(`I accept the Terms and Conditions of ${providerName}.`);
    I.see(consentCheckbox);

    I.seeInCurrentUrl(constants.accountsUrl);
  });

  Scenario(`I can cancel Edit account - ${providerName}`, async ({ I }) => {
    if (!canEditEmail) return;

    editAndCancel(I, editAccount, [
      { name: emailField, startingValue: loginContext.email, newValue: 'user@email.nl' },
      { name: passwordField, startingValue: '', newValue: 'pass123!?' },
    ]);
  });

  Scenario(`I get a duplicate email warning - ${providerName}`, async ({ I }) => {
    if (!canEditEmail) return;

    editAndCancel(I, editAccount, [
      {
        name: emailField,
        startingValue: loginContext.email,
        newValue: constants.username,
        expectedError: 'Email already exists!',
      },
      {
        name: passwordField,
        startingValue: '',
        newValue: loginContext.password,
      },
    ]);
  });

  Scenario(`I get a wrong password warning - ${providerName}`, async ({ I }) => {
    if (!canEditEmail) return;

    editAndCancel(I, editAccount, [
      {
        name: emailField,
        startingValue: loginContext.email,
        newValue: loginContext.email,
      },
      {
        name: passwordField,
        startingValue: '',
        newValue: 'ABCDEF123!',
        expectedError: 'Password incorrect!',
      },
    ]);
  });

  Scenario(`I can toggle to view/hide my password - ${providerName}`, async ({ I }) => {
    if (!canEditEmail) return;

    I.amOnPage(constants.accountsUrl);
    I.click(editAccount);
    await passwordUtils.testPasswordToggling(I, 'confirmationPassword');
  });

  Scenario(`I can reset my password (reset link) - ${providerName}`, async ({ I }) => {
    if (resetPasswordType !== 'resetlink') return;

    I.amOnPage(constants.accountsUrl);

    I.click('Edit password');
    I.see("If you want to edit your password, click 'YES, Reset' to receive password reset instruction on your mail");
    I.see('Yes, reset');
    I.see('No, thanks');

    I.click('No, thanks');
    I.dontSee('Yes, reset');
    I.click('Edit password');
    I.see('Yes, reset');
    I.clickCloseButton();
    I.dontSee('Yes, reset');
    I.click('Edit password');

    I.click('Yes, reset');
    I.see('Password link sent');
    I.see(`Please check your inbox at ${loginContext.email}`);
    I.see('Back to login');

    I.click('Back to login');
    I.see('Sign in');

    I.clickCloseButton();
    await I.login({ email: loginContext.email, password: loginContext.password });
  });

  Scenario(`I can update firstName - ${providerName}`, async ({ I }) => {
    editAndSave(I, editDetails, [
      {
        name: firstNameField,
        newValue: '',
      },
    ]);

    editAndSave(I, editDetails, [
      {
        name: firstNameField,
        newValue: 'Jack',
      },
    ]);

    editAndSave(I, editDetails, [
      {
        name: firstNameField,
        newValue: firstName,
      },
    ]);
  });

  Scenario(`I can update lastName - ${providerName}`, async ({ I }) => {
    editAndSave(I, editDetails, [
      {
        name: lastNameField,
        newValue: '',
      },
    ]);

    editAndSave(I, editDetails, [
      {
        name: lastNameField,
        newValue: 'Jones',
      },
    ]);

    editAndSave(I, editDetails, [
      {
        name: lastNameField,
        newValue: lastName,
      },
    ]);
  });

  Scenario(`I can update details - ${providerName}`, async ({ I }) => {
    editAndSave(I, editDetails, [
      {
        name: firstNameField,
        newValue: '',
      },
      {
        name: lastNameField,
        newValue: '',
      },
    ]);

    editAndSave(I, editDetails, [
      {
        name: firstNameField,
        newValue: 'Newname',
      },
      {
        name: lastNameField,
        newValue: 'McName',
      },
    ]);

    editAndSave(I, editDetails, [
      {
        name: firstNameField,
        newValue: firstName,
      },
      {
        name: lastNameField,
        newValue: lastName,
      },
    ]);
  });

  Scenario(`I see name limit errors - ${providerName}`, async ({ I }) => {
    editAndCancel(I, editDetails, [
      {
        name: firstNameField,
        startingValue: firstName,
        newValue: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        expectedError: 'Please limit First Name to 50 characters or fewer.',
      },
      {
        name: lastNameField,
        startingValue: lastName,
        newValue: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        expectedError: 'Please limit Last Name to 50 characters or fewer.',
      },
    ]);
  });

  Scenario(`I can update my consents - ${providerName}`, async ({ I }) => {
    I.amOnPage(constants.accountsUrl);
    I.waitForText('Profile info', longTimeout);
    I.scrollTo('//*[text() = "Legal & Marketing"]', undefined, -100);

    I.dontSeeCheckboxIsChecked(consentCheckbox);
    I.dontSee('Save');
    I.dontSee('Cancel');

    I.checkOption(consentCheckbox);
    I.seeCheckboxIsChecked(consentCheckbox);

    I.see('Save');
    I.see('Cancel');

    I.scrollTo('//*[text() = "Cancel"]');
    I.click('Cancel');

    I.dontSeeCheckboxIsChecked(consentCheckbox);
    I.dontSee('Save');
    I.dontSee('Cancel');

    I.checkOption(consentCheckbox);

    I.see('Save');
    I.see('Cancel');

    I.scrollTo('//*[text() = "Save"]');
    I.click('Save');
    I.waitForLoaderDone();

    I.seeCheckboxIsChecked(consentCheckbox);
  });

  Scenario(`I can change email - ${providerName}`, async ({ I }) => {
    if (!canEditEmail) return;

    const newEmail = passwordUtils.createRandomEmail();

    editAndSave(I, editAccount, [
      { name: emailField, newValue: newEmail },
      { name: passwordField, newValue: loginContext.password },
    ]);

    await I.logout();

    await I.login({ email: newEmail, password: loginContext.password });

    editAndSave(I, editAccount, [
      { name: emailField, newValue: loginContext.email },
      { name: passwordField, newValue: loginContext.password },
    ]);
  });

  function editAndSave(I: CodeceptJS.I, editButton: string, fields: { name: string; newValue: string; expectedError?: string }[]) {
    I.amOnPage(constants.accountsUrl);
    I.waitForElement(`//*[text() = "${editButton}"]`, normalTimeout);
    I.scrollTo(`//*[text() = "${editButton}"]`);
    I.click(editButton);

    I.see('Save');
    I.see('Cancel');

    const fieldsWithPaths = fields.map((f) => {
      return { ...f, xpath: `//input[@name='${f.name}']` };
    });

    for (const field of fieldsWithPaths) {
      I.seeElement(field.xpath);

      if (field.newValue) {
        I.fillField(field.xpath, field.newValue);
      } else {
        I.click(field.xpath);
        I.pressKey(['CommandOrControl', 'a']);
        I.pressKey('Backspace');
      }
    }

    I.click('Save');
    I.waitForLoaderDone();

    I.dontSee('Save');
    I.dontSee('Cancel');

    fieldsWithPaths.forEach((field) => {
      I.dontSee(field.xpath);

      if (field.newValue && field.name !== passwordField) {
        I.see(field.newValue);
      }
    });

    I.click(editButton);

    for (const field of fieldsWithPaths) {
      I.seeElement(field.xpath);
      I.waitForValue(field.xpath, field.name !== passwordField ? field.newValue : '');
    }

    I.click('Cancel');
  }

  function editAndCancel(I: CodeceptJS.I, editButton: string, fields: { name: string; startingValue: string; newValue: string; expectedError?: string }[]) {
    I.amOnPage(constants.accountsUrl);
    I.click(editButton);

    I.see('Save');
    I.see('Cancel');

    const fieldsWithPaths = fields.map((f) => {
      return { ...f, xpath: `//input[@name='${f.name}']` };
    });

    for (const field of fieldsWithPaths) {
      I.waitForElement(field.xpath);
      I.waitForValue(field.xpath, field.startingValue, 0);
      I.fillField(field.xpath, field.newValue);
    }

    // If expecting errors, try to save first
    if (fieldsWithPaths.some((field) => field.expectedError)) {
      I.click('Save');
      I.waitForLoaderDone();

      I.see('Save');
      I.see('Cancel');

      for (const field of fieldsWithPaths) {
        I.seeElement(field.xpath);
        if (field.name !== passwordField) {
          I.waitForValue(field.xpath, field.newValue, 0);
        }

        if (field.expectedError) {
          I.see(field.expectedError, `//input[@name='${field.name}']/../..`);
        }
      }
    }

    I.click('Cancel');

    I.dontSee('Save');
    I.dontSee('Cancel');

    fieldsWithPaths.forEach((field) => {
      I.dontSee(field.xpath);
      if (field.name !== passwordField) {
        I.see(field.startingValue);
      }
    });

    I.click(editButton);

    for (const field of fieldsWithPaths) {
      I.seeElement(field.xpath);
      I.waitForValue(field.xpath, field.name === passwordField ? '' : field.startingValue, 0);
    }
  }
}
