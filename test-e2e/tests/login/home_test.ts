import constants from '../../utils/constants';
import { testConfigs } from '../../../test/constants';

Feature('login - home').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(({ I }) => {
  I.useConfig(testConfigs.authvod);
});

Scenario('Sign-in buttons show for accounts config', async ({ I }) => {
  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.see('Sign in');
  I.see('Sign up');
});

Scenario('Sign-in buttons don`t show for config without accounts', async ({ I }) => {
  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.see('Sign in');
  I.see('Sign up');

  I.useConfig(testConfigs.basicNoAuth);

  I.dontSee('Sign in');
  I.dontSee('Sign up');

  if (await I.isMobile()) {
    I.openMenuDrawer();

    I.dontSee('Sign in');
    I.dontSee('Sign up');
  }
});

Scenario('I can open the log in modal', async ({ I }) => {
  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.click('Sign in');
  I.waitForElement(constants.loginFormSelector, 15);

  await I.seeQueryParams({ u: 'login' });

  I.see('Sign in');
  I.see('Email');
  I.see('Password');
  I.see('Forgot password');
  I.see('New to JW OTT Web App (AuthVod)?');
  I.see('Sign up');
});

Scenario('I can login', async ({ I }) => {
  await I.login();

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
  await I.login();

  const isMobile = await I.openMainMenu();

  I.click('Log out');

  if (isMobile) {
    I.openMenuDrawer();
  }

  I.see('Sign in');
  I.see('Sign up');
});
