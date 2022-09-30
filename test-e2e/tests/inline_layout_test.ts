import * as assert from 'assert';

import constants from '../utils/constants';
import { LoginContext } from '../utils/password_utils';

const videoListLocator = locate({ css: 'div[data-testid="video-list"]' });

Feature('inline layout').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

const loginContext: LoginContext = {
  email: constants.username,
  password: constants.password,
};

Before(async ({ I }) => {
  I.useConfig('test--inline-player');
  I.login(loginContext);
});

Scenario('I can see the movie inline player layout', async ({ I }) => {
  await I.openVideoCard(constants.bigBuckBunnyTitle);
  I.seeElement(`[data-testid="inline-layout"]`);
  I.dontSeeElement(`[data-testid="cinema-layout"]`);
  I.seeElement('video');
  I.see(constants.bigBuckBunnyTitle);
  I.see('2008');
  I.see('10m');
  I.see('Comedy');
  I.see('CC-BY');
  I.see(constants.bigBuckBunnyDescription);
  I.see('Trailer');
  I.see('Favorite');
  I.see('Share');
  I.seeTextEquals('Related Films', 'h3');
  I.see('Caminandes 1: Llama Drama', locate({ css: 'div[aria-label="Play Caminandes 1: Llama Drama"]' }).inside(videoListLocator));
  I.see('Caminandes 2: Gran Dillama', locate({ css: 'div[aria-label="Play Caminandes 2: Gran Dillama"]' }).inside(videoListLocator));
});

Scenario('I switch to another video in the movie screen', async ({ I }) => {
  await I.openVideoCard(constants.bigBuckBunnyTitle);
  I.see(constants.bigBuckBunnyTitle);

  I.click('Caminandes 1: Llama Drama', locate({ css: 'div[aria-label="Play Caminandes 1: Llama Drama"]' }).inside(videoListLocator));
  I.see('Caminandes 1: Llama Drama');
});

Scenario('I can see the series inline player layout', async ({ I }) => {
  await I.openVideoCard(constants.minecraftAnimationWorkshopTitle);
  I.seeElement(`[data-testid="inline-layout"]`);
  I.dontSeeElement(`[data-testid="cinema-layout"]`);
  I.seeElement('video');
  I.see(constants.minecraftAnimationWorkshopTitle);
  I.see('S1:E1 - Welcome');
  I.see('2018');
  I.see('17 episodes');
  I.see('Beginner');
  I.see('CC-BY');
  I.see(constants.minecraftAnimationWorkshopDescription);
  I.see('Favorite');
  I.see('Share');
  I.seeTextEquals('Minecraft Animation Workshop', 'h3');
  I.see('Season 1', locate({ css: 'select' }).inside(videoListLocator));
  I.see('Current episode', locate({ css: 'div[aria-label="Play Welcome"]' }).inside(videoListLocator));
  I.see('S1:E2', locate({ css: 'div[aria-label="Play Basics Of Blender"]' }).inside(videoListLocator));
  I.see('S1:E3', locate({ css: 'div[aria-label="Play Using Mineways"]' }).inside(videoListLocator));
});

Scenario('I can start the inline player', async ({ I }) => {
  await I.openVideoCard(constants.minecraftAnimationWorkshopTitle);
  await playInlineVideo(I, constants.minecraftAnimationWorkshopTitle);
});

Scenario('I switch to another episode in the video list', async ({ I }) => {
  await I.openVideoCard(constants.minecraftAnimationWorkshopTitle);
  I.see('S1:E1 - Welcome');
  I.click('S1:E2', locate({ css: 'div[aria-label="Play Basics Of Blender"]' }).inside(videoListLocator));
  I.see('S1:E2 - Basics Of Blender');
});

Scenario('I switch to another season in the video list', async ({ I }) => {
  await I.openVideoCard(constants.minecraftAnimationWorkshopTitle);
  I.see('S1:E1 - Welcome');

  I.see('Season 1');
  I.selectOption({ css: 'select[name="categories"]' }, 'Season 2');
  I.dontSee('Season 1');

  I.see('Season 2');
  I.click('S1:E2', locate({ css: 'div[aria-label="Play Choosing a skin (Cycles Render)"]' }).inside(videoListLocator));
  I.see('S2:E1 - Choosing a skin (Cycles Render)');
  I.dontSee('S1:E2 - Basics Of Blender');
});

async function playInlineVideo(I: CodeceptJS.I, title: string) {
  I.click('div[aria-label="Play"]');
  await I.waitForPlayerPlaying(title);

  I.click('div[data-testid="player-container"]'); //pauses the player
  I.waitForPlayerState('paused', ['idle']);
}
