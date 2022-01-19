Feature('home').tag('@mobile');

Before(({I}) => {
  I.amOnPage('http://localhost:8080?c=blender');
});

Scenario('Mobile home screen loads', ({ I }) => {
  I.see('Blender');
  I.see('Agent 327');
  I.see('LIVE');
});

Scenario('Menu button opens the sidebar', ({ I }) => {
  I.click('[aria-label="Open menu"]');
  I.see('Home');
  I.see('Films');
  I.click('Films');
  I.amOnPage('http://localhost:8080/p/sR5VypYk');
  I.see('All Films');
  I.see('The Daily Dweebs');
});

Scenario('I can slide within the featured shelf', async ({ I }) => {
  I.see('Blender Channel');
  I.see('LIVE');
  I.dontSee('Spring');
  I.dontSee('8 min');
  await I.swipeLeft({text:'Blender Channel'});

  I.waitForElement('text=Spring', 3);
  I.see('8 min');
  I.waitForInvisible('text="Blender Channel"', 3);
  I.dontSee('Blender Channel');
  I.dontSee('LIVE');

  await I.swipeLeft({text: 'Spring'});

  I.waitForElement('text="Blender Channel"', 3);
  I.dontSee('Spring');
});

Scenario('I can slide within non-featured shelves', async ({ I }) => {
  I.see('All Films');
  I.see('Agent 327');
  I.see('4 min');
  I.dontSee('Cosmos Laundromat');
  I.dontSee('13 min');
  await I.swipeLeft({text: 'Agent 327'});
  I.see('Big Buck Bunny');
  I.see('10 min');
  I.dontSee('Agent 327');
  await I.swipeRight({text: 'Big Buck Bunny'});

  I.see('Agent 327');
  I.dontSee('Big Buck Bunny');

  await I.swipeRight({text: 'Agent 327'});

  I.dontSee('Agent 327');
  I.see('The Daily Dweebs');
});

Scenario('I can see the footer', ({ I }) => {
  I.scrollPageToBottom();
  I.see('© Blender Foundation');
  I.see('cloud.blender.org');
  I.click('cloud.blender.org');
});