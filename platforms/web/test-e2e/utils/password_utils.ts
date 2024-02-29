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

  I.click(`input[name="${name}"]+div div[aria-label="View password"]`);
  await checkPasswordType(I, name, 'text');

  await I.writeClipboard('dummy');

  I.click(`input[name="${name}"]+div div[aria-label="Hide password"]`);
  await checkPasswordType(I, name, 'password');
}

async function checkPasswordType(I: CodeceptJS.I, name, expectedType) {
  assert.strictEqual(await I.grabAttributeFrom(`input[name="${name}"]`, 'type'), expectedType);
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
