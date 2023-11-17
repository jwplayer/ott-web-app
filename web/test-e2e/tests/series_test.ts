import * as assert from 'assert';

import constants, { ShelfId } from '#utils/constants';
import { testConfigs } from '#test/constants';

Feature('series').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
});

Scenario('I can see series without seasons', async ({ I }) => {
  await I.openVideoCard(constants.fantasyVehicleTitle, ShelfId.allCourses);
  I.see('Fantasy Vehicle Creation');
  I.see('2023');
  I.see('5 episodes');
  I.see('Advanced');
  I.see('CC-BY');
  I.see(
    'Follow CG artist Lukas Walzer as he creates a charming post-apocalyptic traveling ice cream van. Next to the final .blend file, complete with materials, textures and light setup, enjoy over 4 hours of commented videos where Lukas breaks down his process.',
  );
  I.see(constants.startWatchingButton);
  I.see('Favorite');
  I.see('Share');
  I.seeTextEquals('Episodes', 'h3');

  I.click('a[aria-label="Blocking"]');
  I.scrollTo('text="Episodes"');

  I.see('E1 - Blocking');
  I.see('Current episode', { css: 'a[aria-label="Blocking"]' });
  I.see('Concept Art');
  I.see('E2', { css: 'a[aria-label="Concept Art"]' });
  I.see('E3', { css: 'a[aria-label="Modeling Part 1"]' });
  I.see('E4', { css: 'a[aria-label="Modeling Part 2"]' });

  I.scrollTo('a[aria-label="Modeling Part 2"]');

  I.see('E5', { css: 'a[aria-label="Texturing and Lighting"]' });
});

Scenario('I can see series with seasons', async ({ I }) => {
  await I.openVideoCard(constants.minecraftAnimationWorkshopTitle, ShelfId.allCourses);
  I.see('Minecraft Animation Workshop');
  I.see('2023');
  I.see('17 episodes');
  I.see('Beginner');
  I.see('CC-BY');
  I.see(constants.minecraftAnimationWorkshopDescription);
  I.see(constants.startWatchingButton);
  I.see('Favorite');
  I.see('Share');
  I.seeTextEquals('Episodes', 'h3');

  I.click('a[aria-label="Welcome"]');
  I.scrollTo('text="Episodes"');

  I.see('S1:E1 - Welcome');
  I.see('Current episode', { css: 'a[aria-label="Welcome"]' });
  I.see('S1:E2', { css: 'a[aria-label="Basics Of Blender"]' });
  I.see('S1:E3', { css: 'a[aria-label="Using Mineways"]' });
  I.see('S1:E4', { css: 'a[aria-label="Texturing your Minecraft World (Blender Render)"]' });

  I.scrollTo('a[aria-label="Texturing your Minecraft World (Blender Render)"]');

  I.see('S1:E5', { css: 'a[aria-label="Texturing your Minecraft World (Cycles)"]' });
  I.see('S1:E6', { css: 'a[aria-label="Rig Overview (Boxscape Studios)"]' });
});

Scenario('I can other episodes from the series', async ({ I }) => {
  await I.openVideoCard(constants.fantasyVehicleTitle, ShelfId.allCourses);
  I.see('Fantasy Vehicle Creation');

  I.scrollTo('text="Modeling Part 1"');
  I.click('a[aria-label="Modeling Part 1"]');

  // Scroll to the top when a new episode is selected (takes a short time)
  I.wait(2);
  assert.strictEqual((await I.grabPageScrollPosition()).y, 0);
  I.see('E3');
  I.see(
    'Finally we are creating the high-res model for our scene! In this chapter we will go over a few basic modeling techniques as well as the first part of the production timelapse.',
  );

  I.scrollTo('text="Texturing and Lighting"');
  I.click('a[aria-label="Texturing and Lighting"]');

  // Check that scrolled to the top
  I.wait(2);
  assert.strictEqual((await I.grabPageScrollPosition()).y, 0);
  I.see('Placing the lights and creating the environment then finishes up this workshop!');
});
