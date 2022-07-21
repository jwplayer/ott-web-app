import constants from '../../utils/constants';
import { playVideo } from '../../utils/watch_history';

const videoLength = 88;

Feature('because_you_watched - logged in').retry(3);

Before(({ I }) => {
  I.useConfig('test--accounts');
});

Scenario('I can see Because you watched section after I finished watching the movie when logged in', async ({ I }) => {
  I.login();

  await playVideo(I, constants.caminandes1Title, constants.caminandesDetailUrl, 1, videoLength);

  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.click('Home');
  I.dontSee('Because you watched Caminandes 1: Llama Drama');

  await playVideo(I, constants.caminandes1Title, constants.caminandesDetailUrl, videoLength, videoLength);

  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.click('Home');
  I.see('Because you watched Caminandes 1: Llama Drama');
});

Scenario('I can get Because you watched data stored to my account after login', async ({ I }) => {
  I.amOnPage(constants.baseUrl);
  I.dontSee('Because you watched Caminandes 1: Llama Drama');

  I.login();
  I.see('Because you watched Caminandes 1: Llama Drama');
});

Scenario('I do not see Because you watched section on the home page and video page if there is not such config setting', async ({ I }) => {
  I.useConfig('test--watchlists');

  I.dontSee('Because you watched Caminandes 1: Llama Drama');

  await playVideo(I, constants.caminandes1Title, constants.caminandesDetailUrl, videoLength, videoLength);
  if (await I.isMobile()) {
    I.openMenuDrawer();
  }
  I.click('Home');

  I.dontSee('Because you watched Caminandes 1: Llama Drama');
});
