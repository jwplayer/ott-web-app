Feature('playlist').tag('@mobile');

Before(({I}) => {
  I.amOnPage('http://localhost:8080/p/dGSUzs9o');
})

Scenario('Playlist screen loads on mobile', ({ I }) => {
  I.see('All Films');
  I.see('Agent 327');
  I.see('Big Buck Bunny');
  I.see('Caminandes 1: Llama Drama');
  I.see('Caminandes 2: Gran Dillama')
});

Scenario('I see the filter options', ({ I }) => {
  I.see('All');
});

Scenario('I can change the filter to action', ({ I }) => {
  I.see('All');

  I.selectOption('Filter videos by genre', 'Action');

  I.see('Agent 327');
  I.see('Coffee Run');
  I.see('Tears of Steel');
  I.dontSee('Big Buck Bunny');
  I.dontSee('Caminandes 1: Llama Drama');
  I.dontSee('Caminandes 2: Gran Dillama');
});

Scenario('I can reset the filter by selection the "All" option', ({ I }) => {
  I.selectOption('Filter videos by genre', 'Action');

  I.see('Agent 327');
  I.dontSee('Big Buck Bunny');
  I.dontSee('Caminandes 1: Llama Drama');
  I.dontSee('Caminandes 2: Gran Dillama');

  I.selectOption('Filter videos by genre', 'All');

  I.see('Agent 327');
  I.see('Big Buck Bunny');
  I.see('Caminandes 1: Llama Drama');
  I.see('Caminandes 2: Gran Dillama');
});

Scenario('I can click on a card and navigate to the video screen', ({ I }) => {
  I.click({ css: 'div[aria-label="Play Big Buck Bunny"]' });
  I.seeInCurrentUrl('http://localhost:8080/m/awWEFyPu/big-buck-bunny?r=dGSUzs9o')
});
