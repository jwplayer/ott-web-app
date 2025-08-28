import { copyToClipboard } from './clipboard';

document.execCommand = vi.fn();
const execCommandMocked = vi.mocked(document.execCommand);

describe('clipboard', () => {
  test('copies text to clipboard', () => {
    copyToClipboard('text to copy');

    expect(execCommandMocked).toHaveBeenCalledWith('copy');
  });

  test('restores focus to the last active element', () => {
    // create a test button
    const button = document.createElement('button');
    button.textContent = 'share';

    document.body.appendChild(button);

    button.focus();

    // document.activeElement = '';
    copyToClipboard('text to copy');

    expect(document.activeElement).toEqual(button);
    document.body.removeChild(button);
  });
});
