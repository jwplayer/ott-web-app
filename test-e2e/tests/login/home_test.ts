import constants, { longTimeout } from '#utils/constants';
import { testConfigs } from '#test/constants';
import { LoginContext } from '#utils/password_utils';

runTestSuite(testConfigs.jwpAuth, 'JW Player');
runTestSuite(testConfigs.cleengAuthvod, 'Cleeng');

function runTestSuite(config: typeof testConfigs.svod, providerName: string) {
  let loginContext: LoginContext;

  Feature(`login - home - ${providerName}`).retry(Number(process.env.TEST_RETRY_COUNT) || 0);

  Before(({ I }) => {
    I.useConfig(config);
  });

  Scenario(`Sign-in buttons show for accounts config - ${providerName}`, async ({ I }) => {
    if (await I.isMobile()) {
      I.openMenuDrawer();
    }

    I.see('Sign in');
    I.see('Sign up');
  });

  Scenario(`Sign-in buttons don't show for config without accounts - ${providerName}`, async ({ I }) => {
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

  Scenario(`I can open the log in modal - ${providerName}`, async ({ I }) => {
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

  Scenario(`I can login - ${providerName}`, async ({ I }) => {
    loginContext = await I.registerOrLogin(loginContext);

    I.dontSee('Sign in');
    I.dontSee('Sign up');

    await I.openMainMenu();

    I.dontSee('Sign in');
    I.dontSee('Sign up');

    I.see('Account');
    I.see('Favorites');
    I.see('Log out');
  });

  Scenario(`I can log out - ${providerName}`, async ({ I }) => {
    loginContext = await I.registerOrLogin(loginContext);

    const isMobile = await I.openMainMenu();

    I.click('Log out');

    if (isMobile) {
      I.openMenuDrawer();
    }

    I.see('Sign in');
    I.see('Sign up');
  });
}
