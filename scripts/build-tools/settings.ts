/* eslint-disable no-console */
import fs from 'fs';

export const initSettings = (mode: string) => {
  const localFile = `ini/.webapp.${mode}.ini`;
  const templateFile = `ini/templates/.webapp.${mode}.ini`;

  // The build ONLY uses .ini files in /ini to include in the build output.
  // All .ini files in the directory are git ignored to customer specific values out of source control.
  // However, this script will automatically create a .ini file for the current mode if it doesn't exist
  // by copying the corresponding mode file from the ini/templates directory.
  if (!fs.existsSync(localFile) && fs.existsSync(templateFile)) {
    fs.copyFileSync(templateFile, localFile);
  }

  return localFile;
};
