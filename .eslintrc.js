module.exports = {
    root: true,
    extends: [
        '@react-native',
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
        'prettier',
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        sourceType: 'module',
    },
    plugins: ['react', 'react-native', 'import', 'jsx-a11y'],
    rules: {
        'react/prop-types': 'off',
        'react-native/no-inline-styles': 'off',
        'react-native/split-platform-components': 'warn',
        'import/order': ['warn', {
            groups: ['builtin', 'external', 'internal'],
            'newlines-between': 'always',
        }],
    },
};
