import { formatPrice } from './payments';

const baseUrl = 'http://localhost:8080/';

export const normalTimeout = 10;
export const longTimeout = 20;

export enum ShelfId {
  featured = 'featured',
  allFilms = 'all-films',
  allCourses = 'all-courses',
  continueWatching = 'continue_watching',
  favorites = 'favorites',
  liveChannels = 'live-channels',
}

export const makeShelfXpath = (shelf: ShelfId) => {
  return `//div[@data-testid="shelf-${shelf}"]`;
};

export default {
  username: 'ott-test-account@jwplayer.com',
  loginFormSelector: 'form[data-testid="login-form"]',
  registrationFormSelector: 'form[data-testid="registration-form"]',
  duplicateUserError: 'There is already a user with this email address',
  baseUrl: baseUrl,
  accountsUrl: `${baseUrl}u/my-account`,
  paymentsUrl: `${baseUrl}u/payments`,
  offersUrl: `${baseUrl}u/payments?u=choose-offer`,
  primitiveAnimalsId: 'oXGyKQ97',
  primitiveAnimalsTitle: 'Primitive Animals',
  primitiveAnimalsDescription: "If you're brand new to Blender or are getting stuck, check out the Blender 2.8 Fundamentals series.",
  agent327Title: 'Agent 327',
  agent327Description:
    'Hendrik IJzerbroot – Agent 327 – is a secret agent working for the Netherlands secret service agency. In the twenty comic books that were published since 1968, Martin Lodewijk created a rich universe with international conspiracies, hilarious characters and a healthy dose of Dutch humour.',
  bigBuckBunnyTitle: 'Big Buck Bunny',
  bigBuckBunnyDescription:
    "Big Buck Bunny (code-named Project Peach) is a 2008 short computer-animated comedy film featuring animals of the forest, made by the Blender Institute, part of the Blender Foundation. Like the foundation's previous film, Elephants Dream, the film was made using Blender, a free and open-source software application for 3D computer modeling and animation developed by the same foundation.",
  elephantsDreamTitle: 'Elephants Dream',
  elephantsDreamDescription:
    'Elephants Dream (code-named Project Orange during production and originally titled Machina) is a 2006 Dutch computer animated science fiction fantasy experimental short film produced by Blender Foundation using, almost exclusively, free and open-source software. The film is English-language and includes subtitles in over 30 languages.',
  fantasyVehicleTitle: 'Fantasy Vehicle Creation',
  fantasyVehicleId: 'lsFXY5xn',
  minecraftAnimationWorkshopTitle: 'Minecraft Animation Workshop',
  minecraftAnimationWorkshopDescription:
    'Ever wanted to learn how to make Minecraft Animation? Dillon walks you through the step by step process he used to create this Trident Animation. This includes everything from importing your Minecraft world to rendering and posting on YouTube. Enjoy!',
  startWatchingButton: 'Start watching',
  continueWatchingButton: 'Continue watching',
  signUpToWatch: 'Sign up to start watching!',
  continueWatchingShelfTitle: 'Continue Watching',
  paymentFields: {
    inplayer: {
      creditCardholder: 'Cardholder name',
      cardNumber: 'directPostCreditCardNumber',
      expiryDate: 'directPostExpiryDate',
      securityCode: 'directPostSecurityCode',
    },
    cleeng: {
      creditCardholder: 'Name on card',
      cardNumber: 'adyen-checkout__field--cardNumber',
      expiryDate: 'adyen-checkout__field--expiryDate',
      securityCode: 'adyen-checkout__field--securityCode',
    },
  },
  offers: {
    monthlyOffer: {
      cleeng: {
        label: `label[for="S970187168_NL"]`,
        price: formatPrice(6.99, 'EUR', 'NL'),
        paymentFee: formatPrice(0, 'EUR', 'NL'),
      },
      inplayer: {
        label: `label[for="S38279"]`,
        price: formatPrice(6.99, 'EUR'),
        paymentFee: formatPrice(0, 'EUR'),
      },
    },
    yearlyOffer: {
      cleeng: {
        label: `label[for="S467691538_NL"]`,
        price: formatPrice(50, 'EUR', 'NL'),
        paymentFee: formatPrice(0, 'EUR', 'NL'),
      },
      inplayer: {
        label: `label[for="S38280"]`,
        price: formatPrice(50, 'EUR'),
        paymentFee: formatPrice(0, 'EUR'),
      },
    },
  },
  creditCard: {
    inplayer: '4111111111111111',
    cleeng: '5555444433331111',
  },
};
