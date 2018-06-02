"use strict";

const t = require("babel-core").types;
const getTagAndClassNamesAndId = require("./utils").getTagAndClassNamesAndId;
let isCssModules = false;

// utility functions that starts with b means build.

const isHyperscriptCall = node =>
  t.isIdentifier(node.callee, {
    name: "h"
  });

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
  let result;
  if (t.isArrayExpression(node)) {
    result = transformChildrenArray(node);
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

const processClassName = className => {
  const classNames = className.split(" ");
  if (classNames.length > 1) {
    const expressions = classNames.map(clazz =>
      t.MemberExpression(t.identifier("styles"), t.identifier(clazz))
    );
    const quasis = classNames.map(() =>
      t.templateElement({ cooked: " ", raw: " " })
    ); // Spaces between
    quasis.pop();
    quasis.push(t.templateElement({ cooked: "", raw: "" }, true)); // End of template string
    quasis.unshift(t.templateElement({ cooked: "", raw: "" })); // Empty string before
    return t.templateLiteral(quasis, expressions);
  } else {
    return isCssModules
      ? t.MemberExpression(t.identifier("styles"), t.identifier(className))
      : t.StringLiteral(className);
  }
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
        bJsxAttr(t.JSXIdentifier("className"), processClassName(className))
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

module.exports = function uglyRevTransform(node, isTopLevelCall, aCssModules) {
  isCssModules = aCssModules;
  let result;
  result = transformHyperscriptToJsx(node, isTopLevelCall);
  if (t.isJSXExpressionContainer(result)) {
    result = result.expression;
  }
  return result;
};
