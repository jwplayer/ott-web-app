Feature('home');

Scenario('Homepage loads', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.see('Central Intelligence');
  I.see('All Movies');
  I.see('Settings');
}).tag('@desktop');

Scenario('Homepage loads', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.see('Central Intelligence');
  I.see('Drama');
  I.see('The Spongebob Movie');
}).tag('@mobile');

Scenario('Header button navigates to playlist screen', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.see('All Movies');
  I.click('All Movies');
  I.amOnPage('http://localhost:8080/p/4fgzPjpv');
  I.see('Featured Covers');
}).tag('@desktop');

Scenario('Menu button opens the sidebar', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.click('[aria-label="Open menu"]');
  I.see('Home');
  I.see('All Movies');
  I.see('Settings');
  I.click('All Movies');
  I.amOnPage('http://localhost:8080/p/4fgzPjpv');
  I.see('Featured Covers');
}).tag('@mobile');
