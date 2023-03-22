import constants, { longTimeout } from '#utils/constants';
import { testConfigs } from '#test/constants';
import { LoginContext } from '#utils/password_utils';

const loginContexts: { [key: string]: LoginContext } = {};

Feature('login - home').retry(Number(process.env.TEST_RETRY_COUNT) || 0);
const configs = new DataTable(['config']);
configs.add([testConfigs.cleengAuthvod]);
configs.add([testConfigs.jwpAuth]);

Data(configs).Scenario('Sign-in buttons show for accounts config', async ({ I, current }) => {
  I.useConfig(current.config);
  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.see('Sign in');
  I.see('Sign up');
});

Data(configs).Scenario('Sign-in buttons don`t show for config without accounts', async ({ I, current }) => {
  I.useConfig(current.config);
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

Data(configs).Scenario('I can open the log in modal', async ({ I, current }) => {
  I.useConfig(current.config);
  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.click('Sign in');
  I.waitForElement(constants.loginFormSelector, longTimeout);

  await I.seeQueryParams({ u: 'login' });

  I.see('Sign in');
  I.see('Email');
  I.see('Password');
  I.see('Forgot password');
  I.see('New to JW OTT Web App (AuthVod)?');
  I.see('Sign up');
});

Data(configs).Scenario('I can login', async ({ I, current }) => {
  I.useConfig(current.config);
  loginContexts[current.config.label] = await I.registerOrLogin(loginContexts[current.config.label]);

  I.dontSee('Sign in');
  I.dontSee('Sign up');

  await I.openMainMenu();

  I.dontSee('Sign in');
  I.dontSee('Sign up');

  I.see('Account');
  I.see('Favorites');
  I.see('Log out');
});

Data(configs).Scenario('I can log out', async ({ I, current }) => {
  I.useConfig(current.config);
  loginContexts[current.authProvider] = await I.registerOrLogin(loginContexts[current.authProvider]);

  const isMobile = await I.openMainMenu();

  I.click('Log out');

  if (isMobile) {
    I.openMenuDrawer();
  }

  I.see('Sign in');
  I.see('Sign up');
});
