export const copyToClipboard = (value: string): void => {
  const inputElement = document.createElement('input');
  inputElement.style.zIndex = '-10';
  inputElement.style.position = 'absolute';
  inputElement.style.left = '-1000';
  inputElement.value = value;
  document.body.appendChild(inputElement);
  inputElement.select();
  document.execCommand('copy');
  inputElement.blur();
  document.body.removeChild(inputElement);
};
