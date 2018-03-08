# babel-plugin-hyperscript-to-jsx (codmod usage)

It's a quite complex codemod to migrate from hyperscript to JSX.

Before:
```javascript
import h from 'react-hyperscript'

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
```

After:
```jsx harmony
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
May require to use `transform-object-rest-spread` plugin along the way.

## Limitations
The only limitation is when `h` is called this way
```javascript
h('FirstThing', this.getSomePropsOrChildren())
```
Second argument will be a children (to break everything), cause to get whether second argument expression is returning children or props object is almost impossible.
Fix that by yourself :)

(it's possible but will require further analysis of AST with hardcore traversal and I don't think  it worth it)
