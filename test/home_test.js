Feature('home').tag('@desktop');

Scenario('Desktop home screen loads', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.see('Agent 327');
  I.see('Home');
  I.see('Films');
  I.see('Courses');
});

Scenario('Header button navigates to playlist screen', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.see('Films');
  I.click('Films');
  I.amOnPage('http://localhost:8080/p/sR5VypYk');
  I.see('All Films');
});
