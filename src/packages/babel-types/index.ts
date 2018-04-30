import {
  ArrayExpression,
  ArrayPattern,
  AssignmentPattern,
  CallExpression,
  ClassMethod,
  ClassProperty,
  FunctionDeclaration,
  Identifier,
  ImportDefaultSpecifier,
  ImportSpecifier,
  MemberExpression,
  Node,
  ObjectExpression,
  ObjectPattern,
  ObjectProperty,
  RestElement,
  SpreadElement,
  VariableDeclaration,
  StringLiteral
} from "babel-types";

function is(node: Node, type: string): boolean {
  return node.type === type;
}

export function isStringLiteral(node: Node): node is StringLiteral {
  return is(node, "StringLiteral");
}

export function isArrayExpression(node: Node): node is ArrayExpression {
  return is(node, "ArrayExpression");
}

export function isObjectExpression(node: Node): node is ObjectExpression {
  return is(node, "ObjectExpression");
}

export function isFunctionDeclaration(node: Node): node is FunctionDeclaration {
  return is(node, "FunctionDeclaration");
}

export function isVariableDeclaration(node: Node): node is VariableDeclaration {
  return is(node, "VariableDeclaration");
}

export function isIdentifier(node: Node): node is Identifier {
  return is(node, "Identifier");
}

export function isObjectPattern(node: Node): node is ObjectPattern {
  return is(node, "ObjectPattern");
}

export function isObjectProperty(node: Node): node is ObjectProperty {
  return is(node, "ObjectProperty");
}

export function isArrayPattern(node: Node): node is ArrayPattern {
  return is(node, "ArrayPattern");
}

export function isMemberExpression(node: Node): node is MemberExpression {
  return is(node, "MemberExpression");
}

export function isSpreadElement(node: Node): node is SpreadElement {
  return is(node, "SpreadElement");
}

export function isAssignmentPattern(node: Node): node is AssignmentPattern {
  return is(node, "AssignmentPattern");
}

export function isRestElement(node: Node): node is RestElement {
  return is(node, "RestElement");
}

export function isClassMethod(node: Node): node is ClassMethod {
  return is(node, "ClassMethod");
}

export function isClassProperty(node: Node): node is ClassProperty {
  return is(node, "ClassProperty");
}

export function isCallExpression(node: Node): node is CallExpression {
  return is(node, "CallExpression");
}

export function isImportDefaultSpecifier(
  node: Node
): node is ImportDefaultSpecifier {
  return is(node, "ImportDefaultSpecifier");
}

export function isImportSpecifier(node: Node): node is ImportSpecifier {
  return is(node, "ImportSpecifier");
}
