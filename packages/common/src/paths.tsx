export const PATH_HOME = '/';

export const PATH_MEDIA = '/m/:id/*';
export const PATH_PLAYLIST = '/p/:id/*';
export const PATH_LEGACY_SERIES = '/s/:id/*';

export const PATH_SEARCH = '/q/*';
export const PATH_ABOUT = '/o/about';

export const PATH_USER = '/u/*';
export const PATH_USER_ACCOUNT = '/u/my-account';
export const PATH_USER_MY_PROFILE = '/u/my-profile/:id';
export const PATH_USER_FAVORITES = '/u/favorites';
export const PATH_USER_PAYMENTS = '/u/payments';
export const PATH_USER_PROFILES = '/u/profiles';
export const PATH_USER_PROFILES_CREATE = '/u/profiles/create';
export const PATH_USER_PROFILES_EDIT = '/u/profiles/edit';
export const PATH_USER_PROFILES_EDIT_PROFILE = '/u/profiles/edit/:id';

// Get a nested path without the parent prefix (for nested routes)
// I.E.: getNestedPath('/u/*', '/u/my-account') => 'my-account'
const getNestedPath = (parentPath: string, fullPath: string) => fullPath.replace(parentPath.replace('*', ''), '');

export const NESTED_PATH_USER_ACCOUNT = getNestedPath(PATH_USER, PATH_USER_ACCOUNT);
export const NESTED_PATH_USER_MY_PROFILE = getNestedPath(PATH_USER, PATH_USER_MY_PROFILE);
export const NESTED_PATH_USER_FAVORITES = getNestedPath(PATH_USER, PATH_USER_FAVORITES);
export const NESTED_PATH_USER_PAYMENTS = getNestedPath(PATH_USER, PATH_USER_PAYMENTS);
export const NESTED_PATH_USER_PROFILES = getNestedPath(PATH_USER, PATH_USER_PROFILES);
