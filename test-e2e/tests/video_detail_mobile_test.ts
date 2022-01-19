import * as assert from "assert";

import {constants, selectors} from '../utils/utils';

Feature('video_detail').tag('@mobile');

const agent327Title = 'Agent 327';
const agent327Description = 'Hendrik IJzerbroot – Agent 327 – is a secret agent working for the Netherlands secret service agency. In the twenty comic books that were published since 1968, Martin Lodewijk created a rich universe with international conspiracies, hilarious characters and a healthy dose of Dutch humour.';

Scenario('Video detail screen loads', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  openVideo(I, 'Agent 327');
  I.see('Agent 327');
  I.see('2021');
  I.see('4m');
  I.see('Action');
  I.see('CC-BY');
  I.see(agent327Description);
  I.see('Sign up to start watching!');
  I.see('Favorite');
  I.see('Share');
  I.see('Current video', { css: 'div[aria-label="Play Agent 327"]'});
  I.see('Elephants Dream');
  I.see('11 min', { css: 'div[aria-label="Play Elephants Dream"]'})
});

Scenario('I can expand the description', async ({ I }) => {
  I.amOnPage('http://localhost:8080?c=test--no-cleeng');
  openVideo(I, 'Agent 327');

  async function checkHeight(expectedHeight) {
    assert.strictEqual(expectedHeight,
        await I.grabCssPropertyFrom(`text="${agent327Description}"`, 'max-height'));
  }

  I.seeElement('div[aria-label="Expand"]');
  I.dontSeeElement('div[aria-label="Collapse"]');
  await checkHeight('60px');

  I.click('div[aria-label="Expand"]');

  I.seeElement('div[aria-label="Collapse"]');
  I.dontSeeElement('div[aria-label="Expand"]');
  await checkHeight('160px');

  I.click('div[aria-label="Collapse"]');

  I.seeElement('div[aria-label="Expand"]');
  I.dontSeeElement('div[aria-label="Collapse"]');
  await checkHeight('60px');
})

Scenario('I can watch a video', async ({ I }) => await playBigBuckBunny(I));

Scenario('I can return to the video detail screen', async ({ I }) => {
  await playBigBuckBunny(I);

  I.click('div[aria-label="Back"]');

  await I.checkPlayerClosed();
  I.see('Start watching');
});

Scenario('I can play other media from the related shelf', ({ I }) => {
  I.amOnPage('http://localhost:8080?c=test--no-cleeng');
  openVideo(I, agent327Title);
  openVideo(I, 'Elephants Dream');
  I.see('Elephants Dream (code-named Project Orange during production and originally titled Machina) is a 2006 Dutch computer animated science fiction fantasy experimental short film produced by Blender Foundation using, almost exclusively, free and open-source software. The film is English-language and includes subtitles in over 30 languages.')
  openVideo(I,'Coffee Run');
  I.see('Coffee Run was directed by Hjalti Hjalmarsson and produced by the team at Blender Animation Studio.');
});

Scenario('I can play a trailer', async ({ I }) => {
  I.amOnPage('http://localhost:8080/m/8pN9r7vd/elephants-dream?r=sR5VypYk&c=test--no-cleeng');

  I.click('Trailer');
  await I.waitForPlayerPlaying('Elephants Dream - Trailer');

  I.click('div[aria-label="Close"]');
  await I.checkPlayerClosed();
  I.dontSee('Elephants Dream - Trailer');
});

Scenario('I can play a trailer without signing in', async ({ I }) => {
  I.amOnPage('http://localhost:8080/m/8pN9r7vd/elephants-dream?r=sR5VypYk');

  I.see('Sign up to start watching!');
  I.click('Sign up to start watching!');
  await I.checkPlayerClosed();
  I.waitForText('Email', 5);
  I.see('Password');
  I.click('div[aria-label=Close]');

  I.click('Trailer');
  await I.waitForPlayerPlaying('Elephants Dream - Trailer');

  I.click('div[aria-label="Close"]');
  await I.checkPlayerClosed();
  I.dontSee('Elephants Dream - Trailer');
});

Scenario('I can play a video after signing in', async ({ I }) => {
  I.amOnPage('http://localhost:8080/m/8pN9r7vd/elephants-dream?r=sR5VypYk&c=test--accounts');

  I.see('Sign up to start watching!');
  I.click('Sign up to start watching!');
  await I.checkPlayerClosed();
  I.see('Email');
  I.see('Password');
  I.click('Sign in', selectors.registrationForm);
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
  I.usePlaywrightTo('Setup the clipboard', async ({browserContext}) => {
    await browserContext.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  const url = 'http://localhost:8080/m/8pN9r7vd/elephants-dream?r=sR5VypYk&c=test--no-cleeng';

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
  I.scrollTo({ css: `div[aria-label="Play ${name}"]`});
  I.click({ css: `div[aria-label="Play ${name}"]`});
}

async function playBigBuckBunny(I) {
  I.amOnPage('http://localhost:8080/m/dwEE1oBP/big-buck-bunny?r=sR5VypYk&c=test--no-cleeng');
  I.waitForText('Start watching', 5);
  I.dontSeeInCurrentUrl('play=1');
  I.click('Start watching');

  I.seeInCurrentUrl('play=1');

  I.waitForElement('div[class*="jwplayer"]', 10);
  I.waitForElement('video', 5);

  await I.waitForPlayerPlaying('Big Buck Bunny');
}