'use-strict';

const { writeFileSync, readFileSync, mkdirSync } = require('fs');

if (process.argv.length < 3) {
  console.error(`
    Please pass new component name including path in kebab case!
    Example:
    components/basic/form-example-divider
    Result:
    components/basic/FormExampleDivider.tsx
    components/basic/FormExampleDivider.test.tsx
    components/basic/FormExampleDivider.module.scss
  `);
  return;
}

const path = process.argv[2];
const splitPath = path.split('/');

const componentName = {
  kebabCase: splitPath[splitPath.length - 1],
  pascalCase: toPascalCase(splitPath[splitPath.length - 1]),
};

const baseTsx = readFileSync('./scripts/blueprint/base/Base.tsx');
const baseTestTsx = readFileSync('./scripts/blueprint/base/Base.test.tsx');
const baseScss = readFileSync('./scripts/blueprint/base/Base.module.scss');

// creates target directory
const dir = `./src/${path}`;
mkdirSync(dir, { recursive: true });

// TSX
const componentTsx = baseTsx
  .toString()
  .replace(/Base/g, componentName.pascalCase)
  .replace(/base/g, componentName.kebabCase);
writeFileSync(`${dir}/${componentName.pascalCase}.tsx`, componentTsx);

// TEST.TSX
const componentTestTsx = baseTestTsx
  .toString()
  .replace(/Base/g, componentName.pascalCase)
  .replace(/base/g, componentName.kebabCase);
writeFileSync(`${dir}/${componentName.pascalCase}.test.tsx`, componentTestTsx);

// SCSS
const componentScss = baseScss
  .toString()
  .replace(/basis/g, componentName.kebabCase)
  .replace(
    /.\/path\//g,
    `./${new Array(splitPath.length).fill('../').join('')}`
  );
writeFileSync(`${dir}/${componentName.pascalCase}.module.scss`, componentScss);

// Helpers
function toPascalCase(input) {
  const split = input.split('-');
  return split.map((i) => capitalize(i)).join('');
}

function capitalize(s) {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
