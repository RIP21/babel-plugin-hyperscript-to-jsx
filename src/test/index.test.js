"use strict";

const check = require("../../manualRun.js").check;
const pluginTester = require("babel-plugin-tester");
const hyperToJsxTransform = require("../index.js");
const prettier = require("prettier");

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

pluginTester({
  pluginName: "hyperscript-to-jsx",
  plugin: hyperToJsxTransform,
  snapshot: true,
  formatResult: output =>
    prettier.format(output, { semi: true, singleQuote: true }),
  tests: [
    {
      title: "Fake all cases",
      code: check
    },
    { title: "Complex real", code: complexExample },
    { title: "Fake all case revolut", code: check, pluginOptions: { revolut: true } },
    { title: "Complex real revo", code: complexExample, pluginOptions: { revolut: true }  },
  ]
});
