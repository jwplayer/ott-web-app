Feature('home').tag('@desktop');

Scenario('Desktop home screen loads', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.see('Central Intelligence');
  I.see('All Movies');
  I.see('Settings');
});

Scenario('Header button navigates to playlist screen', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.see('All Movies');
  I.click('All Movies');
  I.amOnPage('http://localhost:8080/p/4fgzPjpv');
  I.see('Featured Covers');
});
