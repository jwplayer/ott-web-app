import passwordUtils, { LoginContext } from '#utils/password_utils';
import constants from '#utils/constants';
import { testConfigs } from '#test/constants';

const editAccount = 'Edit account';
const editDetials = 'Edit information';
const emailField = 'email';
const passwordField = 'confirmationPassword';
const firstNameField = 'firstName';
const lastNameField = 'lastName';
const consentCheckbox = 'Yes, I want to receive Blender updates by email';

const loginContexts: { [key: string]: LoginContext } = {};
const firstName = 'John Q.';
const lastName = 'Tester';

Feature('account').retry(Number(process.env.TEST_RETRY_COUNT) || 0);
const configs = new DataTable(['config', 'authProvider', 'resetPasswordType', 'canEditEmail']);
configs.add([testConfigs.svod, 'Cleeng', 'resetlink', true]);
configs.xadd([testConfigs.inplayerSvod, 'InPlayer', 'direct', false]);

Data(configs).Scenario('I can see my account data', async ({ I, current }) => {
  loginContexts[current.config.label] = await I.beforeAccount(current.config, loginContexts[current.config.label], firstName, lastName);
  I.seeInCurrentUrl(constants.baseUrl);
  await I.openMainMenu();

  I.click('Account');

  I.see('Email');
  I.see(loginContexts[current.config.label].email);
  if (current.canEditEmail) {
    I.see(editAccount);
  }

  I.see('Security');
  I.see('Password');
  I.see('****************');
  I.see('Edit password');

  I.see('About you');
  I.see('First name');
  I.see(firstName);
  I.see('Last name');
  I.see(lastName);
  I.see('Edit information');

  I.see('Terms & tracking');
  I.see(`I accept the Terms and Conditions of ${current.authProvider}.`);
  I.see(consentCheckbox);

  I.seeInCurrentUrl(constants.accountsUrl);
});

Data(configs).Scenario('I can cancel Edit account', async ({ I, current }) => {
  if (!current.canEditEmail) {
    return;
  }
  loginContexts[current.config.label] = await I.beforeAccount(current.config, loginContexts[current.config.label], firstName, lastName);
  editAndCancel(I, editAccount, [
    { name: emailField, startingValue: loginContexts[current.config.label].email, newValue: 'user@email.nl' },
    { name: passwordField, startingValue: '', newValue: 'pass123!?' },
  ]);
});

Data(configs).Scenario('I get a duplicate email warning', async ({ I, current }) => {
  if (!current.canEditEmail) {
    return;
  }
  loginContexts[current.config.label] = await I.beforeAccount(current.config, loginContexts[current.config.label], firstName, lastName);
  editAndCancel(I, editAccount, [
    {
      name: emailField,
      startingValue: loginContexts[current.config.label].email,
      newValue: constants.username,
      expectedError: 'Email already exists!',
    },
    {
      name: passwordField,
      startingValue: '',
      newValue: loginContexts[current.config.label].password,
    },
  ]);
});

Data(configs).Scenario('I get a wrong password warning', async ({ I, current }) => {
  if (!current.canEditEmail) {
    return;
  }
  loginContexts[current.config.label] = await I.beforeAccount(current.config, loginContexts[current.config.label], firstName, lastName);
  editAndCancel(I, editAccount, [
    {
      name: emailField,
      startingValue: loginContexts[current.config.label].email,
      newValue: loginContexts[current.config.label].email,
    },
    {
      name: passwordField,
      startingValue: '',
      newValue: 'ABCDEF123!',
      expectedError: 'Password incorrect!',
    },
  ]);
});

Data(configs).Scenario('I can toggle to view/hide my password', async ({ I, current }) => {
  if (!current.canEditEmail) {
    return;
  }
  loginContexts[current.config.label] = await I.beforeAccount(current.config, loginContexts[current.config.label], firstName, lastName);
  I.amOnPage(constants.accountsUrl);
  I.click(editAccount);
  await passwordUtils.testPasswordToggling(I, 'confirmationPassword');
});

Data(configs).Scenario('I can reset my password (ResetLink)', async ({ I, current }) => {
  if (current.resetPasswordType !== 'resetlink') {
    return;
  }
  loginContexts[current.config.label] = await I.beforeAccount(current.config, loginContexts[current.config.label], firstName, lastName);
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
  I.see(`Please check your inbox at ${loginContexts[current.config.label].email}`);
  I.see('Back to login');

  I.click('Back to login');
  I.see('Sign in');

  I.clickCloseButton();
  await I.login({ email: loginContexts[current.config.label].email, password: loginContexts[current.config.label].password });
});

Data(configs).Scenario('I can update firstName', async ({ I, current }) => {
  loginContexts[current.config.label] = await I.beforeAccount(current.config, loginContexts[current.config.label], firstName, lastName);
  editAndSave(I, editDetials, [
    {
      name: firstNameField,
      newValue: '',
    },
  ]);

  editAndSave(I, editDetials, [
    {
      name: firstNameField,
      newValue: 'Jack',
    },
  ]);

  editAndSave(I, editDetials, [
    {
      name: firstNameField,
      newValue: firstName,
    },
  ]);
});

Data(configs).Scenario('I can update lastName', async ({ I, current }) => {
  loginContexts[current.config.label] = await I.beforeAccount(current.config, loginContexts[current.config.label], firstName, lastName);
  editAndSave(I, editDetials, [
    {
      name: lastNameField,
      newValue: '',
    },
  ]);

  editAndSave(I, editDetials, [
    {
      name: lastNameField,
      newValue: 'Jones',
    },
  ]);

  editAndSave(I, editDetials, [
    {
      name: lastNameField,
      newValue: lastName,
    },
  ]);
});

Data(configs).Scenario('I can update details', async ({ I, current }) => {
  loginContexts[current.config.label] = await I.beforeAccount(current.config, loginContexts[current.config.label], firstName, lastName);

  editAndSave(I, editDetials, [
    {
      name: firstNameField,
      newValue: '',
    },
    {
      name: lastNameField,
      newValue: '',
    },
  ]);

  editAndSave(I, editDetials, [
    {
      name: firstNameField,
      newValue: 'Newname',
    },
    {
      name: lastNameField,
      newValue: 'McName',
    },
  ]);

  editAndSave(I, editDetials, [
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

Data(configs).Scenario('I see name limit errors', async ({ I, current }) => {
  loginContexts[current.config.label] = await I.beforeAccount(current.config, loginContexts[current.config.label], firstName, lastName);
  editAndCancel(I, editDetials, [
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

Data(configs).Scenario('I can update my consents', async ({ I, current }) => {
  loginContexts[current.config.label] = await I.beforeAccount(current.config, loginContexts[current.config.label], firstName, lastName);
  I.amOnPage(constants.accountsUrl);

  I.dontSeeCheckboxIsChecked(consentCheckbox);
  I.dontSee('Save');
  I.dontSee('Cancel');

  I.checkOption(consentCheckbox);
  I.seeCheckboxIsChecked(consentCheckbox);

  I.see('Save');
  I.see('Cancel');

  I.click('Cancel');

  I.dontSeeCheckboxIsChecked(consentCheckbox);
  I.dontSee('Save');
  I.dontSee('Cancel');

  I.checkOption(consentCheckbox);

  I.see('Save');
  I.see('Cancel');

  I.click('Save');
  I.waitForLoaderDone();

  I.seeCheckboxIsChecked(consentCheckbox);
});

Data(configs).Scenario('I can change email', async ({ I, current }) => {
  if (!current.canEditEmail) {
    return;
  }
  loginContexts[current.config.label] = await I.beforeAccount(current.config, loginContexts[current.config.label], firstName, lastName);
  const newEmail = passwordUtils.createRandomEmail();

  editAndSave(I, editAccount, [
    { name: emailField, newValue: newEmail },
    { name: passwordField, newValue: loginContexts[current.config.label].password },
  ]);

  await I.logout();

  await I.login({ email: newEmail, password: loginContexts[current.config.label].password });

  editAndSave(I, editAccount, [
    { name: emailField, newValue: loginContexts[current.config.label].email },
    { name: passwordField, newValue: loginContexts[current.config.label].password },
  ]);
});

function editAndSave(I: CodeceptJS.I, editButton: string, fields: { name: string; newValue: string; expectedError?: string }[]) {
  I.amOnPage(constants.accountsUrl);

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
    I.seeElement(field.xpath);
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
