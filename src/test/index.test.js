"use strict";

const pluginTester = require("babel-plugin-tester");
const hyperToJsxTransform = require("../index.js");
const prettier = require("prettier");
const { check, complexExample } = require("./cases");

const hAndhxImports = `import h from 'h';
import hx from 'hx';`;

const tests = [
  {
    title: "Fake all cases",
    code: check
  },
  { title: "Complex real", code: complexExample },
  {
    title: "Import default added",
    code: `
    import { Component } from 'react';
    import h from 'hyper';
    `
  },
  {
    title: "Import default is not added cause no hyperscript",
    code: `
    import { Component } from 'react';
    `
  },
  {
    title: "If default import is there, keep it with no affect",
    code: `
    import React, { Component } from 'react';
    import h from 'hyper';
    `
  },
  {
    code: `${hAndhxImports}
   const StatelessComponent = props => h("h1");`
  },

  {
    code: `${hAndhxImports}
     const StatelessWithReturn = props => {
  return h(".class");
};`
  },
  {
    code: `${hAndhxImports}
     const HandlesAssignment = ({ title }) => {
  title = h("span");
};`
  },
  {
    code: `${hAndhxImports}
     handleArrays = [
  h(Sidebar, { categories }),
  h(CategoryQuestions, { ...question, isBusiness })
];`
  },

  {
    code: `${hAndhxImports}
   const ClassNameWithDashesSingle = props => h(".this-is-dashes");`
  },
  {
    code: `${hAndhxImports}
     const ClassNameWithDashesMulti = props => h(".this-is-dashes.dash-afterDash");`
  },
  {
    code: `${hAndhxImports}
     const JustPropField = h(Stuff, {
  children: h(FormattedMessage, { ...commonMessages.learnMore })
});`
  },
  {
    code: `${hAndhxImports}
     function HyperscriptAsRegularFunction(props) {
  return h("h1");
}`
  },
  {
    code: `${hAndhxImports}
     const HyperscriptAsVariable = h("div.lol", {
  someProp: "lol"
});`
  },
  {
    code: `${hAndhxImports}
     const HyperscriptWithExpressionAsChildren = h(
  AnotherComponent,
  { foo: "bar", bar: () => ({}), shouldRender: thing.length > 0 },
  [arr.map(() => h("h1"))]
);`
  },
  {
    code: `${hAndhxImports}
     // Should be ignored from transforming
const FirstArgTemplateLiteralWithComputedExpressions = h(\`div.lol\${stuff}\`, {
  someProp: "lol"
});`
  },
  {
    code: `${hAndhxImports}
     // Not computed so should be fine
const FirstArgTemplateLiteral = h(\`div.lol\`, {
  someProp: "lol"
});`
  },
  {
    code: `${hAndhxImports}
     // Should be ignored
const WhenFirstArgumentIsFunctionThatIsCalled = () =>
  h(getLoadableAnimation("pageCareersDeliver"), [h(fn())]);`
  },
  {
    code: `${hAndhxImports}
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
    // This first children in array will be ignored FOR THIS UGLY HACK IN INDEX
    [
      h(ANIMATIONS[country], { className: "lol" }),
      h("h1"),
      kek && mem,
      surreal ? lol : kek,
      t.tabName,
      lol,
      <div />
    ]
  )`
  },
  {
    code: `${hAndhxImports}
   h("div" + "div");`
  },
  {
    code: `${hAndhxImports}
     const ThirdArgOnIgnoredIsNotArray = () =>
  h(
    ANIMATIONS[country],
    {
      className: "lol"
    },
    // This first children in array will be ignored FOR THIS UGLY HACK IN INDEX
    children
  );`
  },
  {
    code: `${hAndhxImports}
     const SecondArgOnIgnoredIsNotArray = () => h(ANIMATIONS[country], children);`
  },

  {
    code: `${hAndhxImports}
     const MultiMemberExpressionWithClosingTag = () =>
  h(Pricing.lol.kek, { className }, [h("h1")]);`
  },
  {
    code: `${hAndhxImports}
     // to handle h(Abc, { [kek]: 0, ["norm"]: 1 }) to < Abc {...{ [kek]: 0 }} {...{ ["norm" + lol]: 1 }} norm={1} />
const ComplexComputedAttibutesHandling = () =>
  h(Abc, { [kek]: 0, ["norm" + lol]: 1, ["ok"]: 2 });`
  },
  {
    code: `${hAndhxImports}
     // Handle multi classNames css modules (Rev only)
h(".bar.fuzz.stuff", ["bar fuzz"]);`
  },
  {
    code: `${hAndhxImports}
     // Should process children but ignore computed parent
h(\`calcualted \${stuff}\`, { amazing: "stuff" }, [
  h("h1"),
  h("h2"),
  h("h3"),
  h("div", [h("div")])
]);`
  }
];

pluginTester({
  pluginName: "hyperscript-to-jsx",
  plugin: hyperToJsxTransform,
  snapshot: true,
  formatResult: output =>
    prettier.format(output, {
      semi: true,
      singleQuote: true,
      parser: "babylon"
    }),
  tests: [
    ...tests,
    ...tests.map(test => ({
      ...test,
      title: `${test.title} Revolut`,
      pluginOptions: { revolut: true }
    }))
  ]
});

module.exports = {
  check
};
