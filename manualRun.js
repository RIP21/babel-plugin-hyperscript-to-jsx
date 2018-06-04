const babel = require("babel-core");
const prettier = require("prettier");
const check = require("./src/test/cases").check;

const result = babel.transform(check, {
  plugins: [["./src/index.js"]]
}).code;

console.log(
  prettier.format(result, { semi: false, singleQuote: true, parser: "babylon" })
);

module.exports = {
  check
};
