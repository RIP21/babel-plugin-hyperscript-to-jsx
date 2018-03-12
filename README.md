# babel-plugin-hyperscript-to-jsx (codmod usage)
[![npm version](https://badge.fury.io/js/babel-plugin-hyperscript-to-jsx.svg)](https://badge.fury.io/js/babel-plugin-hyperscript-to-jsx)

It's a quite complex codemod to migrate from hyperscript to JSX.

Before:

```javascript
import h from "react-hyperscript";

const StatelessComponent = props => h("h1");

const StatelessWithReturn = props => {
  return h(".class");
};

function named(props) {
  return h("h1");
}

class Comp extends React.Component {
  render() {
    return h("div.example", [
      h("h1#heading", { ...getProps, ...getKnobs(), stuff: "" }),
      h("h1#heading", getChildren(), [h("div")]),
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
```

After:

```jsx harmony
import React from 'react'
import h from 'react-hyperscript'

const StatelessComponent = props => <h1 />

const StatelessWithReturn = props => {
  return <div className="class" />
}

function named(props) {
  return <h1 />
}

class Comp extends React.Component {
  render() {
    return (
      <div className="example">
        <h1 id="heading" {...getProps} {...getKnobs()} stuff="" />
        <h1 id="heading" {...getChildren()}>
          <div />
        </h1>
        <div>
          <div>Some content</div>
        </div>
        <h1 id="heading">This is hyperscript</h1>
        <h2>creating React.js markup</h2>
        <AnotherComponent foo="bar" bar={() => ({})}>
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

I will write usage later. But go to [babel-codmod](https://github.com/square/babel-codemod) for usage.

Something like that probably will work:

`codemod --plugin hyperscript-to-jsx ./src` or directly from `./node_modules/babel-plugin-hyperscript-to-jsx/src/index.js`

If there will be any issues, follow the error prompts, more likely it will ask you to add some plugins like rest-spread etc. to your .babelrc
This plugin support them, but doesn't depend on them, so make sure to solve this puzzle by yourself.

## Limitations

The only limitation is when `h` is called this way

```javascript
h("FirstThing", this.getSomePropsOrChildren());
```

Second argument will be a children (to break everything), cause to get whether second argument expression is returning children or props object is almost impossible.
Fix that by yourself :)

(it's possible but will require further analysis of AST with hardcore traversal and I don't think it worth it)
