export const PATH_HOME = '/';

export const PATH_MEDIA = '/m/:id/*';
export const PATH_PLAYLIST = '/p/:id/*';
export const PATH_LEGACY_SERIES = '/s/:id/*';

export const PATH_SEARCH = '/q/*';
export const PATH_ABOUT = '/o/about';

export const PATH_USER_BASE = '/u';
export const PATH_USER = `${PATH_USER_BASE}/*`;

export const RELATIVE_PATH_USER_ACCOUNT = 'my-account';
export const RELATIVE_PATH_USER_MY_PROFILE = 'my-profile/:id';
export const RELATIVE_PATH_USER_FAVORITES = 'favorites';
export const RELATIVE_PATH_USER_PAYMENTS = 'payments';
export const RELATIVE_PATH_USER_PROFILES = 'profiles';

export const PATH_USER_ACCOUNT = `${PATH_USER_BASE}/${RELATIVE_PATH_USER_ACCOUNT}`;
export const PATH_USER_MY_PROFILE = `${PATH_USER_BASE}/${RELATIVE_PATH_USER_MY_PROFILE}`;
export const PATH_USER_FAVORITES = `${PATH_USER_BASE}/${RELATIVE_PATH_USER_FAVORITES}`;
export const PATH_USER_PAYMENTS = `${PATH_USER_BASE}/${RELATIVE_PATH_USER_PAYMENTS}`;
export const PATH_USER_PROFILES = `${PATH_USER_BASE}/${RELATIVE_PATH_USER_PROFILES}`;
export const PATH_USER_PROFILES_CREATE = `${PATH_USER_BASE}/${RELATIVE_PATH_USER_PROFILES}/create`;
export const PATH_USER_PROFILES_EDIT = `${PATH_USER_BASE}/${RELATIVE_PATH_USER_PROFILES}/edit`;
export const PATH_USER_PROFILES_EDIT_PROFILE = `${PATH_USER_BASE}/${RELATIVE_PATH_USER_PROFILES}/edit/:id`;
