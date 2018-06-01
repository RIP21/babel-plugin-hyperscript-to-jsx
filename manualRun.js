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
  
const MultiMemberExpressionWithClosingTag = () => h(Pricing.lol.kek, { className }, [ h('h1') ])

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

const result = babel.transform(`
import h from "stuff"
class OpenApiPage extends Component {
  static contextTypes = {
    intl: intlShape
  }

  render() {
    let { formatMessage } = this.context.intl

    return h('.OpenApiPage', [
      h(Helmet, {
        title: formatMessage(messages.metaTitle),
        meta: [
          { name: 'description',
            content: formatMessage(messages.metaDescription)
          }
        ]
      }),
      h('.firstSlide', [
        h('.heading', [
          h('.heading-wrap', [
            h(FormattedMessage, { ...messages.pageTitle }, (message) => h(Heading, { tag: 'h1' }, message)),
            h(FormattedMessage, { ...messages.pageSubtitle }, (message) => h('p', message)),
            h(Link, { mix: 'apiBtn', href: 'https://revolutdev.github.io/business-api/', linkType: 'global' }, [
              h(FormattedMessage, { ...messages.fullApiButton }, (message) => h(Button.PrimaryPink, message))
            ])
          ])
        ]),
        h('.video', [
          h('.mainImage', [
            h('img', {
              src: macbookImg,
            })
          ]),
        ])
      ]),
      h('.developersFirst', [
        h('.text', [
          h('.title', [
            h(FormattedMessage, { ...messages.developersTitle }, (message) => h(Heading, { weight: 'light', level: 2 }, message)),
            h(FormattedMessage, { tagName: 'p', ...messages.developersSubtitle }),
          ]),
          h('.snippet', [
            h('pre', [
              h('code', \`const REVOLUT_API = 'https://sandbox-b2b.revolut.com/api/1.0'\`),
              h('code', ' '),
              h('code', \`let pay42EurWithRevolut = (request_id, account_id, receiver) =>\`),
              h('code', \`  fetch(\\\`$\\{REVOLUT_API}/pay\\\`, {\`),
              h('code', \`    method: 'POST',\`),
              h('code', \`    headers: {\`),
              h('code', \`      'Content-Type': 'application/json',\`),
              h('code', \`      Authorization: \\\`Bearer $\\{REVOLUT_API_KEY}\\\`,\`),
              h('code', \`    },\`),
              h('code', \`    body: JSON.stringify({\`),
              h('code', \`      request_id,\`),
              h('code', \`      account_id,\`),
              h('code', \`      receiver,\`),
              h('code', \`      amount: 42.24,\`),
              h('code', \`      currency: 'EUR',\`),
              h('code', \`      description: 'Invoice payment test',\`),
              h('code', \`    })\`),
              h('code', \`  })\`)
            ]),
            h('ul', [
              h('li', [
                h(Icon, { type: 'counterparties', size: 's', mix: 'icon' }),
                h(FormattedMessage, { ...messages.developersList1 }, (message) => h('span', message)),
              ]),
              h('li', [
                h(Icon, { type: 'payment', size: 's', mix: 'icon' }),
                h(FormattedMessage, { ...messages.developersList2 }, (message) => h('span', message)),
              ]),
              h('li', [
                h(Icon, { type: 'sheduling', size: 's', mix: 'icon' }),
                h(FormattedMessage, { ...messages.developersList3 }, (message) => h('span', message)),
              ]),
              h('li', [
                h(Icon, { type: 'canceling', size: 's', mix: 'icon' }),
                h(FormattedMessage, { ...messages.developersList4 }, (message) => h('span', message)),
              ]),
              h('li', [
                h(Icon, { type: 'reports', size: 's', mix: 'icon' }),
                h(FormattedMessage, { ...messages.developersList5 }, (message) => h('span', message)),
              ])
            ])
          ]),
        ]),
      ]),
      h('.title.caseStudies', [
        h(FormattedMessage, { ...messages.sectionTitle }, (message) => h(Heading, { align: 'center' }, message)),
      ]),
      h('.phoneWrap', [
        h(StickyPhone, { videos: phones }),
        dropLast(1, phones).map((phone, key) => {
          return h(TextWithPhone, {
            heading: formatMessage(phone.heading),
            text: formatMessage(phone.text),
            screenSrc: phone.poster,
            key,
          })
        })
      ]),
      h(TextWithPhone, {
        heading: formatMessage(last(phones).heading),
        text: formatMessage(last(phones).text),
        screenSrc: last(phones).poster,
      }),
    ])
  }
}`, {
  plugins: [["./src/index.js"]]
}).code;

console.log(prettier.format(result, { semi: false, singleQuote: true }));
