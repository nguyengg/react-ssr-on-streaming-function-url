const path = require('path')

const buildEslintCommand = (filenames) =>
    `eslint --cache --fix ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`

const buildStylelintCommand = (filenames) =>
    `stylelint --cache --fix ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`

module.exports = {
    '*.{js,ts,tsx}': [buildEslintCommand],
    '*.scss': [buildStylelintCommand],
}
