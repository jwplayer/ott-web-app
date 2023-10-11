import { execSync } from 'child_process';
import * as fs from 'fs';

const changes: {
  [file: string]: {
    [key: string]: {
      [language: string]: {
        oldValue?: string;
        newValue?: string;
      };
    };
  };
} = {};

function run() {
  execSync('git fetch');

  const fileChanges = execSync('git diff -U200000 --no-prefix origin/release..origin/release-candidate public/locales')
    .toString()
    .split('\n')
    .filter((s) => !!s)
    .map((s) => s.trim());

  let filename = '';
  let language = '';
  let path: string[] = [];

  for (const line of fileChanges) {
    if (line.startsWith('diff --git')) {
      [filename, language] = line.split('\n')[0].split('/').reverse() || [];
      path = [];
    } else if (line.match(/^\+?\s*"[^:]+": {$/)?.length) {
      // This is the start of a new subgroup, parse the name and add it to the path
      path.push(line.split('"')[1]);
    } else if (line.match(/^\+?\s*},?$/)?.length) {
      // This is the end of a subgroup, so take last path segment away
      path.pop();
    } else if (line.startsWith('---') || line.startsWith('+++')) {
      // Skip these lines
    } else if (line.match(/^[+-]\s*"[^"]+": "[^"]*",?$/)) {
      // This is a changed line
      // Split by quotes to get the items at index 1 and 3 which should be the name and value
      const [, name, , value] = line.split('"');

      // Reconstruct the full path from any parent paths
      const key = [...path, name].join('.');

      // Make sure that the nested items have values
      changes[filename] ||= {};
      changes[filename][key] ||= {};
      changes[filename][key][language] ||= {};

      // Set the old or new value props based on the git symbol
      if (line.startsWith('+')) {
        changes[filename][key][language].newValue = value;
      } else {
        changes[filename][key][language].oldValue = value;
      }
    }
  }

  const languageGroups: {
    [language: string]: string[];
  } = {};

  Object.entries(changes).forEach(([filename, fileChanges]) => {
    Object.entries(fileChanges).forEach(([key, languages]) => {
      Object.entries(languages).forEach(([language, props]) => {
        // Only include keys with updated new values or where the English has updated new values
        if (
          (languages['en']?.newValue !== undefined && languages['en']?.newValue !== languages['en']?.oldValue) ||
          (props.newValue !== undefined && props.newValue !== props.oldValue)
        ) {
          // Add the headers
          languageGroups[language] ||= [
            [
              'File',
              'Translation Key',
              // Show Old/New English fields for other languages to help translators
              ...(language === 'en' ? [] : ['Original Value (en)', 'New Value (en)']),
              `Original Value (${language})`,
              `Updated Value (${language})`,
            ].join(','),
          ];

          languageGroups[language].push(
            [
              filename,
              key,
              // Show Old/New English values for other languages to help translators
              ...(language === 'en' ? [] : [languages['en']?.oldValue || '', languages['en']?.newValue || '']),
              props.oldValue || '',
              props.newValue || '',
            ]
              // Wrap with quotes to escape any internal commas
              .map((v) => `"${v}"`)
              .join(','),
          );
        }
      });
    });
  });

  if (!fs.existsSync('.temp-translations')) {
    fs.mkdirSync('.temp-translations');
  }

  Object.entries(languageGroups).forEach(([language, values]) => {
    const file = `.temp-translations/translations.${language}.csv`;

    fs.writeFileSync(file, values.join('\n'), 'utf8');
    console.info(`Wrote ${values.length - 1} keys to ${file}`);
  });
}

run();
