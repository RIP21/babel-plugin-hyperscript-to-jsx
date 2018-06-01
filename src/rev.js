"use strict";

const t = require("babel-core").types;
const getTagAndClassNamesAndId = require("./utils").getTagAndClassNamesAndId;

// utility functions that starts with b means build.

const isHyperscriptCall = (node) => t.isIdentifier(node.callee, {
  name: "h"
});

const bJsxAttr = (prop, expressionOrValue) => {
  const stringOrExpression = t.isStringLiteral(expressionOrValue)
    ? expressionOrValue
    : t.JSXExpressionContainer(expressionOrValue);
  return t.JSXAttribute(bJsxIdent(prop.name), stringOrExpression);
};

const bJsxAttributes = objectExpression => {
  return objectExpression.properties.map(node => {
    const { key, value, argument } = node;
    if (t.isSpreadProperty(node) || t.isSpreadElement(node)) {
      return t.JSXSpreadAttribute(argument);
    } else {
      return bJsxAttr(key, value);
    }
  });
};

const bJsxOpenElem = ({ name, selfClosing = false, attributes = [] }) =>
  t.JSXOpeningElement(bJsxIdent(name), attributes, selfClosing);

const bJsxIdent = name => t.JSXIdentifier(name);

const bJsxCloseElem = name => t.JSXClosingElement(bJsxIdent(name));

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
  jsxElem.selfClosing = false;
  jsxElem.openingElement.selfClosing = false;
  jsxElem.closingElement = bJsxCloseElem(jsxElem.openingElement.name.name);
  jsxElem.children = children;
  return jsxElem;
};

const injectChildren = (jsxElem, node) => {
  let result;
  if (t.isArrayExpression(node)) {
    result = transformChildrenArray(jsxElem, node);
  }
  if (t.isStringLiteral(node)) {
    result = [t.JSXText(node.value)];
  }
  if (t.isExpression(node) && !result) {
    result = [t.JSXExpressionContainer(node)];
  }
  if (t.isJSXExpressionContainer(jsxElem)) {
    closeComponent(jsxElem.expression.right, result);
    return jsxElem;
  } else {
    return closeComponent(jsxElem, result);
  }
};

const transformChildrenArray = (jsxElem, node) => {
  return node.elements.map(element => {
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
  const isTemplateLiteral = t.isTemplateLiteral(firstArg)
  const hasExpressions = isTemplateLiteral && firstArg.expressions.length
  const isComputedClassNameOrComponent = firstArg.computed || hasExpressions;
  // Intermediate value to convert to StringLiteral if TemplateLiteral has no expressions
  let firstArgument
  if (isTemplateLiteral && !hasExpressions) {
    firstArgument = t.stringLiteral(firstArg.quasis[0].value.raw)
  } else {
    firstArgument = firstArg
  }

  if (isComputedClassNameOrComponent && isTopLevelCall) { // If top level call just keep node as is
    return node;
  } else if (isComputedClassNameOrComponent) { // If nested in JSX wrap in expression container
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

const singleArgumentCase = firstArgument => {
  const isElement = t.isStringLiteral(firstArgument);
  const isReactComponent = t.isIdentifier(firstArgument);
  let tagOrComponent = "";
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
  } else if (isReactComponent) {
    tagOrComponent = firstArgument.name;
    return bJsxElem({
      selfClosing: true,
      name: tagOrComponent
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
    const isShouldBePrepended = props.find(
      prop => prop.name && prop.name.name === "shouldRender"
    );
    if (isShouldBePrepended) {
      const shouldRenderExpression = props.find(
        prop => prop.name.name === "shouldRender"
      ).value.expression;
      const logicalExpression = t.LogicalExpression(
        "&&",
        shouldRenderExpression,
        jsxElem
      );
      const jsxExprContainer = t.JSXExpressionContainer(logicalExpression);
      return jsxExprContainer;
    }
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

module.exports = function uglyRevTransform(node, isTopLevelCall) {
  let result;
  result = transformHyperscriptToJsx(node, isTopLevelCall);
  if (t.isJSXExpressionContainer(result)) {
    result = result.expression;
  }
  return result;
};
