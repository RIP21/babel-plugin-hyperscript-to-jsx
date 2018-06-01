const babel = require("babel-core");
const prettier = require("prettier");

const check = `import h from "react-hyperscript";

const StatelessComponent = props => h("h1");

const StatelessWithReturn = props => {
  return h(".class");
};

function HyperscriptAsRegularFunction(props) {
  return h("h1");
}

const HyperscriptAsVariable = h("div.lol", {
  someProp: "lol"
});

const HyperscriptWithExpressionAsChildren = h(
  AnotherComponent,
  { foo: "bar", bar: () => ({}), shouldRender: thing.length > 0 },
  [arr.map(() => h('h1'))]
)

// Should be ignored from transforming
const FirstArgTemplateLiteralWithComputedExpressions = h(\`div.lol\${stuff}\`, {
  someProp: "lol"
});

// Not computed so should be fine
const FirstArgTemplateLiteral = h(\`div.lol\`, {
  someProp: "lol"
});

const ComputedRootWithObjectPropertyDeclaration = () =>
  h(
    ANIMATIONS[country],
    {
      className: "lol",
      content: h(".selectItem", [
        h("div", label),
        h(".flag", [
          h(RoundFlag, {
            mix: "flag",
            size: "xs",
            code: currencyData.countryCode
          }),
          // Computed not root should be wrapped in {}
          h(ANIMATIONS[country], { className: "lol" })
        ])
      ])
    },
    // This children array will be ignored
    [h(ANIMATIONS[country], { className: "lol" }), h("h1")]
  );

class Comp extends React.Component {
  render() {
    return h("div.example", [
      isStuff && h("h1#heading", { ...getProps, ...getKnobs(), stuff: "" }),
      isStuff
        ? h("h1#heading", { ...getProps, ...getKnobs(), stuff: "" })
        : h("h1#heading", "heading"),
      h("h1#heading", { ...getProps, ...getKnobs(), stuff: "" }),
      h("h1#heading", getChildren),
      h(ANIMATIONS[country], {
        className: "lol"
      }),
      h("h1#heading", getChildren(), [h("div")]),
      h("div", [h("div", "Some content")]),
      h("h1#heading", "This is hyperscript"),
      h("h2", "creating React.js markup"),
      h(
        AnotherComponent,
        { foo: "bar", bar: () => ({}), shouldRender: thing.length > 0 },
        [
          h("li", [h("a", { href: "http://whatever.com" }, "One list item")]),
          h("li", "Another list item")
        ]
      )
    ]);
  }
}`;

const result = prettier.format(
  babel.transform(check, {
    plugins: [["./src/index.js"]]
  }).code,
  { semi: false, singleQuote: true }
);

console.log(result);
