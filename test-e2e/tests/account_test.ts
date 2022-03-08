import assert from "assert";

import passwordUtils from "../utils/password_utils";
import constants from '../utils/constants';

Feature('account');

const editAccount = 'Edit account';
const editDetials = 'Edit information';
const emailField = 'email';
const passwordField = 'confirmationPassword';
const firstNameField = 'firstName';
const lastNameField = 'lastName';
const consentCheckbox = 'Yes, I want to receive Blender updates by email.';

const email = passwordUtils.createRandomEmail();
const password = passwordUtils.createRandomPassword();
const firstName = 'Testing';
const lastName = 'Userski';
let isRegistered = false;

Before(async({I})=> {
  I.amOnPage('http://localhost:8080?c=test--subscription');

  let isMobile;

  if (!isRegistered) {
    isMobile = (await I.openRegisterForm()).isMobile;
    await I.fillRegisterForm({
      email,
      password,
      firstName,
      lastName
    });

    I.see('Subscription');
    I.clickCloseButton();

    isRegistered = true;
  } else {
    isMobile = (await I.login(email, password)).isMobile;
  }

  if (isMobile) {
    I.openMenuDrawer();
  } else {
    I.openUserMenu();
  }

  I.click('Account');
});

function openAccountForm(I: CodeceptJS.I, isMobile) {
  if (isMobile) {
    I.openMenuDrawer();
  } else {
    I.openUserMenu();
  }

  I.click('Account');
}

Scenario('I can see my account data', async ({ I }) => {

  I.see('Email');
  I.see(email);
  I.see(editAccount);

  I.see('Security');
  I.see('Password');
  I.see('****************');
  I.see('Edit password');

  I.see('About you');
  I.see('First name');
  I.see('Last name');
  I.see('Edit information');

  I.see('Terms & tracking');
  I.see('I accept the Terms and Conditions of Cleeng.');
  I.see('Yes, I want to receive Blender updates by email.');
});

Scenario('I can cancel Edit account', ({ I }) => {
  editAndCancel(I, editAccount, [
    {name: emailField, startingValue: email, newValue: 'user@email.nl'},
    {name: passwordField, startingValue: '', newValue: 'pass123!?'},
  ]);
});

Scenario('I get a duplicate email warning', ({ I }) => {
  editAndCancel(I, editAccount, [
    {
      name: emailField,
      startingValue: email,
      newValue: constants.username,
      expectedError: 'Email already exists!'
    }, {
      name: passwordField,
      startingValue: '',
      newValue: password
    }
  ]);
});

Scenario('I get a wrong password warning', ({ I }) => {
  editAndCancel(I, editAccount, [
    {
      name: emailField,
      startingValue: email,
      newValue: email
    }, {
      name: passwordField,
      startingValue: '',
      newValue: 'ABCDEF123!',
      expectedError: 'Password incorrect!'
    }
  ]);
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

Scenario('I can reset my password', async ({ I }) => {
  I.click('Edit password');
  I.see('If you want to edit your password, click \'YES, Reset\' to receive password reset instruction on your mail');
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
  I.see(`Please check your inbox at ${email}`);
  I.see('Back to login');

  I.click('Back to login');
  I.see('Sign in');

  I.clickCloseButton();
  await I.login(email, password);
  I.click('div[aria-label="Open user menu"]');
  I.click('Account');
})

Scenario('I can update firstName', ({ I }) => {
  editAndSave(I, editDetials, [
    {
      name: firstNameField,
      startingValue: firstName,
      newValue: 'a'
    }
  ]);

  editAndSave(I, editDetials, [
    {
      name: firstNameField,
      startingValue: 'a',
      newValue: 'John'
    }
  ]);

  editAndSave(I, editDetials, [
    {
      name: firstNameField,
      startingValue: '',
      newValue: firstName
    }
  ]);
});

Scenario('I can update lastName', ({ I }) => {
  editAndSave(I, editDetials, [
    {
      name: lastNameField,
      startingValue: lastName,
      newValue: 'b'
    }
  ]);

  editAndSave(I, editDetials, [
    {
      name: lastNameField,
      startingValue: 'b',
      newValue: 'Johnson'
    }
  ]);

  editAndSave(I, editDetials, [
    {
      name: lastNameField,
      startingValue: '',
      newValue: lastName
    }
  ]);
});

Scenario('I can update details', ({ I }) => {
  editAndSave(I, editDetials, [
    {
      name: firstNameField,
      startingValue: firstName,
      newValue: ''
    }, {
      name: lastNameField,
      startingValue: lastName,
      newValue: ''
    }
  ]);

  editAndSave(I, editDetials, [
    {
      name: firstNameField,
      startingValue: '',
      newValue: 'Newname'
    }, {
      name: lastNameField,
      startingValue: '',
      newValue: 'McName'
    }
  ]);

  editAndSave(I, editDetials, [
    {
      name: firstNameField,
      startingValue: 'Newname',
      newValue: firstName
    }, {
      name: lastNameField,
      startingValue: 'McName',
      newValue: lastName
    }
  ]);
});

Scenario('I see name limit errors', async ({ I })=> {
  editAndCancel(I, editDetials, [
    {
      name: firstNameField,
      startingValue: firstName,
      newValue: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      expectedError: 'Please limit First Name to 50 characters or fewer.'
    }, {
      name: lastNameField,
      startingValue: lastName,
      newValue: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      expectedError: 'Please limit Last Name to 50 characters or fewer.'
    }
  ])
});

Scenario('I can update my consents', async ({ I })=> {
  I.dontSeeCheckboxIsChecked(consentCheckbox)
  I.dontSee('Save');
  I.dontSee('Cancel');

  I.checkOption(consentCheckbox);
  I.seeCheckboxIsChecked(consentCheckbox);

  I.see('Save');
  I.see('Cancel');

  I.click("Cancel");

  I.dontSeeCheckboxIsChecked(consentCheckbox)
  I.dontSee('Save');
  I.dontSee('Cancel');

  I.checkOption(consentCheckbox);

  I.see('Save');
  I.see('Cancel');

  I.click('Save');
  I.waitForLoaderDone(5);

  I.seeCheckboxIsChecked(consentCheckbox);
});

Scenario('I can change email', async ({ I }) => {
  const newEmail = passwordUtils.createRandomEmail();

  editAndSave(I, editAccount, [
    {name: emailField, startingValue: email, newValue: newEmail},
    {name: passwordField, startingValue: '', newValue: password},
  ]);

  await I.logout();

  const isMobile = (await I.login(newEmail, password)).isMobile;

  openAccountForm(I, isMobile);

  editAndSave(I, editAccount, [
    {name: emailField, startingValue: newEmail, newValue: email},
    {name: passwordField, startingValue: '', newValue: password},
  ]);
});

function editAndSave(
    I: CodeceptJS.I,
    editButton: string,
    fields: {name: string, startingValue: string, newValue: string, expectedError?: string}[]) {

  // noinspection DuplicatedCode
  I.click(editButton);

  I.see('Save');
  I.see('Cancel');

  const fieldsWithPaths = fields.map(f => { return {...f, xpath: `//input[@name='${f.name}']`};});

  fieldsWithPaths.forEach(field => {
    I.seeElement(field.xpath);
    I.waitForValue(field.xpath, field.startingValue, 0);
    if (field.newValue) {
      I.fillField(field.xpath, field.newValue);
    } else {
      I.click(field.xpath);
      I.pressKey(['Control', 'a']);
      I.pressKey('Backspace');
    }
  });

  I.click('Save');
  I.waitForLoaderDone(5);

  I.dontSee('Save');
  I.dontSee('Cancel');

  fieldsWithPaths.forEach(field => {
    I.dontSee(field.xpath);

    if (field.newValue && field.name !== passwordField) {
      I.see(field.newValue);
    }
  });

  I.click(editButton);

  fieldsWithPaths.forEach(field => {
    I.seeElement(field.xpath);

    I.waitForValue(field.xpath, field.name !== passwordField ? field.newValue : '', 0);
  });

  I.click('Cancel');
}

function editAndCancel(
    I: CodeceptJS.I,
    editButton: string,
    fields: {name: string, startingValue: string, newValue: string, expectedError?: string}[]) {

  I.click(editButton);

  I.see('Save');
  I.see('Cancel');

  const fieldsWithPaths = fields.map(f => { return {...f, xpath: `//input[@name='${f.name}']`};});

  fieldsWithPaths.forEach(field => {
    I.seeElement(field.xpath);
    I.waitForValue(field.xpath, field.startingValue, 0);
    I.fillField(field.xpath, field.newValue);
  });

  // If expecting errors, try to save first
  if (fieldsWithPaths.some(field => field.expectedError)) {
    I.click('Save');

    I.see('Save');
    I.see('Cancel');

    fieldsWithPaths.forEach(field => {
      I.seeElement(field.xpath);
      I.waitForValue(field.xpath, field.newValue, 0);

      if (field.expectedError) {
        I.see(field.expectedError, `//input[@name='${field.name}']/../..`);
      }
    });
  }

  I.click('Cancel');

  I.dontSee('Save');
  I.dontSee('Cancel');

  fieldsWithPaths.forEach(field => {
    I.dontSee(field.xpath);
    if (field.name !== passwordField) {
      I.see(field.startingValue);
    }
  });

  I.click(editButton);

  fieldsWithPaths.forEach(field => {
    I.seeElement(field.xpath);
    I.waitForValue(field.xpath, field.name === passwordField ? '' : field.startingValue, 0);
  });
}