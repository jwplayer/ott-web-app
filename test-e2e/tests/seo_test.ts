Feature('seo').tag('@desktop-only');

Scenario('It renders the correct meta tags for the home screen', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.seeInTitle('Blender');

  I.seeAttributesOnElements('meta[name="description"]', { content: 'Blender demo site' });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'Blender' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: 'Blender demo site' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'Blender' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: 'Blender demo site' });
});

Scenario('It renders the correct meta tags for the playlist screen', ({ I }) => {
  I.amOnPage('http://localhost:8080/p/sR5VypYk');
  I.seeInTitle('All Films - Blender');

  I.seeAttributesOnElements('meta[name="description"]', { content: 'Blender demo site' });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'All Films - Blender' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: 'Blender demo site' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'All Films - Blender' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: 'Blender demo site' });
});

Scenario('It renders the correct meta tags for the movie screen', ({ I }) => {
  I.amOnPage('http://localhost:8080/m/JfDmsRlE/agent-327?r=sR5VypYk');
  I.seeInTitle('Agent 327 - Blender');

  I.seeAttributesOnElements('meta[name="description"]', { content: 'Hendrik IJzerbroot – Agent 327 – is a secret agent working for the Netherlands secret service agency. In the twenty comic books that were published since 1968, Martin Lodewijk created a rich universe with international conspiracies, hilarious characters and a healthy dose of Dutch humour.' });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'Agent 327 - Blender' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: 'Hendrik IJzerbroot – Agent 327 – is a secret agent working for the Netherlands secret service agency. In the twenty comic books that were published since 1968, Martin Lodewijk created a rich universe with international conspiracies, hilarious characters and a healthy dose of Dutch humour.' });
  I.seeAttributesOnElements('meta[property="og:type"]', { content: 'video.other' });
  I.seeAttributesOnElements('meta[property="og:image"]', { content: 'http://content.jwplatform.com/v2/media/JfDmsRlE/poster.jpg?width=720' });
  I.seeAttributesOnElements('meta[property="og:image:secure_url"]', { content: 'https://content.jwplatform.com/v2/media/JfDmsRlE/poster.jpg?width=720' });
  I.seeAttributesOnElements('meta[property="og:image:width"]', { content: '720' });
  I.seeAttributesOnElements('meta[property="og:image:height"]', { content: '406' });

  I.seeAttributesOnElements('meta[property="og:video"]', { content: 'http://localhost:8080/m/JfDmsRlE/agent-327' });
  I.seeAttributesOnElements('meta[property="og:video:secure_url"]', { content: 'https://localhost:8080/m/JfDmsRlE/agent-327' });
  I.seeAttributesOnElements('meta[property="og:video:type"]', { content: 'text/html' });
  I.seeAttributesOnElements('meta[property="og:video:width"]', { content: '1280' });
  I.seeAttributesOnElements('meta[property="og:video:height"]', { content: '720' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'Agent 327 - Blender' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: 'Hendrik IJzerbroot – Agent 327 – is a secret agent working for the Netherlands secret service agency. In the twenty comic books that were published since 1968, Martin Lodewijk created a rich universe with international conspiracies, hilarious characters and a healthy dose of Dutch humour.' });
  I.seeAttributesOnElements('meta[name="twitter:image"]', { content: 'https://content.jwplatform.com/v2/media/JfDmsRlE/poster.jpg?width=720' });
});

Scenario('It renders the correct structured metadata for the movie screen', ({ I }) => {
  I.amOnPage('http://localhost:8080/m/JfDmsRlE/agent-327');
  I.seeTextEquals('{"@context":"http://schema.org/","@type":"VideoObject","@id":"http://localhost:8080/m/JfDmsRlE/agent-327","name":"Agent 327","description":"Hendrik IJzerbroot – Agent 327 – is a secret agent working for the Netherlands secret service agency. In the twenty comic books that were published since 1968, Martin Lodewijk created a rich universe with international conspiracies, hilarious characters and a healthy dose of Dutch humour.","duration":"PT3M51S","thumbnailUrl":"https://content.jwplatform.com/v2/media/JfDmsRlE/poster.jpg?width=720","uploadDate":"2021-01-16T20:15:58.000Z"}', { css: 'script[type="application/ld+json"]' })
});

Scenario('It renders the correct meta tags for the series screen', ({ I }) => {
  I.amOnPage('http://localhost:8080/s/xdAqW8ya/primitive-animals?e=zKT3MFut');
  I.seeInTitle('Blocking - Blender');

  I.seeAttributesOnElements('meta[name="description"]', { content: 'If you\'re brand new to Blender or are getting stuck, check out the Blender 2.8 Fundamentals series.' });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'Blocking - Blender' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: 'If you\'re brand new to Blender or are getting stuck, check out the Blender 2.8 Fundamentals series.' });
  I.seeAttributesOnElements('meta[property="og:type"]', { content: 'video.episode' });

  I.seeAttributesOnElements('meta[property="og:image"]', { content: 'http://content.jwplatform.com/v2/media/zKT3MFut/poster.jpg?width=720' });
  I.seeAttributesOnElements('meta[property="og:image:secure_url"]', { content: 'https://content.jwplatform.com/v2/media/zKT3MFut/poster.jpg?width=720' });
  I.seeAttributesOnElements('meta[property="og:image:width"]', { content: '720' });
  I.seeAttributesOnElements('meta[property="og:image:height"]', { content: '406' });

  I.seeAttributesOnElements('meta[property="og:video"]', { content: 'http://localhost:8080/s/xdAqW8ya/primitive-animals?e=zKT3MFut' });
  I.seeAttributesOnElements('meta[property="og:video:secure_url"]', { content: 'https://localhost:8080/s/xdAqW8ya/primitive-animals?e=zKT3MFut' });
  I.seeAttributesOnElements('meta[property="og:video:type"]', { content: 'text/html' });
  I.seeAttributesOnElements('meta[property="og:video:width"]', { content: '1280' });
  I.seeAttributesOnElements('meta[property="og:video:height"]', { content: '720' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'Blocking - Blender' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: 'If you\'re brand new to Blender or are getting stuck, check out the Blender 2.8 Fundamentals series.' });
  I.seeAttributesOnElements('meta[name="twitter:image"]', { content: 'https://content.jwplatform.com/v2/media/zKT3MFut/poster.jpg?width=720' });
});

Scenario('It renders the correct structured metadata for the series screen', ({ I }) => {
  I.amOnPage('http://localhost:8080/s/xdAqW8ya/primitive-animals?e=zKT3MFut');
  I.seeTextEquals('{"@context":"http://schema.org/","@type":"TVEpisode","@id":"http://localhost:8080/s/xdAqW8ya/primitive-animals?e=zKT3MFut","episodeNumber":"1","seasonNumber":"1","name":"Blocking","uploadDate":"2021-03-10T10:00:00.000Z","partOfSeries":{"@type":"TVSeries","@id":"http://localhost:8080/s/xdAqW8ya/primitive-animals","name":"Primitive Animals","numberOfEpisodes":4,"numberOfSeasons":1}}', { css: 'script[type="application/ld+json"]' })
});
