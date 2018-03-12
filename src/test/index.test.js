"use strict";

const pluginTester = require("babel-plugin-tester");
const hyperToJsxTransform = require("../index.js");
const prettier = require("prettier");

const code = `import h from 'react-hyperscript'

const StatelessComponent = (props) => h('h1')

const StatelessWithReturn = (props) => {
  return h('.class')
}  

function named(props) {
  return h('h1')
}

class Comp extends React.Component {
  render() {
    return h("div.example", [
      h('h1#heading', {...getProps, ...getKnobs(), stuff: ''}),
      h('h1#heading', getChildren),
      h('h1#heading', getChildren(), [h('div')]),
      h("div", [h("div", "Some content")]),
      h("h1#heading", "This is hyperscript"),
      h("h2", "creating React.js markup"),
      h(AnotherComponent, { foo: "bar", bar: () => ({}) }, [
        h("li", [h("a", { href: "http://whatever.com" }, "One list item")]),
        h("li", "Another list item")
      ])
    ]);
  }
}
`;

pluginTester({
  pluginName: "hyperscript-to-jsx",
  plugin: hyperToJsxTransform,
  snapshot: true,
  formatResult: output =>
    prettier.format(output, { semi: true, singleQuote: true }),
  tests: [
    {
      code
    }
  ]
});
