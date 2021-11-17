Feature('home').tag('@desktop');

Scenario('Desktop home screen loads', ({ I }) => {
  I.amOnPage('http://localhost:8080?c=blender');
  I.see('Agent 327');
  I.see('Home');
  I.see('Films');
  I.see('Courses');
});

Scenario('Header button navigates to playlist screen', ({ I }) => {
  I.amOnPage('http://localhost:8080?c=blender');
  I.see('Films');
  I.click('Films');
  I.amOnPage('http://localhost:8080/p/sR5VypYk');
  I.see('All Films');
  I.see('The Daily Dweebs');
});

Scenario('I can slide within the featured shelf', ({ I }) => {
  I.amOnPage('http://localhost:8080?c=blender');
  I.see('Blender Channel');
  I.see('LIVE');
  I.seeElement({ css: 'div[aria-label="Item locked"]' })
  I.dontSee('Spring');
  I.dontSee('8 min');
  I.click({ css: 'div[aria-label="Slide right"]' });
  I.wait(0.4);
  I.see('Spring');
  I.see('8 min');
  I.dontSee('Blender Channel');
  I.dontSee('LIVE');
  I.click({ css: 'div[aria-label="Slide left"]' }, 'div[class="_shelfContainer_1i652_13 _featured_1i652_16"]');
  I.wait(0.4);
  I.see('Blender Channel');
  I.dontSee('Spring');
});

//todo: 
// within('div[data-mediaid="sR5VypYk"]', () => {});

Scenario('I can slide within non-featured shelves', ({ I }) => {
  I.amOnPage('http://localhost:8080?c=blender');
  I.scrollTo({ css: 'div[data-mediaid="sR5VypYk"]' });
  I.see('All Films');
  I.see('Agent 327');
  I.see('4 min');
  I.dontSee('Cosmos Laundromat');
  I.dontSee('13 min');
  I.click({ css: 'div[aria-label="Slide right"]' }, 'div[data-mediaid="sR5VypYk"]');
  I.wait(0.4);
  I.see('Cosmos Laundromat');
  I.see('13 min');
  I.dontSee('Agent 327');
  I.click({ css: 'div[aria-label="Slide left"]' }, 'div[data-mediaid="sR5VypYk"]');
  I.wait(0.4);
  I.see('Agent 327');
  I.dontSee('Cosmos Laundromat');
});

Scenario('I can see the footer', ({ I }) => {
  I.scrollPageToBottom('Blender Foundation');
  I.see('cloud.blender.org');
  I.click('cloud.blender.org');
});

