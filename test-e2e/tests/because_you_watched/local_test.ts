import { playVideo } from '../../utils/watch_history';
import constants from '../../utils/constants';

const videoLength = 88;

Feature('because_you_watched - local').retry(3);

Before(({ I }) => {
  I.useConfig('test--no-cleeng');
});

Scenario('I can see Because you watched section after I finished watching the movie (stored locally)', async ({ I }) => {
  I.amOnPage(constants.caminandesDetailUrl);
  I.dontSee('Because you watched Caminandes 1: Llama Drama');

  await playVideo(I, constants.caminandes1Title, constants.caminandesDetailUrl, videoLength, videoLength);

  I.amOnPage(constants.baseUrl);

  I.see('Because you watched Caminandes 1: Llama Drama');
});

Scenario('I do not see Because you watched section after I am in process of watching (stored locally)', async ({ I }) => {
  I.amOnPage(constants.caminandesDetailUrl);
  I.dontSee('Because you watched Caminandes 1: Llama Drama');

  await playVideo(I, constants.caminandes1Title, constants.caminandesDetailUrl, 50, videoLength);

  I.amOnPage(constants.baseUrl);

  I.dontSee('Because you watched Caminandes 1: Llama Drama');
});

Scenario('Video removed from because you watched section when still in progress', async ({ I }) => {
  I.amOnPage(constants.caminandesDetailUrl);
  await playVideo(I, constants.caminandes1Title, constants.caminandesDetailUrl, videoLength, videoLength);

  I.amOnPage(constants.baseUrl);
  I.see('Because you watched Caminandes 1: Llama Drama');

  I.amOnPage(constants.caminandesDetailUrl);
  await playVideo(I, constants.caminandes1Title, constants.caminandesDetailUrl, 50, videoLength);

  I.amOnPage(constants.baseUrl);
  I.dontSee('Because you watched Caminandes 1: Llama Drama');
});
