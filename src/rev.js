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

const transformChildrenArray = node => {
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

const convertToStringLiteral = node =>
  t.stringLiteral(node.quasis[0].value.raw);

const transformHyperscriptToJsx = (node, isTopLevelCall) => {
  // Intermediate cause first need to be checked on some corner cases
  const [intermediateFirstArg, secondArg, thirdArg] = node.arguments;
  // Handling few corner cases down here

  // Handling of h(obj[field]) or h(fn()) and h(`stuff ${computed}`) to ignore and convert to StringLiteral if possible
  const isTemplateLiteral = t.isTemplateLiteral(intermediateFirstArg);
  const hasExpressions =
    isTemplateLiteral && intermediateFirstArg.expressions.length;
  const isComputedClassNameOrComponent =
    intermediateFirstArg.computed ||
    hasExpressions ||
    t.isBinaryExpression(intermediateFirstArg);
  const isFirstArgIsCalledFunction =
    intermediateFirstArg.arguments &&
    intermediateFirstArg.arguments.length >= 0;
  // Intermediate value to convert to StringLiteral if TemplateLiteral has no expressions
  const firstArgument =
    isTemplateLiteral && !hasExpressions
      ? convertToStringLiteral(intermediateFirstArg)
      : intermediateFirstArg;
  const isConditionalExpression =
    firstArgument.type === "ConditionalExpression"

  // If firstArg is computed should be ignored, but inside the JSX should be wrapped into JSXExprContainer
  if (isComputedClassNameOrComponent || isFirstArgIsCalledFunction || isConditionalExpression) {
    return isTopLevelCall ? node : t.JSXExpressionContainer(node);
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
    const expressions = classNames.map(clazz => {
      const isComputed = clazz.includes("-");
      return t.MemberExpression(
        t.identifier("styles"),
        isComputed ? t.stringLiteral(clazz) : t.identifier(clazz),
        isComputed
      );
    });
    const quasis = classNames.map(() =>
      t.templateElement({ cooked: " ", raw: " " })
    ); // Spaces between
    quasis.pop();
    quasis.push(t.templateElement({ cooked: "", raw: "" }, true)); // End of template string
    quasis.unshift(t.templateElement({ cooked: "", raw: "" })); // Empty string before
    return t.templateLiteral(quasis, expressions);
  } else {
    const isComputed = className.includes("-");
    return isCssModules
      ? t.MemberExpression(
          t.identifier("styles"),
          isComputed ? t.stringLiteral(className) : t.identifier(className),
          isComputed
        )
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
      return t.JSXExpressionContainer(logicalExpression);
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
