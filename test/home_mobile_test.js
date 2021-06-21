Feature('home').tag('@mobile');


Scenario('Mobile home screen loads', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.see('Blender');
  I.see('Agent 327');
  I.see('LIVE');
});

Scenario('Menu button opens the sidebar', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.click('[aria-label="Open menu"]');
  I.see('Home');
  I.see('Films');
  I.click('Films');
  I.amOnPage('http://localhost:8080/p/sR5VypYk');
  I.see('All Films');
});
