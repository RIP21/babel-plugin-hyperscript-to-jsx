# babel-plugin-hyperscript-to-jsx (codmod usage)
[![npm version](https://badge.fury.io/js/babel-plugin-hyperscript-to-jsx.svg)](https://badge.fury.io/js/babel-plugin-hyperscript-to-jsx)

It's a quite complex codemod to migrate from hyperscript to JSX.

Before:

```javascript
import h from "react-hyperscript";

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
const FirstArgTemplateLiteralWithComputedExpressions = h(`div.lol${stuff}`, {
  someProp: "lol"
});

// Not computed so should be fine
const FirstArgTemplateLiteral = h(`div.lol`, {
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
    [h(ANIMATIONS[country], { className: "lol" }), h("h1"), kek && mem, surreal ? lol : kek, t.tabName, lol, <div/>]
  );

const ThirdArgOnIgnoredIsNotArray = () =>
  h(
    ANIMATIONS[country],
    {
      className: "lol",
    },
    // This first children in array will be ignored FOR THIS UGLY HACK IN INDEX
    children
  );

const SecondArgOnIgnoredIsNotArray = () =>
  h(ANIMATIONS[country], children);

const MultiMemberExpressionWithClosingTag = () => h(Pricing.lol.kek, { className }, [ h('h1') ])

// to handle h(Abc, { [kek]: 0, ["norm"]: 1 }) to < Abc {...{ [kek]: 0 }} {...{ ["norm" + lol]: 1 }} norm={1} />
const ComplexComputedAttibutesHandling = () => h(Abc, { [kek]: 0, ["norm" + lol]: 1, ["ok"]: 2 })

// Should process children but ignore computed parent
h(`calcualted ${stuff}`, { amazing: "stuff" }, [
  h("h1"),
  h("h2"),
  h("h3"),
  h("div", [ h("div") ])
])

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
}
```

After:

```jsx harmony
import React from 'react'
import h from 'react-hyperscript'

import hx from 'shit'

const StatelessComponent = props => <h1 />

const StatelessWithReturn = props => {
  return <div className="class" />
}

function HyperscriptAsRegularFunction(props) {
  return <h1 />
}

const HyperscriptAsVariable = <div className="lol" someProp="lol" />

const HyperscriptWithExpressionAsChildren = (
  <AnotherComponent foo="bar" bar={() => ({})} shouldRender={thing.length > 0}>
    {arr.map(() => <h1 />)}
  </AnotherComponent>
)

// Should be ignored from transforming
const FirstArgTemplateLiteralWithComputedExpressions = h(`div.lol${stuff}`, {
  someProp: 'lol'
})

// Not computed so should be fine
const FirstArgTemplateLiteral = <div className="lol" someProp="lol" />

// Should be ignored
const WhenFirstArgumentIsFunctionThatIsCalled = () =>
  h(getLoadableAnimation('pageCareersDeliver'), [h(fn())])

const ComputedRootWithObjectPropertyDeclaration = () =>
  h(
    ANIMATIONS[country],
    {
      className: 'lol',
      content: (
        <div className="selectItem">
          <div>{label}</div>
          <div className="flag">
            <RoundFlag mix="flag" size="xs" code={currencyData.countryCode} />
            {// Computed not root should be wrapped in {}
            h(ANIMATIONS[country], { className: 'lol' })}
          </div>
        </div>
      )
    },
    [
      h(ANIMATIONS[country], { className: 'lol' }),
      <h1 />,
      kek && mem,
      surreal ? lol : kek,
      t.tabName,
      lol,
      <div />
    ]
  )

const ThirdArgOnIgnoredIsNotArray = () =>
  h(
    ANIMATIONS[country],
    {
      className: 'lol'
    },
    // This first children in array will be ignored FOR THIS UGLY HACK IN INDEX
    children
  )

const SecondArgOnIgnoredIsNotArray = () => h(ANIMATIONS[country], children)

const MultiMemberExpressionWithClosingTag = () => (
  <Pricing.lol.kek className={className}>
    <h1 />
  </Pricing.lol.kek>
)

// to handle h(Abc, { [kek]: 0, ["norm"]: 1 }) to < Abc {...{ [kek]: 0 }} {...{ ["norm" + lol]: 1 }} norm={1} />
const ComplexComputedAttibutesHandling = () => (
  <Abc {...{ [kek]: 0 }} {...{ ['norm' + lol]: 1 }} ok={2} />
)

// Should process children but ignore computed parent
h(`calcualted ${stuff}`, { amazing: 'stuff' }, [
  <h1 />,
  <h2 />,
  <h3 />,
  <div>
    <div />
  </div>
])

class Comp extends React.Component {
  render() {
    return (
      <div className="example">
        {isStuff && <h1 id="heading" {...getProps} {...getKnobs()} stuff="" />}
        {isStuff ? (
          <h1 id="heading" {...getProps} {...getKnobs()} stuff="" />
        ) : (
          <h1 id="heading">heading</h1>
        )}
        <h1 id="heading" {...getProps} {...getKnobs()} stuff="" />
        <h1 id="heading">{getChildren}</h1>
        {h(ANIMATIONS[country], {
          className: 'lol'
        })}
        <h1 id="heading" {...getChildren()}>
          <div />
        </h1>
        <div>
          <div>Some content</div>
        </div>
        <h1 id="heading">This is hyperscript</h1>
        <h2>creating React.js markup</h2>
        <AnotherComponent
          foo="bar"
          bar={() => ({})}
          shouldRender={thing.length > 0}
        >
          <li>
            <a href="http://whatever.com">One list item</a>
          </li>
          <li>Another list item</li>
        </AnotherComponent>
      </div>
    )
  }
}

```

## Usage

Install [babel-codemod](https://github.com/square/babel-codemod) `npm i -g babel-codemod`

Then install in root of your project `npm install babel-plugin-hyperscript-to-jsx`

Run it like that from node_modules hence:
```
codemod --plugin ./node_modules/babel-plugin-hyperscript-to-jsx/src/index.js ./src
```

Also you may like to pretty print it using prettier instead of recast
```
codemod --plugin ./node_modules/babel-plugin-hyperscript-to-jsx/src/index.js ./src --printer prettier
```

Remove `babel-plugin-hyperscript-to-jsx` from `package.json`

If there is any issues, let me know in the issues tab here at GitHub.

## Limitations

1) When `h` is called this way

```javascript
h("FirstThing", this.getSomePropsOrChildren());
```

Second argument will be a children (to break everything), cause to get whether second argument expression is returning children or props of object is almost impossible.

2) All computed first arguments to `h` like `h(STUFF[computed])` or `h(`.stuff ${anotherClass}`)`
is impossible to codemod, so they will be ignored, and you will need to fix it yourself, they will be kept
as is, but their array second and third arguments will be processed with the same approach.


Fix all that by yourself :)

(it's possible but will require further analysis of AST with hardcore traversal and I don't think it worth it)

## Integration with WebStorm/VS Code to do file by file
Preconditions:
```
npm i -g babel-core babel-codemod babel-plugin-hyperscript-to-jsx
```

### WebStorm:
1. Go to Preferences -> External Tools -> Click plus to add tool.
2. Config:
```
Name: h to JSX
Program: codemod
Arguments: -p /usr/local/lib/node_modules/babel-plugin-hyperscript-to-jsx/src/index.js$FilePathRelativeToProjectRoot$
Working directory: $ProjectFileDir$

In advanced settings:
Tick on: Sync file after execution
```

3. Open file you want to transform
`Right Click -> External Tools -> h to JSX -> Apply prettier/code formatting -> Enjoy`
4. For even better experience go to.
`Preferences -> Keymap -> External Tools -> External Tools -> h to JSX -> Attach some key combination`

### VS Code:
1. Open command pallete
2. `>Tasks: Configure Task`
3. Press Up -> Select: `Task from tasks.json template` (or something like that)
4. Copy and paste this:
```
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "H to JSX",
            "type": "shell",
            "command": "codemod -p /usr/local/lib/node_modules/babel-plugin-hyperscript-to-jsx/src/index.js ${file}"
        }
    ]
}
```
5. Open command pallete and ask it to open `keybindings.json`
6. Add this:
```
    {
        "key": "cmd+e",
        "command": "workbench.action.tasks.runTask",
        "args": "H to JSX"
    }
```
7. Open any file and press cmd+e to apply codemod on file.
8. Or if you don't want to bloat your `keybindings.json` just open Command pallete and type.
`Run task -> Enter -> Find in the list "H to JSX" -> Enter` (Usually will be on top)
9. Apply formatting and enjoy


#### For Revolut plugin to work.
##### Webstorm:
 - Add to command line arguments `-o index={\"revolut\":true}` before the `$FilePathRelativeToProjectRoot$`
##### VS Code:
 - Add to command line arguments `-o index='{\"revolut\":true}'` before the `${file}`
