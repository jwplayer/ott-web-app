Feature('seo').tag('@desktop');

Scenario('It renders the correct meta tags for the home screen', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.seeInTitle('JW Showcase');

  I.seeAttributesOnElements('meta[name="description"]', { content: 'JW Showcase is an open-source, dynamically generated video website.' });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'JW Showcase' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: 'JW Showcase is an open-source, dynamically generated video website.' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'JW Showcase' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: 'JW Showcase is an open-source, dynamically generated video website.' });
});

Scenario('It renders the correct meta tags for the playlist screen', ({ I }) => {
  I.amOnPage('http://localhost:8080/p/4fgzPjpv');
  I.seeInTitle('Featured Covers - JW Showcase');

  I.seeAttributesOnElements('meta[name="description"]', { content: 'JW Showcase is an open-source, dynamically generated video website.' });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'Featured Covers - JW Showcase' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: 'JW Showcase is an open-source, dynamically generated video website.' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'Featured Covers - JW Showcase' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: 'JW Showcase is an open-source, dynamically generated video website.' });
});

Scenario('It renders the correct meta tags for the movie screen', ({ I }) => {
  I.amOnPage('http://localhost:8080/m/XGW7EbhZ/the-spongebob-movie-sponge-on-the-run');
  I.seeInTitle('The Spongebob Movie: Sponge On The Run - JW Showcase');

  I.seeAttributesOnElements('meta[name="description"]', { content: 'This Memorial Day weekend, SpongeBob SquarePants, his best friend Patrick Star and the rest of the gang from Bikini Bottom hit the big screen in the first-ever all CGI SpongeBob motion picture event. After SpongeBob’s beloved pet snail Gary is snail-napped, he and Patrick embark on an epic adventure to The Lost City of Atlantic City to bring Gary home. As they navigate the delights and dangers on this perilous and hilarious rescue mission, SpongeBob and his pals prove there’s nothing stronger than the power of friendship.' });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'The Spongebob Movie: Sponge On The Run - JW Showcase' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: 'This Memorial Day weekend, SpongeBob SquarePants, his best friend Patrick Star and the rest of the gang from Bikini Bottom hit the big screen in the first-ever all CGI SpongeBob motion picture event. After SpongeBob’s beloved pet snail Gary is snail-napped, he and Patrick embark on an epic adventure to The Lost City of Atlantic City to bring Gary home. As they navigate the delights and dangers on this perilous and hilarious rescue mission, SpongeBob and his pals prove there’s nothing stronger than the power of friendship.' });
  I.seeAttributesOnElements('meta[property="og:type"]', { content: 'video.other' });
  I.seeAttributesOnElements('meta[property="og:image"]', { content: 'http://content.jwplatform.com/v2/media/XGW7EbhZ/poster.jpg?width=720' });
  I.seeAttributesOnElements('meta[property="og:image:secure_url"]', { content: 'https://content.jwplatform.com/v2/media/XGW7EbhZ/poster.jpg?width=720' });
  I.seeAttributesOnElements('meta[property="og:image:width"]', { content: '720' });
  I.seeAttributesOnElements('meta[property="og:image:height"]', { content: '406' });

  I.seeAttributesOnElements('meta[property="og:video"]', { content: 'http://localhost:8080/m/XGW7EbhZ/the-spongebob-movie-sponge-on-the-run' });
  I.seeAttributesOnElements('meta[property="og:video:secure_url"]', { content: 'https://localhost:8080/m/XGW7EbhZ/the-spongebob-movie-sponge-on-the-run' });
  I.seeAttributesOnElements('meta[property="og:video:type"]', { content: 'text/html' });
  I.seeAttributesOnElements('meta[property="og:video:width"]', { content: '1280' });
  I.seeAttributesOnElements('meta[property="og:video:height"]', { content: '720' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'The Spongebob Movie: Sponge On The Run - JW Showcase' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: 'This Memorial Day weekend, SpongeBob SquarePants, his best friend Patrick Star and the rest of the gang from Bikini Bottom hit the big screen in the first-ever all CGI SpongeBob motion picture event. After SpongeBob’s beloved pet snail Gary is snail-napped, he and Patrick embark on an epic adventure to The Lost City of Atlantic City to bring Gary home. As they navigate the delights and dangers on this perilous and hilarious rescue mission, SpongeBob and his pals prove there’s nothing stronger than the power of friendship.' });
  I.seeAttributesOnElements('meta[name="twitter:image"]', { content: 'https://content.jwplatform.com/v2/media/XGW7EbhZ/poster.jpg?width=720' });
});

Scenario('It renders the correct structured metadata for the movie screen', ({ I }) => {
  I.amOnPage('http://localhost:8080/m/XGW7EbhZ/the-spongebob-movie-sponge-on-the-run');
  I.seeTextEquals('{"@context":"http://schema.org/","@type":"VideoObject","@id":"http://localhost:8080//m/XGW7EbhZ/the-spongebob-movie-sponge-on-the-run","name":"The Spongebob Movie: Sponge On The Run","description":"This Memorial Day weekend, SpongeBob SquarePants, his best friend Patrick Star and the rest of the gang from Bikini Bottom hit the big screen in the first-ever all CGI SpongeBob motion picture event. After SpongeBob’s beloved pet snail Gary is snail-napped, he and Patrick embark on an epic adventure to The Lost City of Atlantic City to bring Gary home. As they navigate the delights and dangers on this perilous and hilarious rescue mission, SpongeBob and his pals prove there’s nothing stronger than the power of friendship.","duration":"PT2M","thumbnailUrl":"https://content.jwplatform.com/v2/media/XGW7EbhZ/poster.jpg?width=720","uploadDate":"2019-11-22T18:49:49.000Z"}', { css: 'script[type="application/ld+json"]' })
});

Scenario('It renders the correct meta tags for the series screen', ({ I }) => {
  I.amOnPage('http://localhost:8080/s/xdAqW8ya/primitive-animals?e=xdAqW8ya');
  I.seeInTitle('Blocking - JW Showcase');

  I.seeAttributesOnElements('meta[name="description"]', { content: 'If you\'re brand new to Blender or are getting stuck, check out the Blender 2.8 Fundamentals series.' });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'Blocking - JW Showcase' });
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

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'Blocking - JW Showcase' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: 'If you\'re brand new to Blender or are getting stuck, check out the Blender 2.8 Fundamentals series.' });
  I.seeAttributesOnElements('meta[name="twitter:image"]', { content: 'https://content.jwplatform.com/v2/media/zKT3MFut/poster.jpg?width=720' });
});

Scenario('It renders the correct structured metadata for the series screen', ({ I }) => {
  I.amOnPage('http://localhost:8080/s/xdAqW8ya/primitive-animals?e=xdAqW8ya');
  I.seeTextEquals('{"@context":"http://schema.org/","@type":"TVEpisode","@id":"http://localhost:8080//s/xdAqW8ya/primitive-animals?e=zKT3MFut","episodeNumber":"1","seasonNumber":"1","name":"Blocking","uploadDate":"2021-03-10T10:00:00.000Z","partOfSeries":{"@type":"TVSeries","@id":"http://localhost:8080//s/xdAqW8ya/primitive-animals","name":"Primitive Animals","numberOfEpisodes":4,"numberOfSeasons":1}}', { css: 'script[type="application/ld+json"]' })
});
