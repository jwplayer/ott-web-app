Feature('home').tag('@mobile');


Scenario('Mobile home screen loads', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.see('Central Intelligence');
  I.see('Drama');
  I.see('The Spongebob Movie');
});

Scenario('Menu button opens the sidebar', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.click('[aria-label="Open menu"]');
  I.see('Home');
  I.see('All Movies');
  I.click('All Movies');
  I.amOnPage('http://localhost:8080/p/4fgzPjpv');
  I.see('Featured Covers');
});
