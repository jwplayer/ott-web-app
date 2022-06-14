const special = ['composes'];

const positioning = ['position', 'top', 'right', 'bottom', 'left', 'z-index'];

const boxmodel = [
  'display',
  'flex',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'flex-flow',
  'flex-direction',
  'flex-wrap',
  'justify-content',
  'align-content',
  'align-items',
  'align-self',
  'order',
  'float',
  'clear',
  'box-sizing',
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'margin-block',
  'margin-block-start',
  'margin-block-end',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'padding-block',
  'padding-block-start',
  'padding-block-end',
  'overflow',
  'overflow-x',
  'overflow-y',
];

const typography = [
  'color',
  'font',
  'font-family',
  'font-weight',
  'font-size',
  'font-style',
  'font-variant',
  'font-size-adjust',
  'font-stretch',
  'font-effect',
  'font-emphasize',
  'font-emphasize-position',
  'font-emphasize-style',
  'font-smooth',
  'line-height',
  'direction',
  'letter-spacing',
  'white-space',
  'text-align',
  'text-align-last',
  'text-transform',
  'text-decoration',
  'text-emphasis',
  'text-emphasis-color',
  'text-emphasis-style',
  'text-emphasis-position',
  'text-indent',
  'text-justify',
  'text-outline',
  'text-wrap',
  'text-overflow',
  'text-overflow-ellipsis',
  'text-overflow-mode',
  'text-orientation',
  'text-shadow',
  'vertical-align',
  'word-wrap',
  'word-break',
  'word-spacing',
  'overflow-wrap',
  'tab-size',
  'hyphens',
  'unicode-bidi',
  'columns',
  'column-count',
  'column-fill',
  'column-gap',
  'column-rule',
  'column-rule-color',
  'column-rule-style',
  'column-rule-width',
  'column-span',
  'column-width',
  'page-break-after',
  'page-break-before',
  'page-break-inside',
  'src',
];

const visual = [
  'list-style',
  'list-style-position',
  'list-style-type',
  'list-style-image',
  'table-layout',
  'empty-cells',
  'caption-side',
  'background',
  'background-color',
  'background-image',
  'background-repeat',
  'background-position',
  'background-position-x',
  'background-position-y',
  'background-size',
  'background-clip',
  'background-origin',
  'background-attachment',
  'background-blend-mode',
  'box-decoration-break',
  'border',
  'border-width',
  'border-style',
  'border-color',
  'border-top',
  'border-top-width',
  'border-top-style',
  'border-top-color',
  'border-right',
  'border-right-width',
  'border-right-style',
  'border-right-color',
  'border-bottom',
  'border-bottom-width',
  'border-bottom-style',
  'border-bottom-color',
  'border-left',
  'border-left-width',
  'border-left-style',
  'border-left-color',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'border-image',
  'border-image-source',
  'border-image-slice',
  'border-image-width',
  'border-image-outset',
  'border-image-repeat',
  'border-collapse',
  'border-spacing',
  'outline',
  'outline-width',
  'outline-style',
  'outline-color',
  'outline-offset',
  'box-shadow',
  'transform',
  'transform-origin',
  'transform-style',
  'backface-visibility',
  'perspective',
  'perspective-origin',
  'visibility',
  'cursor',
  'opacity',
  'filter',
  'backdrop-filter',
];

const animation = [
  'transition',
  'transition-delay',
  'transition-timing-function',
  'transition-duration',
  'transition-property',
  'animation',
  'animation-name',
  'animation-duration',
  'animation-play-state',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
];

const misc = [
  'appearance',
  'clip',
  'clip-path',
  'counter-reset',
  'counter-increment',
  'resize',
  'user-select',
  'nav-index',
  'nav-up',
  'nav-right',
  'nav-down',
  'nav-left',
  'pointer-events',
  'quotes',
  'touch-action',
  'will-change',
  'zoom',
  'fill',
  'fill-rule',
  'clip-rule',
  'stroke',
];

module.exports = (function () {
  return {
    extends: ['stylelint-config-recommended-scss'],

    plugins: [
      // Support SCSS
      'stylelint-scss',

      // Automatic rule ordering
      'stylelint-order',

      'stylelint-declaration-strict-value',
    ],

    defaultSeverity: 'error',

    rules: {
      'order/order': [
        // Variables first
        'custom-properties',
        'dollar-variables',

        // Any mixins
        {
          type: 'at-rule',
          name: 'include',
        },

        // Style declarations
        'declarations',

        // Pseudo elements
        {
          type: 'rule',
          name: 'Pseudo Element',
          selector: /^&:(:|-)/,
        },

        // Normal child elements
        'rules',

        // State modifier
        {
          type: 'rule',
          name: 'State Modifier',
          selector: /^&(:(?!:)|\[)/,
        },

        {
          type: 'at-rule',
          name: 'include',
          parameter: new RegExp('responsive'),
        },
      ],

      // Ensure logical and consistent property ordering
      'order/properties-order': [...special, ...positioning, ...boxmodel, ...typography, ...visual, ...animation, ...misc],

      // Ensure that certain properties have a strict variable
      'scale-unlimited/declaration-strict-value': [
        ['/color/', 'z-index'],
        {
          ignoreValues: {
            '': ['currentColor', 'inherit', 'transparent'],
            'z-index': ['-1', '0', '1'],
          },

          disableFix: true,
        },
      ],

      // Double colon should be used for pseudo elements
      // https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
      'selector-pseudo-element-colon-notation': 'double',

      // PostCSS takes care of automatic vendor prefixing (not implemented currently)
      'property-no-vendor-prefix': null,

      // No units are needed for zero
      'length-zero-no-unit': true,

      // Prevent using global animations
      'no-unknown-animations': true,

      'no-descending-specificity': null,
      'at-rule-semicolon-newline-after': 'always',
      'block-opening-brace-newline-after': 'always',
      'block-closing-brace-newline-after': 'always',
    },
  };
})();
