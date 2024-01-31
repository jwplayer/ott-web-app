import { IS_DEVELOPMENT_BUILD, IS_PREVIEW_MODE, IS_TEST_MODE } from '@jwp/ott-common/src/utils/common';

import { overrideIPCookieKey } from '#src/constants';

export function getOverrideIP() {
  if (!IS_TEST_MODE && !IS_DEVELOPMENT_BUILD && !IS_PREVIEW_MODE) {
    return undefined;
  }

  return document.cookie
    .split(';')
    .find((s) => s.trim().startsWith(`${overrideIPCookieKey}=`))
    ?.split('=')[1]
    .trim();
}
