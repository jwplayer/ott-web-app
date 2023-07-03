// @ts-ignore
import read from 'read';

const ExitCodes = {
  UserCancelled: -1,
  NoSchemas: -2,
  SchemaFileError: -3,
  NotAuthorized: -4,
  MissingParam: -5,
  InvalidParam: -6,
};

export function error(message: string, reason: keyof typeof ExitCodes): never {
  console.error(`\r\nError: ${message}\r\n`);
  process.exit(ExitCodes[reason]);
}

export async function apiKeyPrompt(): Promise<string> {
  console.info();
  console.info('Please enter your V2 JWP API Key');
  console.info('You can find your API Keys here (scroll down to V2): https://dashboard.jwplayer.com/account/api-credentials');

  try {
    const result = await read({
      prompt: 'V2 API key (leave blank to exit):\r\n',
      silent: true,
      replace: '*',
      edit: true,
    });

    if (!result) {
      // Do nothing, will exit below
    } else if (result.length !== 68) {
      console.warn('\r\nError: API Key should be 68 characters. Please check your input and try again.');
      // Prompt again
      return await apiKeyPrompt();
    } else {
      return result;
    }
  } catch {
    // Do nothing, will exit below
  }

  error('User cancelled', 'UserCancelled');
}

export async function confirmPrompt(message: string, confirmMessage: string = 'Do you want to continue?') {
  console.info();
  try {
    const response = await read({
      prompt: `${message}\r\n${confirmMessage} (y/N)`,
      edit: true,
    });

    return response?.toLowerCase() === 'y';
  } catch {
    error('User cancelled', 'UserCancelled');
  }
}

export function getRequiredParam(args: { [key: string]: string }, key: string, length?: number) {
  if (!args[key]) {
    error(`"${key}" is required. Please include the "--${key}=<value>" argument`, 'MissingParam');
  }

  if (length !== undefined && args[key].length !== length) {
    error(`"${key}" must be ${length} characters long.`, 'InvalidParam');
  }

  return args[key];
}
