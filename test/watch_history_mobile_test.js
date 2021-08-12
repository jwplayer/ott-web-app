const assert = require('assert');

Feature('watch_history').tag('@mobile');

Scenario('I can get a video stored to my local watch history',  ({ I }) => {
  I.amOnPage('http://localhost:8080/m/dwEE1oBP/big-buck-bunny?r=sR5VypYk&c=test--no-cleeng&play=1');
  I.click({ css: 'div[class="jw-icon jw-icon-display jw-button-color jw-reset"]'});
  // todo: fix player and check if item gets added to locally stored watchHistory
});

Scenario('I can see my locally stored watch history at the Home screen', async({ I })=> {
  I.amOnPage('http://localhost:8080/?c=test--no-cleeng');
  // todo: fix player and check locally stored watchHistory at the home screen
});

Scenario('I can get my watch history stored to my account after login', async({ I })=> {
  I.amOnPage('http://localhost:8080?c=test--accounts');
  I.loginWithAccountMobile();
  // todo: fix player and check storage to account
});

Scenario('I can see my watch history from my account on the Home screen', ({ I })=> {
  I.see('Continue watching');

  within('div[data-mediaid="continue-watching"]', async () => {
    I.see('Blocking');
    I.see('S1:E1');
  });
});

Scenario('I only see items watched between 5% and 95%', ({ I })=> {
  const pixelsToNumber = value => Number(value.substring(0, value.indexOf('px')));
  const getProgress = async ariaLabel => {
    const progressContainer = locate('div[class="_progressContainer_19f2q_204"]').inside(locate(`div[aria-label="${ariaLabel}"]`));
    const containerWidth = await I.grabCssPropertyFrom(progressContainer, 'width');
    const progressBar = locate('div[class="_progressBar_19f2q_214"]').inside(locate(`div[aria-label="${ariaLabel}"]`));
    const progressWidth = await I.grabCssPropertyFrom(progressBar, 'width');
    return Math.round(100 * pixelsToNumber(progressWidth) / pixelsToNumber(containerWidth));
  };

  within('div[data-mediaid="continue-watching"]', async () => {
    const progress = await getProgress('Play Blocking');
    assert.strictEqual(progress > 5 && progress < 95, true);
  }); 
});

Scenario('I can continue watching and watch immediately', ({ I }) => {
  I.click('div[data-mediaid="continue-watching"]');
  I.seeInCurrentUrl('play=1');
});