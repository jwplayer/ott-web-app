Feature('playlist').tag('@desktop');

Scenario('Playlist screen loads', ({ I }) => {
  I.amOnPage('http://localhost:8080/p/dGSUzs9o');
  I.see('All Films');
  I.see('Agent 327');
  I.see('Big Buck Bunny');
  I.see('Caminandes 1: Llama Drama');
  I.see('Caminandes 2: Gran Dillama');
});

Scenario('I see the defined filter buttons', ({ I }) => {
  I.see('Action');
  I.see('Comedy');
  I.see('Drama');
  I.see('Fantasy');
  I.see('All');
});

Scenario('I can filter the playlist on a genre', ({ I }) => {
  I.click('Action');
  I.see('Agent 327');
  I.see('Coffee Run');
  I.see('Tears of Steel');
  I.dontSee('Big Buck Bunny');
  I.dontSee('Caminandes 1: Llama Drama');
  I.dontSee('Caminandes 2: Gran Dillama');
});

Scenario('I can reset the filter by clicking on "All"', ({ I }) => {
  I.click('All');
  I.see('Big Buck Bunny');
  I.see('Caminandes 1: Llama Drama');
  I.see('Caminandes 2: Gran Dillama');
});

Scenario('I can click on a card and navigate to the video screen', ({ I }) => {
  I.click({ css: 'div[aria-label="Play Big Buck Bunny"]' });
  I.seeInCurrentUrl('http://localhost:8080/m/awWEFyPu/big-buck-bunny?r=dGSUzs9o')
});
