import * as assert from 'assert';

Feature('watch_history').tag('@desktop-only');

// todo: Most are commented out, because the player doesn't run on Chromium
// To test locally: set firefox as browser in config

Scenario('I login first because the player doesn\'t work (todo: remove this once it works!)', ({ I }) => {
  I.amOnPage('http://localhost:8080?c=test--accounts');
  I.login();
})

// Scenario('I can get my watch progress stored (locally)',  ({ I }) => {
//   I.amOnPage('http://localhost:8080/m/uB8aRnu6/agent-327?r=dGSUzs9o&c=test--no-cleeng&play=1');
//   I.wait(2);
//   I.executeScript(() => window.jwplayer().seek(100));
//   I.click('div[class="_cinema_1w0uk_1 _fill_1w0uk_1"]'); //re-enable controls overlay
//   I.click('div[aria-label="Back"]');
//   I.wait();
//   I.see('Continue watching');
// });
// Scenario('I can continue watching', ({ I }) => {
//   I.click('Continue watching');
//   I.wait();
//   I.click({ css: 'div[class="jw-icon jw-icon-display jw-button-color jw-reset"]'}); // Play button
//   I.see("01:40");
// });

Scenario('I can see my watch history on the Home screen', async({ I })=> {
  // I.amOnPage('http://localhost:8080/?c=test--no-cleeng');
  I.see('Continue watching');
  within('div[data-mediaid="continue-watching"]', async () => {
    I.see('Agent 327');
    I.see('4 min');
  });
});

Scenario('I can see my watch progress (between 5 and 95%)', async({ I })=> {
  const pixelsToNumber = value => Number(value.substring(0, value.indexOf('px')));

  const continueWatchingShelf = locate('div[data-mediaid="continue-watching"]');
  const continueWatchingItem = locate(`div[aria-label="Play Agent 327"]`).inside(continueWatchingShelf);
  const progressContainer = locate('div[class="_progressContainer_19f2q_204"]').inside(continueWatchingItem);
  const containerWidth = await I.grabCssPropertyFrom(progressContainer, 'width');
  const progressBar = locate('div[class="_progressBar_19f2q_214"]').inside(continueWatchingItem);
  const progressWidth = await I.grabCssPropertyFrom(progressBar, 'width');
  const percentage = Math.round(100 * pixelsToNumber(progressWidth) / pixelsToNumber(containerWidth));

  assert.strictEqual(percentage > 5 && percentage < 95, true);
});

Scenario('I can continue watching from home immediately', async({ I })=> {
  within('div[data-mediaid="continue-watching"]', async () => {
    I.click('div[aria-label="Play Agent 327"]');
    I.seeInCurrentUrl('play=1');
  });
});

// Scenario('I can get my watch history stored to my account after login', async({ I })=> {
  // I.amOnPage('http://localhost:8080?c=test--accounts');
  // I.login();
//   I.wait(5);
//   I.amOnPage('/');
//   I.refreshPage();
//   I.dontSee('Continue watching');
//   I.login();
//   I.wait(5);
//   I.see('Continue watching');
// });