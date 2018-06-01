const babel = require("babel-core");
const prettier = require("prettier");

const check = `import h from "react-hyperscript";

import hx from "shit"

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

// Should be ignored
const WhenFirstArgumentIsFunctionThatIsCalled = () => h(getLoadableAnimation('pageCareersDeliver'), [h(fn())])

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
  
const MultiMemberExpressionWithClosingTag = () => h(Pricing.lol.kek, { className }, [ h('h1') ])

// to handle h(Abc, { [kek]: 0, ["norm"]: 1 }) to < Abc {...{ [kek]: 0 }} {...{ ["norm" + lol]: 1 }} norm={1} /> 
const ComplexComputedAttibutesHandling = () => h(Abc, { [kek]: 0, ["norm" + lol]: 1, ["ok"]: 2 })

// Handle multi classNames css modules (Rev only)
h(".bar.fuzz.stuff", ["bar fuzz"])

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

const result = babel.transform(check, {
  plugins: [["./src/index.js", { revolut: true }]]
}).code;

console.log(prettier.format(result, { semi: false, singleQuote: true }));

module.exports = {
  check
}
