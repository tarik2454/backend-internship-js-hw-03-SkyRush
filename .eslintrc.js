module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    "standard",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
  },
};
