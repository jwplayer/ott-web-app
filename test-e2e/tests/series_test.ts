import * as assert from 'assert';

import constants, { ShelfId } from '#utils/constants';
import { testConfigs } from '#test/constants';

Feature('series').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
});

Scenario('I can see series without seasons', async ({ I }) => {
  await I.openVideoCard(constants.fantasyVehicleTitle, ShelfId.allCourses);
  I.see('Fantasy Vehicle Creation (Free)');
  I.see('E1 - Blocking');
  I.see('2019');
  I.see('5 episodes');
  I.see('Advanced');
  I.see('CC-BY');
  I.see("Let's get started with the Art of Blocking!");
  I.see(constants.startWatchingButton);
  I.see('Favorite');
  I.see('Share');
  I.seeTextEquals('Episodes', 'h3');
  I.see('Current episode', { css: 'div[aria-label="Play Blocking"]' });
  I.see('Concept Art');
  I.see('E2', { css: 'div[aria-label="Play Concept Art"]' });
  I.see('E3', { css: 'div[aria-label="Play Modeling Part 1"]' });
  I.see('E4', { css: 'div[aria-label="Play Modeling Part 2"]' });
  I.see('E5', { css: 'div[aria-label="Play Texturing and Lighting"]' });
});

Scenario('I can see series with seasons', async ({ I }) => {
  await I.openVideoCard(constants.minecraftAnimationWorkshopTitle, ShelfId.allCourses);
  I.see('Minecraft Animation Workshop');
  I.see('S1:E1 - Welcome');
  I.see('2018');
  I.see('17 episodes');
  I.see('Beginner');
  I.see('CC-BY');
  I.see(
    'Dillon Gu explains a little bit about what you can expect to see in this workshop. Check out his showcase video for this workshop here on his YouTube channel!',
  );
  I.see(constants.startWatchingButton);
  I.see('Favorite');
  I.see('Share');
  I.seeTextEquals('Episodes', 'h3');
  I.see('Current episode', { css: 'div[aria-label="Play Welcome"]' });
  // I.see('Concept Art');
  I.see('S1:E2', { css: 'div[aria-label="Play Basics Of Blender"]' });
  I.see('S1:E3', { css: 'div[aria-label="Play Using Mineways"]' });
  I.see('S1:E4', { css: 'div[aria-label="Play Texturing your Minecraft World (Blender Render)"]' });
  I.see('S1:E5', { css: 'div[aria-label="Play Texturing your Minecraft World (Cycles)"]' });
  I.see('S1:E6', { css: 'div[aria-label="Play Rig Overview (Boxscape Studios)"]' });
});

Scenario('I can play other episodes from the series', async ({ I }) => {
  await I.openVideoCard(constants.fantasyVehicleTitle, ShelfId.allCourses);
  I.see('Fantasy Vehicle Creation (Free)');
  I.scrollTo('text="Modeling Part 1"');
  I.click('div[aria-label="Play Modeling Part 1"]');

  // Scroll to the top when a new episode is selected (takes a short time)
  I.wait(2);
  assert.strictEqual((await I.grabPageScrollPosition()).y, 0);
  I.see('E3');
  I.see(
    'Finally we are creating the high-res model for our scene! In this chapter we will go over a few basic modeling techniques as well as the first part of the production timelapse.',
  );

  I.scrollTo('text="Texturing and Lighting"');
  I.click('div[aria-label="Play Texturing and Lighting"]');

  // Check that scrolled to the top
  I.wait(2);
  assert.strictEqual((await I.grabPageScrollPosition()).y, 0);
  I.see('Placing the lights and creating the environment then finishes up this workshop!');
});

Scenario('I can see an alternate background image for Fantasy Vehicle Creation', async ({ I }) => {
  await I.openVideoCard(constants.fantasyVehicleTitle, ShelfId.allCourses);
  I.see('Fantasy Vehicle Creation (Free)');
  await I.seeVideoDetailsBackgroundImage('Fantasy Vehicle Creation (Free)', 'https://img.jwplayer.com/v1/media/0t21PUiy/images/background.webp?width=1280');
});
