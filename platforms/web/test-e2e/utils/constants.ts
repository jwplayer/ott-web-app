import { formatPrice } from './payments';

const baseUrl = 'http://localhost:8080/';

export const normalTimeout = 10;
export const longTimeout = 20;

export enum ShelfId {
  hero = 'hero',
  featured = 'featured',
  allFilms = 'all-films',
  allCourses = 'all-courses',
  continueWatching = 'continue_watching',
  favorites = 'favorites',
  liveChannels = 'live-channels',
}

export const makeShelfXpath = (shelf: ShelfId) => {
  return `//section[@data-testid="shelf-${shelf}"]`;
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
  agent327TitleSpanish: 'Agente 327',
  agent327DescriptionSpanish:
    'Hendrik IJzerbroot, el Agente 327, es un agente secreto que trabaja para la agencia del servicio secreto de los Países Bajos. En los veinte cómics publicados desde 1968, Martin Lodewijk creó un rico universo con conspiraciones internacionales, personajes hilarantes y una saludable dosis de humor holandés.',
  bigBuckBunnyTitle: 'Big Buck Bunny',
  bigBuckBunnyDescription:
    "Big Buck Bunny (code-named Project Peach) is a 2008 short computer-animated comedy film featuring animals of the forest, made by the Blender Institute, part of the Blender Foundation. Like the foundation's previous film, Elephants Dream, the film was made using Blender, a free and open-source software application for 3D computer modeling and animation developed by the same foundation.",
  bigBuckBunnyTitleSpanish: 'Gran Conejo Buck',
  bigBuckBunnyDescriptionSpanish:
    'Gran Conejo Buck (código de nombre Proyecto Durazno) es un cortometraje de comedia animado por computadora de 2008 que presenta animales del bosque, realizado por el Instituto Blender, parte de la Fundación Blender. Al igual que la película anterior de la fundación, Elephants Dream, la película fue realizada utilizando Blender, una aplicación gratuita y de código abierto para modelado y animación 3D desarrollada por la misma fundación.',
  elephantsDreamTitle: 'Elephants Dream',
  elephantsDreamDescription:
    'Elephants Dream (code-named Project Orange during production and originally titled Machina) is a 2006 Dutch computer animated science fiction fantasy experimental short film produced by Blender Foundation using, almost exclusively, free and open-source software. The film is English-language and includes subtitles in over 30 languages.',
  elephantsDreamTitleSpanish: 'Sueño de Elefantes',
  elephantsDreamDescriptionSpanish:
    'Sueño de Elefantes (código de nombre Proyecto Naranja durante la producción y originalmente titulado Machina) es un cortometraje experimental de ciencia ficción animado por computadora de 2006 producido por la Fundación Blender utilizando, casi exclusivamente, software libre y de código abierto. La película está en inglés e incluye subtítulos en más de 30 idiomas.',
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
  customRegFields: {
    topContainerSelector: 'div[data-testid="custom-reg-fields"]',
    termsAndConditionsField: 'input[type="checkbox"][name="terms"]',
    crfTextInput: '[data-testid="crf-input"]',
    crfCheckbox: '[data-testid="crf-checkbox"]',
    crfCountrySelect: '[data-testid="crf-country"]',
    crfUsStateSelect: '[data-testid="crf-us_state"]',
    crfDropdownSelect: '[data-testid="crf-select"]',
    crfRadioBox: '[data-testid="crf-radio"]',
    crfDateField: '[data-testid="crf-datepicker"]',
  },
  offers: {
    monthlyOffer: {
      cleeng: {
        label: `label[for="S970187168_NL"]`,
        price: formatPrice(6.99, 'EUR', 'NL'),
        paymentFee: formatPrice(0, 'EUR', 'NL'),
        trialDescription: 'First month free',
      },
      inplayer: {
        label: `label[for="S118699_38279"]`,
        price: formatPrice(6.99, 'EUR'),
        paymentFee: formatPrice(0, 'EUR'),
        trialDescription: 'First 5 days free',
      },
    },
    yearlyOffer: {
      cleeng: {
        label: `label[for="S467691538_NL"]`,
        price: formatPrice(50, 'EUR', 'NL'),
        paymentFee: formatPrice(0, 'EUR', 'NL'),
      },
      inplayer: {
        label: `label[for="S118699_38280"]`,
        price: formatPrice(50, 'EUR'),
        paymentFee: formatPrice(0, 'EUR'),
      },
    },
  },
  creditCard: {
    inplayer: '4111111111111111',
    cleeng: '5555341244441115',
  },
};
