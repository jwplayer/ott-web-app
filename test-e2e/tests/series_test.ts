import * as assert from 'assert';

Feature('series').retry(3);

Scenario('I can see series', ({ I }) => {
  I.amOnPage('http://localhost:8080/s/L24UEeMK/fantasy-vehicle-creation?e=I3k8wgIs&c=test--no-cleeng');
  I.see('Fantasy Vehicle Creation');
  I.see('S1:E1 - Blocking');
  I.see('2019');
  I.see('5 episodes');
  I.see('Advanced');
  I.see('CC-BY');
  I.see("Let's get started with the Art of Blocking!");
  I.see('Start watching');
  I.see('Favorite');
  I.see('Share');
  I.seeTextEquals('Episodes', 'h3');
  I.see('Current episode', { css: 'div[aria-label="Play Blocking"]' });
  I.see('Concept Art');
  I.see('S1:E2', { css: 'div[aria-label="Play Concept Art"]' });
  I.see('S1:E3', { css: 'div[aria-label="Play Modeling Part 1"]' });
  I.see('S1:E4', { css: 'div[aria-label="Play Modeling Part 2"]' });
  I.see('S1:E5', { css: 'div[aria-label="Play Texturing and Lighting"]' });
});

Scenario('I can play other episodes from the series', async ({ I }) => {
  I.amOnPage('http://localhost:8080/s/L24UEeMK/fantasy-vehicle-creation?e=I3k8wgIs&c=test--no-cleeng');

  I.scrollTo('text="Modeling Part 1"');
  I.click('div[aria-label="Play Modeling Part 1"]');

  // Scroll to the top when a new episode is selected (takes a short time)
  I.wait(2);
  assert.strictEqual((await I.grabPageScrollPosition()).y, 0);
  I.see('S1:E3');
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
