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
  const key = paths.shift() || '';

  if (paths.length <= 0) {
    obj[key] = newValue;
  } else {
    obj[key] = updateObject(obj[key] as JsonObject, paths, newValue);
  }

  return obj;
}

function run() {
  const allFiles = fs.readdirSync('.temp-translations');

  for (const file of allFiles) {
    const language = file.split('.')[1];

    const lines = parse(fs.readFileSync(`.temp-translations/${file}`), {
      fromLine: 2,
      columns: ['filename', 'key', ...(language === 'en' ? [] : [false as ColumnOption, false as ColumnOption]), false, 'value'],
      relax_column_count: true,
    }) as Line[];
    const groups = lines.reduce((allGroups, line) => {
      allGroups[line.filename] ||= [];
      allGroups[line.filename].push(line);

      return allGroups;
    }, {} as { [filename: string]: Line[] });

    Object.entries(groups).forEach(([jsonFile, lines]) => {
      const filename = `public/locales/${language}/${jsonFile}`;

      const json = JSON.parse(fs.readFileSync(filename).toString());

      for (const line of lines) {
        updateObject(json, line.key.split('.'), line.value);
      }

      fs.writeFileSync(filename, JSON.stringify(json));
    });
  }
}

run();
