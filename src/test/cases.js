
const check = `import h from "react-hyperscript"
import { Component, PropTypes } from 'react'
import hx from "shit"

const StatelessComponent = props => h("h1");

const StatelessWithReturn = props => {
  return h(".class")
};

const HandlesAssignment = ({ title }) => {
  title = h('span')
}

handleArrays = [h(Sidebar, { categories }), h(CategoryQuestions, { ...question, isBusiness })]

const ClassNameWithDashesSingle = props => h('.this-is-dashes')
const ClassNameWithDashesMulti = props => h('.this-is-dashes.dash-afterDash')
const JustPropField = h(Stuff, { children: h(FormattedMessage, { ...commonMessages.learnMore }) })

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
    // This first children in array will be ignored FOR THIS UGLY HACK IN INDEX
    [h(ANIMATIONS[country], { className: "lol" }), h("h1"), kek && mem, surreal ? lol : kek, t.tabName, lol, <div/>]
  );
  
h('div' + 'div')

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

// Handle multi classNames css modules (Rev only)
h(".bar.fuzz.stuff", ["bar fuzz"])

// Should process children but ignore computed parent
h(\`calcualted \${stuff}\`, { amazing: "stuff" }, [
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
`;

const complexExample = `import h from "react-hyperscript";

const StatelessComponent = props => h("h1");

let dropdownCurrencies = currencyCodes.map((c) => {
  let currencyData = getCurrency(c)
  let label = isMobile() ? currencyData.id : \`\${currencyData.id} – \${
  currencyData.title
}\`
  return {
    key: c,
    content: h('.selectItem', [
      h('div', label),
      h('.flag', [
        h(RoundFlag, { mix: 'flag', size: 'xs', code: currencyData.countryCode })
      ])
    ])
  }
})

const StatelessWithReturn = props => {
  return h(".class", { shouldRender: lol.length > 0 });
};

function named(props) {
  return h("h1");
}

class Comp extends React.Component {
  render() {
    return h(".categories", [
      categories.map(({ key, title, children, url: categoryURL }) =>
        h(".category", { key }, [
          sectionsImages[key] &&
            h(sectionsImages[key], { className: styles.animation }),
          h(Heading, { level: 2, tag: "h2", spacing: "half" }, title),
          h("ul", [
            children.map((item, index, arr) => {
              const { url, title } = item;
              if (index > 3) {
                return null;
              }
              if (index === 3 && arr.length > 4) {
                return h("li.viewMore", { key: item.key }, [
                  h(FormattedMessage, { ...messages.viewMore }, message =>
                    h(HelpLink, {
                      url: enhanceUrlEmbedded(categoryURL),
                      title: message,
                      scrollToTop: true
                    })
                  )
                ]);
              }
              return h("li", { key: item.key }, [
                h(HelpLink, { url: enhanceUrlEmbedded(url), title })
              ]);
            })
          ])
        ])
      ),
      h(".helpFeatures", [
        h(".feature", [
          h(Link, { href: "https://community.revolut.com" }, [
            h("img", { src: communityIMG }),
            h(".text", [
              h(FormattedMessage, { ...messages.communityTitle }, message =>
                h(Heading, { level: 6, tag: "h4", spacing: "half" }, message)
              ),
              h(FormattedMessage, { ...messages.communitySubtitle })
            ])
          ])
        ]),
        h(".feature", [
          h(Link, { href: "https://blog.revolut.com" }, [
            h("img", { src: blogIMG }),
            h(".text", [
              h(FormattedMessage, { ...messages.blogTitle }, message =>
                h(Heading, { level: 6, tag: "h4", spacing: "half" }, message)
              ),
              h(FormattedMessage, { ...messages.blogSubtitle })
            ])
          ])
        ]),
        isBusiness && h(".feature", [
              h(
                Link,
                {
                  href: isEmbeddedBusiness()
                    ? "https://www.revolut.com/business/openapi"
                    : "/business/openapi"
                },
                [
                  h("img", { src: apiIMG }),
                  h(".text", [
                    h(FormattedMessage, { ...messages.apiTitle }, message =>
                      h(
                        Heading,
                        { level: 6, tag: "h4", spacing: "half" },
                        message
                      )
                    ),
                    h(FormattedMessage, { ...messages.apiSubtitle })
                  ])
                ]
              )
            ])
        ,
        isBusiness
          ? h(".feature", [
              h(
                Link,
                {
                  href: isEmbeddedBusiness()
                    ? "https://www.revolut.com/business/openapi"
                    : "/business/openapi"
                },
                [
                  h("img", { src: apiIMG }),
                  h(".text", [
                    h(FormattedMessage, { ...messages.apiTitle }, message =>
                      h(
                        Heading,
                        { level: 6, tag: "h4", spacing: "half" },
                        message
                      )
                    ),
                    h(FormattedMessage, { ...messages.apiSubtitle })
                  ])
                ]
              )
            ])
          : h(".feature", [
              h("img", { src: chatIMG }),
              h(".text", [
                h(FormattedMessage, { ...messages.chatTitle }, message =>
                  h(Heading, { level: 6, tag: "h4", spacing: "half" }, message)
                ),
                h(FormattedMessage, { ...messages.chatSubtitle })
              ])
            ])
      ])
    ]);
  }
}

const stuff = {
  fn() {
    <div>{label}</div>
    h('div', label)
    return <div>{label}</div>
  }
}`;

module.exports = {
  check,
  complexExample
}
