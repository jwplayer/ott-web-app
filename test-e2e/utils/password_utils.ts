import assert from 'assert';

export interface LoginContext {
  email: string;
  password: string;
}

async function testPasswordToggling(I: CodeceptJS.I, name = 'password') {
  await I.enableClipboard();
  await I.writeClipboard('');

  I.fillField({ name }, 'password123!');

  await checkPasswordType(I, name, 'password');
  // When the input type is password, you should not be able to copy the password value
  await tryToCopyPassword(I, name, '');

  I.click(`input[name="${name}"]+div div[aria-label="View password"]`);
  await checkPasswordType(I, name, 'text');
  // When the input type is text, you should be able to copy the password value
  await tryToCopyPassword(I, name, 'password123!');

  await I.writeClipboard('dummy');

  I.click(`input[name="${name}"]+div div[aria-label="Hide password"]`);
  await checkPasswordType(I, name, 'password');

  // Password should not be able to be copied again and whatever is in the clipboard should stay in the clipboard
  await tryToCopyPassword(I, name, 'dummy');
}

async function checkPasswordType(I: CodeceptJS.I, name, expectedType) {
  assert.strictEqual(await I.grabAttributeFrom(`input[name="${name}"]`, 'type'), expectedType);
}

async function tryToCopyPassword(I: CodeceptJS.I, name, expectedResult) {
  // Use Ctrl + A, Ctrl + C to highlight and copy the password
  I.click(`input[name="${name}"]`);

  await I.pressKey(['CommandOrControl', 'A']);
  await I.pressKey(['CommandOrControl', 'C']);
  // For some reason keyboard copy doesn't work when running via yarn
  await I.executeScript(() => document.execCommand('copy'));

  const clipboard = await I.readClipboard();

  assert.strictEqual(clipboard, expectedResult);
}

export default {
  testPasswordToggling,
  createRandomEmail: function () {
    return `dummy-${Date.now()}-${Math.floor(Math.random() * 10 ** 6)}@jwplayer.com`;
  },
  createRandomPassword: function () {
    return `ABCDefgh${Math.floor(Math.random() * 10 ** 12)}!`;
  },
};
