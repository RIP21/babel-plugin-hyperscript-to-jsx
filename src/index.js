"use strict";

const t = require("babel-core").types;
const getTagAndClassNamesAndId = require("./utils").getTagAndClassNamesAndId;
const revTransform = require("./rev");
const getOption = require("./utils").getOption;
let isHyperscriptInScope = false;
// utility functions that starts with b means build.

const isHyperscriptCall = node => {
  return t.isIdentifier(node.callee, {
    name: "h"
  });
};

const bJsxAttr = (prop, expressionOrValue) => {
  const attributeName = t.isStringLiteral(prop)
    ? prop.extra.rawValue
    : prop.name;
  const stringOrExpression = t.isStringLiteral(expressionOrValue)
    ? expressionOrValue
    : t.JSXExpressionContainer(expressionOrValue);
  return t.JSXAttribute(bJsxIdent(attributeName), stringOrExpression);
};

const bJsxAttributes = objectExpression => {
  return objectExpression.properties.map(node => {
    const { key, value, argument } = node;
    if (t.isSpreadProperty(node) || t.isSpreadElement(node)) {
      return t.JSXSpreadAttribute(argument);
    } else if (t.isProperty(node) && node.computed && !t.isStringLiteral(key)) {
      // to handle h(Abc, { [kek]: 0, ["norm"]: 1 }) to <Abc {...{ [kek]: 0 }} norm={1} />
      return t.JSXSpreadAttribute(t.objectExpression([node]));
    } else {
      return bJsxAttr(key, value);
    }
  });
};

const bJsxOpenElem = ({ name, selfClosing = false, attributes = [] }) =>
  t.JSXOpeningElement(
    t.isJSXMemberExpression(name) ? name : bJsxIdent(name),
    attributes,
    selfClosing
  );

const bJsxIdent = name => t.JSXIdentifier(name);

const bJsxCloseElem = name =>
  t.isJSXMemberExpression(name)
    ? t.JSXClosingElement(name)
    : t.JSXClosingElement(bJsxIdent(name));

// Builds self closed element
const bJsxElem = ({
  name = "div",
  attributes = [],
  children = [],
  selfClosing = false
}) =>
  t.JSXElement(
    bJsxOpenElem({ attributes, name, selfClosing }),
    selfClosing ? null : bJsxCloseElem(name),
    children,
    selfClosing
  );

// Makes component wrap around his children, so closes it around strings/JSXElements/expressions.
const closeComponent = (jsxElem, children) => {
  const { name } = jsxElem.openingElement;
  jsxElem.selfClosing = false;
  jsxElem.openingElement.selfClosing = false;
  jsxElem.closingElement = bJsxCloseElem(
    t.isJSXMemberExpression(name) ? name : name.name
  );
  jsxElem.children = children;
  return jsxElem;
};

const injectChildren = (jsxElem, node) => {
  if (t.isArrayExpression(node)) {
    return closeComponent(jsxElem, transformChildrenArray(node));
  }
  if (t.isStringLiteral(node)) {
    return closeComponent(jsxElem, [t.JSXText(node.value)]);
  }
  if (t.isExpression(node)) {
    return closeComponent(jsxElem, [t.JSXExpressionContainer(node)]);
  }
};

const transformChildrenArray = (node, noExpressionContainers) => {
  return node.elements.map(element => {
    // Ugliest hack I ever wrote, but this is to avoid putting computed hyperscript calls into the JSXExpressionContainer for ignored computed root h calls
    if (
      ((t.isJSXElement(element) ||
        t.isLogicalExpression(element) ||
        t.isConditionalExpression(element) ||
        t.isMemberExpression(element) ||
        t.isIdentifier(element)) &&
        noExpressionContainers) ||
      (isHyperscriptCall(element) &&
        noExpressionContainers &&
        element.arguments &&
        element.arguments[0] &&
        (element.arguments[0].computed ||
          (t.isTemplateLiteral(element.arguments[0]) &&
            element.arguments[0].expressions.length > 0) ||
          (element.arguments[0].arguments &&
            element.arguments[0].arguments.length >= 0)))
    ) {
      return element;
    }
    if (isHyperscriptCall(element)) {
      return transformHyperscriptToJsx(element, false);
    }
    if (t.isStringLiteral(element)) {
      return t.JSXText(element.value);
    }
    if (t.isExpression(element)) {
      return t.JSXExpressionContainer(element);
    }
  });
};

const transformHyperscriptToJsx = (node, isTopLevelCall) => {
  const [firstArg, secondArg, thirdArg] = node.arguments;
  // Handling few corner cases down here

  // Handling of h(obj[field]) and h(`stuff ${computed}`) to ignore and convert to StringLiteral if possible
  const isTemplateLiteral = t.isTemplateLiteral(firstArg);
  const hasExpressions = isTemplateLiteral && firstArg.expressions.length;
  const isComputedClassNameOrComponent =
    firstArg.computed || hasExpressions || t.isBinaryExpression(firstArg);
  // Intermediate value to convert to StringLiteral if TemplateLiteral has no expressions
  let firstArgument;
  if (isTemplateLiteral && !hasExpressions) {
    firstArgument = t.stringLiteral(firstArg.quasis[0].value.raw);
  } else {
    firstArgument = firstArg;
  }
  const isFirstArgIsCalledFunction =
    firstArg.arguments && firstArg.arguments.length >= 0;
  if (
    (isComputedClassNameOrComponent || isFirstArgIsCalledFunction) &&
    isTopLevelCall
  ) {
    // If top level call just keep node as is
    if (t.isArrayExpression(secondArg) && !thirdArg) {
      secondArg.elements = transformChildrenArray(secondArg, true);
    }
    if (t.isArrayExpression(thirdArg)) {
      // This will recursively process all children nodes to get JSX/Expressions array
      // Second parameter is for ugly hack :P
      thirdArg.elements = transformChildrenArray(thirdArg, true);
    }
    return node;
  } else if (isComputedClassNameOrComponent || isFirstArgIsCalledFunction) {
    // If nested in JSX wrap in expression container
    return t.JSXExpressionContainer(node);
  }

  switch (node.arguments.length) {
    case 1:
      return singleArgumentCase(firstArgument);
    case 2:
      return twoArgumentsCase(firstArgument, secondArg, true);
    case 3:
      return threeArgumentsCase(firstArgument, secondArg, thirdArg);
    default:
      break;
  }
};

const memberExpressionToJsx = memberExpression => {
  const object = t.isMemberExpression(memberExpression.object)
    ? memberExpressionToJsx(memberExpression.object)
    : bJsxIdent(memberExpression.object.name);
  const property = bJsxIdent(memberExpression.property.name);
  return t.jSXMemberExpression(object, property);
};

const singleArgumentCase = firstArgument => {
  const isElement = t.isStringLiteral(firstArgument);
  const isReactComponent = t.isIdentifier(firstArgument);
  const isMemberExpression = t.isMemberExpression(firstArgument);
  let attributes = [];
  if (isElement) {
    const { id, className, tag } = getTagAndClassNamesAndId(
      firstArgument.value
    );
    className &&
      attributes.push(
        bJsxAttr(t.JSXIdentifier("className"), t.StringLiteral(className))
      );
    id && attributes.push(bJsxAttr(t.JSXIdentifier("id"), t.StringLiteral(id)));
    return bJsxElem({
      selfClosing: true,
      name: tag,
      attributes
    });
  } else if (isReactComponent || isMemberExpression) {
    const componentName = isMemberExpression
      ? memberExpressionToJsx(firstArgument)
      : firstArgument.name;
    return bJsxElem({
      selfClosing: true,
      name: componentName
    });
  }
};

const twoArgumentsCase = (firstArg, secondArg, thirdArgIsAbsent) => {
  const jsxElem = singleArgumentCase(firstArg);
  const isPropsObject = t.isObjectExpression(secondArg);
  if (isPropsObject) {
    const props = bJsxAttributes(secondArg);
    const currentProps = jsxElem.openingElement.attributes;
    jsxElem.openingElement.attributes = [...currentProps, ...props];
    return jsxElem;
  }
  if (thirdArgIsAbsent) {
    return injectChildren(jsxElem, secondArg);
  } else {
    jsxElem.openingElement.attributes.push(t.JSXSpreadAttribute(secondArg));
    return jsxElem;
  }
};

const threeArgumentsCase = (firstArg, secondArg, thirdArg) => {
  const jsxElem = twoArgumentsCase(firstArg, secondArg, false);
  return injectChildren(jsxElem, thirdArg);
};

let isCssModules = false;
module.exports = function() {
  return {
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("asyncGenerators");
      parserOpts.plugins.push("classProperties");
      parserOpts.plugins.push("decorators");
      parserOpts.plugins.push("doExpressions");
      parserOpts.plugins.push("dynamicImport");
      parserOpts.plugins.push("flow");
      parserOpts.plugins.push("functionBind");
      parserOpts.plugins.push("functionSent");
      parserOpts.plugins.push("jsx");
      parserOpts.plugins.push("objectRestSpread");
      parserOpts.plugins.push("exportDefaultFrom");
      parserOpts.plugins.push("exportNamespaceFrom");
    },
    visitor: {
      Program(path) {
        isHyperscriptInScope = path.node.body.find(arg => {
          if (t.isVariableDeclaration(arg)) {
            return (
              arg.declarations.find(
                declaration => declaration.id.name === "h"
              ) || false
            );
          }
          if (t.isImportDeclaration(arg)) {
            return (
              arg.specifiers.find(specifier => specifier.local.name === "h") ||
              false
            );
          }
        });
        const isReactIsInScope = path.node.body.find(arg => {
          if (t.isVariableDeclaration(arg)) {
            return (
              arg.declarations.find(
                declaration => declaration.id.name === "Reat"
              ) || false
            );
          }
          if (t.isImportDeclaration(arg)) {
            return (
              arg.specifiers.find(
                specifier => specifier.local.name === "React"
              ) || false
            );
          }
        });
        // This is Revolut specific logic ignore it :)
        isCssModules = path.node.body.find(arg => {
          if (t.isVariableDeclaration(arg)) {
            return (
              arg.declarations.find(
                declaration => declaration.id.name === "hx"
              ) || false
            );
          }
          if (t.isImportDeclaration(arg)) {
            return (
              arg.specifiers.find(specifier => specifier.local.name === "hx") ||
              false
            );
          }
        });
        if (isHyperscriptInScope && !isReactIsInScope) {
          path.node.body.unshift(
            t.ImportDeclaration(
              [t.ImportDefaultSpecifier(t.Identifier("React"))],
              t.StringLiteral("react")
            )
          );
        }
      },
      CallExpression(path, state) {
        if (isHyperscriptInScope) {
          const { node } = path;
          const isTopLevelCall =
            t.isReturnStatement(path.container) ||
            t.isConditionalExpression(path.container) ||
            t.isArrowFunctionExpression(path.container) ||
            t.isLogicalExpression(path.container) ||
            t.isObjectProperty(path.container) ||
            t.isVariableDeclarator(path.container) ||
            t.isExpressionStatement(path.container);
          if (isHyperscriptCall(node) && isTopLevelCall) {
            let result = node;
            const isRevolut = getOption(state, "revolut", false);
            result = isRevolut
              ? revTransform(node, isTopLevelCall, !!isCssModules)
              : transformHyperscriptToJsx(node, isTopLevelCall);
            path.replaceWith(result);
          }
        }
      }
    }
  };
};
