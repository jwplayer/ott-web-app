import * as fs from 'fs';

// @ts-ignore
import { ColumnOption, parse } from 'csv-parse/sync';

interface Line {
  filename: string;
  key: string;
  value: string;
}

interface JsonObject {
  [key: string]: string | JsonObject;
}

function updateObject(obj: JsonObject, paths: string[], newValue: string) {
  // Recurse through each piece of the key path
  const key = paths.shift() || '';

  // If this is the last bit of the path, set the value
  if (paths.length <= 0) {
    obj[key] = newValue;
  }
  // If this is part of a longer key, lookup the key and iterate into it (fallback to an empty object if not found)
  else {
    obj[key] = updateObject((Object.keys(obj).includes(key) ? obj[key] : {}) as JsonObject, paths, newValue);
  }

  return obj;
}

function run() {
  const allFiles = fs.readdirSync('.temp-translations');

  // Loop through all the translation files
  for (const file of allFiles) {
    const language = file.split('.')[1];

    // Read the translation files
    const lines = parse(fs.readFileSync(`.temp-translations/${file}`), {
      fromLine: 2,
      // The English file has fewer columns
      columns: ['filename', 'key', ...(language === 'en' ? [] : [false as ColumnOption, false as ColumnOption]), false, 'value'],
      relax_column_count: true,
    }) as Line[];
    // Group all the translations by file
    const groups = lines.reduce((allGroups, line) => {
      allGroups[line.filename] ||= [];
      allGroups[line.filename].push(line);
      allGroups[line.filename].sort();

      return allGroups;
    }, {} as { [filename: string]: Line[] });

    // Loop through each group (file), and load the json resource into an object
    Object.entries(groups).forEach(([jsonFile, updatedTranslations]) => {
      const filename = `public/locales/${language}/${jsonFile}`;

      const json = JSON.parse(fs.readFileSync(filename).toString());
      // Update each translation by key
      for (const updatedTranslation of updatedTranslations) {
        updateObject(json, updatedTranslation.key.split('.'), updatedTranslation.value);
      }

      fs.writeFileSync(filename, JSON.stringify(json));
    });
  }
}

run();
