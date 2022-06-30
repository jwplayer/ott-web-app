import constants from '../../utils/constants';

Feature('login - home').retry(3);

Before(({ I }) => {
  I.useConfig('test--accounts', constants.loginUrl);
});

Scenario('Sign-in buttons show for accounts config', async ({ I }) => {
  I.useConfig('test--accounts');

  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.see('Sign in');
  I.see('Sign up');
});

Scenario('Sign-in buttons don`t show for config without accounts', async ({ I }) => {
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
