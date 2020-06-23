module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    "extends": [
        "plugin:@typescript-eslint/recommended",
        "airbnb-typescript/base"
    ],
    "rules": {
        // Disabled because this is too broad to apply to the project as a whole
        "import/prefer-default-export": 0,
        "max-len": 0,
        'no-restricted-syntax': [
            // AirBnb does not allow ForOf. Override their recommendations to allow it here
            'error',
            'ForInStatement',
            'LabeledStatement',
            'WithStatement',
        ],
        "padded-blocks": 0,
        "no-console": ["error", { allow: ["warn", "error"] }],
        "no-new-func": 0,
        "no-new": 0, // CDK use new for side effects
        "import/no-cycle": 0,
        // Allow console logging, logs are shipped to CloudWatch which is useful
        "no-console": 0,
        "indent": "off",
        "@typescript-eslint/indent": ["error", 4],
        "@typescript-eslint/no-implied-eval": "off",
        "@typescript-eslint/no-throw-literal": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        // Personal preferences
        "no-case-declarations": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "object-curly-newline": 0, // Don't require new lines after all curlies
        "no-await-in-loop": 0,

    },
}