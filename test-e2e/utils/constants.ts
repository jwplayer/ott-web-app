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
  minecraftAnimationWorkshopTitle: 'Minecraft Animation Workshop',
  minecraftAnimationWorkshopDescription:
    'Dillon Gu explains a little bit about what you can expect to see in this workshop. Check out his showcase video for this workshop here on his YouTube channel!',
  startWatchingButton: 'Start watching',
  continueWatchingButton: 'Continue watching',
  signUpToWatch: 'Sign up to start watching!',
  continueWatchingShelfTitle: 'Continue Watching',
};
