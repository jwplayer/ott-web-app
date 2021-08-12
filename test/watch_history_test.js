const assert = require('assert');

Feature('watch_history').tag('@desktop');

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
  I.click('Sign in');

  I.fillField('Email', '12345@test.org');
  I.fillField('password', 'Ax854bZ!$');
  I.click('button[type="submit"]');
  I.wait(5);
  // todo: fix player and check storage to account
});

Scenario('I can see my watch history from my account on the Home screen', ({ I })=> {
  I.see('Continue watching');

  within('div[data-mediaid="continue-watching"]', async () => {
    I.see('Caminandes 1: Llama Drama');
    I.see('2 min');
    I.see('Big Buck Bunny');
    I.see('10 min');
  });
});

Scenario('I only see items watched between 5% and 95%', ({ I })=> {
  const pixelsToNumber = value => Number(value.substring(0, value.indexOf('px') -1));
  const getProgress = async ariaLabel => {
    const progressContainer = locate('div[class="_progressContainer_19f2q_204"]').inside(locate(`div[aria-label="${ariaLabel}"]`));
    const containerWidth = await I.grabCssPropertyFrom(progressContainer, 'width');
    const progressBar = locate('div[class="_progressBar_19f2q_214"]').inside(locate(`div[aria-label="${ariaLabel}"]`));
    const progressWidth = await I.grabCssPropertyFrom(progressBar, 'width');
    return Math.round(100 * pixelsToNumber(progressWidth) / pixelsToNumber(containerWidth));
  };

  within('div[data-mediaid="continue-watching"]', async () => {
    const progress1 = await getProgress('Play Caminandes 1: Llama Drama');
    const progress2 = await getProgress('Play Big Buck Bunny');
    assert.strictEqual(progress1 > 5 && progress1 < 95, true);
    assert.strictEqual(progress2 > 5 && progress2 < 95, true);
  }); 
});

Scenario('I can continue watching and watch immediately', ({ I }) => {
  I.click('Play Caminandes 1: Llama Drama', 'div[data-mediaid="continue-watching"]');
  I.seeInCurrentUrl('play=1');
  I.see('2013');
});
