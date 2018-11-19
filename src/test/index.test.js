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
    title: "Should handle ArrowFunctions shortcut return",
    code: `${hAndhxImports}
   const StatelessComponent = props => h("h1");`
  },
  {
    title: "Should handle ArrowFunctions with return",
    code: `${hAndhxImports}
     const StatelessWithReturn = props => {
  return h(".class");
};`
  },
  {
    title: "Should handle assignment (differs from VariableDeclaration)",
    code: `${hAndhxImports}
     const HandlesAssignment = ({ title }) => {
  title = h("span");
};`
  },
  {
    title: "Should handle h calls in the Array as a parent",
    code: `${hAndhxImports}
     handleArrays = [
  h(Sidebar, { categories }),
  h(CategoryQuestions, { ...question, isBusiness })
];`
  },

  {
    title: "Should handle single class name with dashes (Revolut only)",
    code: `${hAndhxImports}
   const ClassNameWithDashesSingle = props => h(".this-is-dashes");`
  },
  {
    title: "Should handle multiple class names with dashes (Revolut only)",
    code: `${hAndhxImports}
     const ClassNameWithDashesMulti = props => h(".this-is-dashes.dash-afterDash");`
  },
  {
    title: "Should transpile for object property field",
    code: `${hAndhxImports}
     const JustPropField = h(Stuff, {
  children: h(FormattedMessage, { ...commonMessages.learnMore })
});`
  },
  {
    title: "Should transpile for for regular function",
    code: `${hAndhxImports}
     function HyperscriptAsRegularFunction(props) {
  return h("h1");
}`
  },
  {
    title: "Should transpile for VariableDeclaration",
    code: `${hAndhxImports}
     const HyperscriptAsVariable = h("div.lol", {
  someProp: "lol"
});`
  },
  {
    title: "Should wrap nested expressions into {} also transpiling them down if posible",
    code: `${hAndhxImports}
     const HyperscriptWithExpressionAsChildren = h(
  AnotherComponent,
  { foo: "bar", bar: () => ({}), shouldRender: thing.length > 0 },
  [arr.map(() => h("h1"))]
);`
  },
  {
    title: "Should ignore transformation TemplateStrings to StringLiteral if computed expressions found",
    code: `${hAndhxImports}
     // Should be ignored from transforming
const FirstArgTemplateLiteralWithComputedExpressions = h(\`div.lol\${stuff}\`, {
  someProp: "lol"
});`
  },
  {
    title: "Should transform TemplateStrings to StringLiteral if no computed expressions found",
    code: `${hAndhxImports}
const FirstArgTemplateLiteral = h(\`div.lol\`, {
  someProp: "lol"
});`
  },
  {
    title: "Should ignore when first argument is called function",
    code: `${hAndhxImports}
const WhenFirstArgumentIsFunctionThatIsCalled = () =>
  h(getLoadableAnimation("pageCareersDeliver"), [h(fn())]);`
  },
  {
    title:
      "Should ignore computed root call, but transpile nested calls, handle third array argument of different types in proper way",
    code: `${hAndhxImports}
 const ComputedRootWithObjectPropertyDeclaration = () =>
  h(
    ANIMATIONS[country],
    {
      className: "lol",
      content: h(".selectItem", [
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
    // This first children in array will be ignored
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
    title: "Computed class name BinaryExpression",
    code: `${hAndhxImports}
   h("div" + "div");`
  },
  {
    title: "Ignore third argument when it's not array",
    code: `${hAndhxImports}
     const ThirdArgOnIgnoredIsNotArray = () =>
  h(
    ANIMATIONS[country],
    {
      className: "lol"
    },
    children
  );`
  },
  {
    title: "Ignore second argument when it's not array",
    code: `${hAndhxImports}
     const SecondArgOnIgnoredIsNotArray = () => h(ANIMATIONS[country], children);`
  },
  {
    title: "One level deep member expression self closing",
    code: `${hAndhxImports}
     const MultiMemberExpressionWithClosingTag = () =>
  h(Pricing.lol, { className });`
  },
  {
    title: "One level deep member expression with closing tag",
    code: `${hAndhxImports}
     const MultiMemberExpressionWithClosingTag = () =>
  h(Pricing.lol, { className }, [h("h1")]);`
  },
  {
    title: "Deep member expression with closing tag",
    code: `${hAndhxImports}
     const MultiMemberExpressionWithClosingTag = () =>
  h(Pricing.lol.kek, { className }, [h("h1")]);`
  },
  {
    title: "Deep member expression self closing",
    code: `${hAndhxImports}
     const MultiMemberExpressionWithClosingTag = () =>
  h(Pricing.lol.kek, { className });`
  },
  {
    title: "Should ignore transformation when ConditionalExpression is a first parameter",
    code: `${hAndhxImports}
     h(isCanada ? doStuff : doAnotherStuff, { someProp: true })
     h('div', isCanada ? someProps : anotherProps)
     h('div', isCanada ? someProps : anotherProps, "SomeChildren")
     `
  },
  {
    title:
      'handle h(Abc, { [kek]: 0, ["norm"]: 1 }) to < Abc {...{ [kek]: 0 }} {...{ ["norm" + lol]: 1 }} norm={1} />',
    code: `${hAndhxImports}
const ComplexComputedAttibutesHandling = () =>
  h(Abc, { [kek]: 0, ["norm" + lol]: 1, ["ok"]: 2 });`
  },
  {
    title: "Handle multi classNames css modules (Rev only)",
    code: `${hAndhxImports}
h(".bar.fuzz.stuff", ["bar fuzz"]);`
  },
  {
    title: "Should process children but ignore computed parent",
    code: `${hAndhxImports}
h(\`calcualted \${stuff}\`, { amazing: "stuff" }, [
  h("h1"),
  h("h2"),
  h("h3"),
  h("div", [h("div")])
]);`
  },
  {
    title: "Should handle shouldRender in root call (Revolut only)",
    code: `${hAndhxImports}
  h('div', { shouldRender: true })`
  },
  {
    title: "Should handle shouldRender in nested call (Revolut only)",
    code: `${hAndhxImports}
  h('div', [h('div', { shouldRender: true })]);
  h('div', { className }, [h('div', { shouldRender: true })]);
  `
  },
  {
    title: "Should handle shouldRender when root call is ignored (Revolut only)",
    code: `${hAndhxImports}
  h('div' + 'div', [h('div', { shouldRender: true })]);
  h('div' + 'div', { className }, [h('div', { shouldRender: true }), h('div')]);
  `
  },
  {
    title: "Should handle shouldRender when object property call is ignored (Revolut only)",
    code: `${hAndhxImports}
  h('div' + 'div', [h('div', { shouldRender: true })]);
  h('div' + 'div', { className, field: h('div', { shouldRender: true }) });
  `
  },
  {
    title: "Should handle shouldRender when JSXAttribute property call is ignored (Revolut only)",
    code: `${hAndhxImports}
  <div attr={h('div', { shouldRender: true })} />;
  h('div' + 'div', { className, field: h('div', { shouldRender: true }) });
  `
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
