"use strict";

const t = require("babel-core").types;
const getTagAndClassNamesAndId = require("./utils").getTagAndClassNamesAndId;

// utility functions that starts with b means build.

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
    selfClosing ? bJsxCloseElem(name) : null,
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
    if (t.isCallExpression(element)) {
      return transformHyperscriptToJsx(element);
    }
    if (t.isStringLiteral(element)) {
      return t.JSXText(element.value);
    }
    if (t.isExpression(element)) {
      return t.JSXExpressionContainer(element);
    }
  });
};

const transformHyperscriptToJsx = node => {
  const [firstArg, secondArg, thirdArg] = node.arguments;
  switch (node.arguments.length) {
    case 1:
      return singleArgumentCase(firstArg);
    case 2:
      return twoArgumentsCase(firstArg, secondArg, true);
    case 3:
      return threeArgumentsCase(firstArg, secondArg, thirdArg);
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

module.exports = function uglyRevTransform(node) {
  let result;
  result = transformHyperscriptToJsx(node);
  if (t.isJSXExpressionContainer(result)) {
    result = result.expression;
  }
  return result;
};
