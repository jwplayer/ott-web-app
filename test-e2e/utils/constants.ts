const baseUrl = 'http://localhost:8080/';
const filmsPlaylistId = 'dGSUzs9o';

export default {
  username: 'ott-test-account@jwplayer.com',
  password: '_KmjpSVedX2uTD3yTq&xA',
  loginFormSelector: 'form[data-testid="login-form"]',
  registrationFormSelector: 'form[data-testid="registration-form"]',
  duplicateUserError: 'There is already a user with this email address',
  filmsPlaylistId: filmsPlaylistId,
  allCoursesPlaylistId: '',
  baseUrl: baseUrl,
  accountsUrl: `${baseUrl}u/my-account`,
  registerUrl: `${baseUrl}?u=create-account`,
  loginUrl: `${baseUrl}?u=login`,
  paymentsUrl: `${baseUrl}u/payments`,
  offersUrl: `${baseUrl}u/payments?u=choose-offer`,
  filmsPlaylistUrl: `${baseUrl}p/${filmsPlaylistId}`,
  agent327DetailUrl: `${baseUrl}m/uB8aRnu6/agent-327?r=${filmsPlaylistId}`,
  elephantsDreamDetailUrl: `${baseUrl}m/8pN9r7vd/elephants-dream?r=${filmsPlaylistId}`,
  primitiveAnimalsDetailUrl: `${baseUrl}s/xdAqW8ya/primitive-animals?e=zKT3MFut`,
  agent327Description:
    'Hendrik IJzerbroot – Agent 327 – is a secret agent working for the Netherlands secret service agency. In the twenty comic books that were published since 1968, Martin Lodewijk created a rich universe with international conspiracies, hilarious characters and a healthy dose of Dutch humour.',
  bigBuckBunnyDetailUrl: `${baseUrl}m/awWEFyPu/big-buck-bunny?r=${filmsPlaylistId}`,
};
