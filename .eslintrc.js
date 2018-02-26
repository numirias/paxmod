module.exports = {
  "env": {
    "browser": true,
    "es6": true,
  },
  "extends": [
    "airbnb",
  ],
  "rules": {
    "prefer-const": "off",
    "arrow-parens": [
      "error",
      "as-needed",
      {"requireForBlockBody": false},
    ],
    "no-restricted-syntax": "off",
    "object-curly-spacing": [
      "error",
      "never",
    ],
    "no-alert": "off",
    "guard-for-in": "off",
    "no-mixed-operators": "off",
    "no-plusplus": "off",
    "no-continue": "off",
    "no-lonely-if": "off",
    "wrap-iife": [
      "error",
      "inside",
    ]
  }
};
