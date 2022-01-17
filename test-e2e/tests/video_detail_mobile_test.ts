import * as assert from "assert";

Feature('video_detail').tag('@mobile');

Scenario('Video detail screen loads', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.scrollTo({ css: 'div[aria-label="Play Agent 327"]'});
  I.click({ css: 'div[aria-label="Play Agent 327"]'});
  I.see('Agent 327');
  I.see('2021');
  I.see('4m');
  I.see('Action');
  I.see('CC-BY');
  I.see('endrik IJzerbroot – Agent 327 – is a secret agent working for the Netherlands secret service agency. In the twenty comic books that were published since 1968, Martin Lodewijk created a rich universe with international conspiracies, hilarious characters and a healthy dose of Dutch humour.');
  I.see('Sign up to start watching!');
  I.see('Favorite');
  I.see('Share');
  I.see('Current video', { css: 'div[aria-label="Play Agent 327"]'});
  I.see('Elephants Dream');
  I.see('11 min', { css: 'div[aria-label="Play Elephants Dream"]'})
});

Scenario('I can expand the description', async ({ I }) => {
  I.seeElement('div[aria-label="Expand"]');
  I.dontSeeElement('div[aria-label="Collapse"]');
  const maxHeight = await I.grabCssPropertyFrom('div[class="_textContainer_12ck1_11 _description_k71vc_110 _collapsed_12ck1_15"]', 'max-height');
  assert.strictEqual('60px', maxHeight);

  I.click('div[aria-label="Expand"]');
  I.seeElement('div[aria-label="Collapse"]');
  I.dontSeeElement('div[aria-label="Expand"]');
  const maxHeightExpanded = await I.grabCssPropertyFrom('div[class="_textContainer_12ck1_11 _description_k71vc_110"]', 'max-height');
  assert.strictEqual('200px', maxHeightExpanded);
})

Scenario('I can watch a video',  async ({ I }) => {
  I.amOnPage('http://localhost:8080/m/dwEE1oBP/big-buck-bunny?r=sR5VypYk&c=test--no-cleeng');
  I.wait(0.5);
  I.see('Start watching');
  I.dontSeeInCurrentUrl('play=1');
  I.click('Start watching');
  I.seeInCurrentUrl('play=1');
  I.wait();
  I.click({ css: 'div[class="jw-icon jw-icon-display jw-button-color jw-reset"]'});
  // todo: test the videoplayer playing, using another helper?
});

Scenario('I can return to the video detail screen', ({ I }) => {
  I.click('div[aria-label="Back"]');
  I.dontSeeInCurrentUrl('play=1');
  I.see('Start watching');
});

Scenario('I can play other media from the related shelf', ({ I }) => {
  I.click('div[aria-label="Play Elephants Dream"]');
  I.see('Elephants Dream (code-named Project Orange during production and originally titled Machina) is a 2006 Dutch computer animated science fiction fantasy experimental short film produced by Blender Foundation using, almost exclusively, free and open-source software.');
  I.click('div[aria-label="Play Coffee Run"]');
  I.see('Coffee Run was directed by Hjalti Hjalmarsson and produced by the team at Blender Animation Studio.');
});

Scenario('I can play a trailer', ({ I }) => {
  I.click('Trailer');
  I.wait(0.5);
  I.see('Coffee Run - Trailer');
  I.click('div[aria-label="Close"]');
  I.dontSee('Coffee Run - Trailer');
});

Scenario('I can share the media', ({ I }) => {
  I.click('Share');
  I.see('Copied url');
  I.wait();
  I.dontSee('Copied url');
});

Scenario('I can see series', ({ I }) => {
  I.amOnPage('http://localhost:8080/s/L24UEeMK/fantasy-vehicle-creation?e=I3k8wgIs&c=test--no-cleeng');
  I.see('Fantasy Vehicle Creation');
  I.see('S1:E1');
  I.see('Blocking');
  I.see('2019');
  I.see('5 episodes');
  I.see('Advanced');
  I.see('CC-BY');
  I.see('Let\'s get started with the Art of Blocking!');
  I.see('Start watching');
  I.see('Favorite');
  I.see('Share');
  I.see('Current episode', { css: 'div[aria-label="Play Blocking"]'});
  I.see('Concept Art');
  I.see('S1:E2', { css: 'div[aria-label="Play Concept Art"]'})
})

Scenario('I can play other episodes from the series', ({ I }) => {
  I.click('div[aria-label="Play Modeling Part 1"]');
  I.see('S1:E3');
  I.see('Finally we are creating the high-res model for our scene! In this chapter we will go over a few basic modeling techniques as well as the first part of the production timelapse.');
  I.click('div[aria-label="Play Texturing and Lighting"]');
  I.see('Placing the lights and creating the environment then finishes up this workshop!');
});