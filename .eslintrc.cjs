/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  env: {
    es2020: true,
    node: true
  },
  ignorePatterns: ["dist", "build", ".next", "coverage", "node_modules"],
  rules: {
    "prettier/prettier": "warn"
  }
};
