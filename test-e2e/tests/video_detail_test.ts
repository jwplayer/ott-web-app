import * as assert from 'assert';

import constants from '../utils/constants';

Feature('video_detail').retry(3);

Scenario('Video detail screen loads', ({ I }) => {
  I.amOnPage(constants.baseUrl);
  openVideo(I, 'Agent 327');
  I.see('Agent 327');
  I.see('2021');
  I.see('4m');
  I.see('Action');
  I.see('CC-BY');
  I.see(constants.agent327Description);
  I.see('Sign up to start watching!');
  I.see('Favorite');
  I.see('Share');
  I.see('Elephants Dream');
  I.see('11 min', { css: 'div[aria-label="Play Elephants Dream"]' });
});

Scenario('I can expand the description (@mobile-only)', ({ I }) => {
  I.useConfig('test--no-cleeng');
  openVideo(I, 'Agent 327');

  function checkHeight(height) {
    // Putting a wait here because the expand / collapse takes a non-zero amount of time
    // and sometimes codecept goes too fast and catches it before it's done animating
    I.wait(1);

    I.seeCssPropertiesOnElements(`text="${constants.agent327Description}"`, { 'max-height': height });
  }

  I.seeElement('div[aria-label="Expand"]');
  I.dontSeeElement('div[aria-label="Collapse"]');
  checkHeight('60px');

  I.click('div[aria-label="Expand"]');

  I.seeElement('div[aria-label="Collapse"]');
  I.dontSeeElement('div[aria-label="Expand"]');
  checkHeight('160px');

  I.click('div[aria-label="Collapse"]');

  I.seeElement('div[aria-label="Expand"]');
  I.dontSeeElement('div[aria-label="Collapse"]');
  checkHeight('60px');
});

Scenario('I can watch a video', async ({ I }) => await playBigBuckBunny(I));

Scenario('I can return to the video detail screen', async ({ I }) => {
  await playBigBuckBunny(I);

  I.click('div[aria-label="Back"]');

  await I.checkPlayerClosed();
  I.see('Start watching');
});

Scenario('I can play other media from the related shelf', ({ I }) => {
  I.useConfig('test--no-cleeng');
  openVideo(I, 'Agent 327');
  openVideo(I, 'Elephants Dream');
  I.see(
    'Elephants Dream (code-named Project Orange during production and originally titled Machina) is a 2006 Dutch computer animated science fiction fantasy experimental short film produced by Blender Foundation using, almost exclusively, free and open-source software. The film is English-language and includes subtitles in over 30 languages.',
  );
  openVideo(I, 'Coffee Run');
  I.see('Coffee Run was directed by Hjalti Hjalmarsson and produced by the team at Blender Animation Studio.');
});

Scenario('I can play a trailer', async ({ I }) => {
  I.useConfig('test--no-cleeng', constants.elephantsDreamDetailUrl);

  I.click('Trailer');
  await I.waitForPlayerPlaying('Elephants Dream - Trailer');

  I.clickCloseButton();
  await I.checkPlayerClosed();
  I.dontSee('Elephants Dream - Trailer');
});

Scenario('I can play a trailer without signing in', async ({ I }) => {
  I.amOnPage(constants.elephantsDreamDetailUrl);

  I.see('Sign up to start watching!');
  I.click('Sign up to start watching!');
  await I.checkPlayerClosed();
  I.waitForText('Email', 5);
  I.see('Password');
  I.click('div[aria-label=Close]');

  I.click('Trailer');
  await I.waitForPlayerPlaying('Elephants Dream - Trailer');

  I.clickCloseButton();
  await I.checkPlayerClosed();
  I.dontSee('Elephants Dream - Trailer');
});

Scenario('I can play a video after signing in', async ({ I }) => {
  I.useConfig('test--accounts', constants.elephantsDreamDetailUrl);

  I.see('Sign up to start watching!');
  I.click('Sign up to start watching!');
  await I.checkPlayerClosed();
  I.see('Email');
  I.see('Password');
  I.click('Sign in', constants.registrationFormSelector);
  I.fillField('Email', constants.username);
  I.fillField('Password', constants.password);
  I.click('button[type=submit]');

  I.see('Start watching');
  I.dontSee('Sign up to start watching!');
  I.click('Start watching');

  await I.waitForPlayerPlaying('Elephants Dream');

  I.click('div[aria-label="Back"]');

  await I.checkPlayerClosed();
});

Scenario('I can share the media', async ({ I }) => {
  await I.enableClipboard();

  const url = constants.elephantsDreamDetailUrl + '&c=test--no-cleeng';

  I.amOnPage(url);

  // Empty the clipboard
  await I.executeScript(() => navigator.clipboard.writeText(''));
  assert.strictEqual(await I.executeScript(() => navigator.clipboard.readText()), '');

  I.click('Share');
  I.see('Copied url');

  // The url should be copied to the clipboard
  assert.strictEqual(await I.executeScript(() => navigator.clipboard.readText()), url);
  I.waitForInvisible('text="Copied url"', 5);
});

function openVideo(I, name) {
  I.scrollTo({ css: `div[aria-label="Play ${name}"]` });
  I.click({ css: `div[aria-label="Play ${name}"]` });
}

async function playBigBuckBunny(I) {
  I.useConfig('test--no-cleeng', constants.bigBuckBunnyDetailUrl);
  I.waitForText('Start watching', 5);
  I.dontSeeInCurrentUrl('play=1');
  I.click('Start watching');

  I.seeInCurrentUrl('play=1');

  I.waitForElement('div[class*="jwplayer"]', 10);
  I.waitForElement('video', 5);

  await I.waitForPlayerPlaying('Big Buck Bunny');
}
