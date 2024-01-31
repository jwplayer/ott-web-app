export function debounce<T extends (...args: any[]) => void>(callback: T, wait = 200) {
  let timeout: NodeJS.Timeout | null;
  return (...args: unknown[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), wait);
  };
}

/**
 * Parse hex color and return the RGB colors
 * @param color
 * @return {{r: number, b: number, g: number}|undefined}
 */
export function hexToRgb(color: string) {
  if (color.indexOf('#') === 0) {
    color = color.slice(1);
  }

  // convert 3-digit hex to 6-digits.
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }

  if (color.length !== 6) {
    return undefined;
  }

  return {
    r: parseInt(color.slice(0, 2), 16),
    g: parseInt(color.slice(2, 4), 16),
    b: parseInt(color.slice(4, 6), 16),
  };
}

/**
 * Get the contrast color based on the given color
 * @param {string} color Hex or RGBA color string
 * @link {https://stackoverflow.com/a/35970186/1790728}
 * @return {string}
 */
export function calculateContrastColor(color: string) {
  const rgb = hexToRgb(color);

  if (!rgb) {
    return '';
  }

  // http://stackoverflow.com/a/3943023/112731
  return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114 > 186 ? '#000000' : '#FFFFFF';
}

// Build is either Development or Production
// Mode can be dev, jwdev, demo, test, prod, etc.
export const IS_DEVELOPMENT_BUILD = __dev__;
// Demo mode is used to run our firebase demo instance
export const IS_DEMO_MODE = __mode__ === 'demo';
// Test mode is used for e2e and unit tests
export const IS_TEST_MODE = __mode__ === 'test';

// Preview mode is used for previewing Pull Requests on GitHub
export const IS_PREVIEW_MODE = __mode__ === 'preview';
// Production mode
export const IS_PROD_MODE = __mode__ === 'prod';

export function logDev(message: unknown, ...optionalParams: unknown[]) {
  if ((IS_DEVELOPMENT_BUILD || IS_PREVIEW_MODE) && !IS_TEST_MODE) {
    if (optionalParams.length > 0) {
      console.info(message, optionalParams);
    } else {
      console.info(message);
    }
  }
}

export const isTruthyCustomParamValue = (value: unknown): boolean => ['true', '1', 'yes', 'on'].includes(String(value)?.toLowerCase());

export const isFalsyCustomParamValue = (value: unknown): boolean => ['false', '0', 'no', 'off'].includes(String(value)?.toLowerCase());

export function testId(value: string | undefined) {
  return IS_DEVELOPMENT_BUILD || IS_TEST_MODE || IS_PREVIEW_MODE ? value : undefined;
}

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;
export const isTruthy = <T>(value: T | true): value is Truthy<T> => Boolean(value);
