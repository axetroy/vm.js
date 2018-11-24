import * as t from "babel-types";
import { Path } from "./path";

export enum ScopeType {
  Root,
  Function, // isolated scope
  Method, // isolated scope
  Constructor, // isolated scope
  For,
  ForChild,
  ForIn,
  ForOf,
  While,
  DoWhile,
  Do,
  Switch,
  If,
  ElseIf,
  Object,
  Try,
  Catch,
  Finally,
  Class,
  Block
}

export const isolatedScopeMap = {
  [ScopeType.Function]: true,
  [ScopeType.Constructor]: true,
  [ScopeType.Method]: true,
  [ScopeType.Object]: true
};

export enum Kind {
  Var = "var",
  Const = "const",
  Let = "let"
}

export type KindType = "var" | "const" | "let";

export interface IES5TypeMap {
  File: t.File;
  Program: t.Program;
  Identifier: t.Identifier;
  NullLiteral: t.NullLiteral;
  StringLiteral: t.StringLiteral;
  NumericLiteral: t.NumericLiteral;
  BooleanLiteral: t.BooleanLiteral;
  RegExpLiteral: t.RegExpLiteral;
  FunctionDeclaration: t.FunctionDeclaration;
  FunctionExpression: t.FunctionExpression;
  ArrayExpression: t.ArrayExpression;
  SwitchCase: t.SwitchCase;
  CatchClause: t.CatchClause;
  VariableDeclarator: t.VariableDeclarator;
  ExpressionStatement: t.ExpressionStatement;
  BlockStatement: t.BlockStatement;
  EmptyStatement: t.EmptyStatement;
  DebuggerStatement: t.DebuggerStatement;
  // WithStatement: t.WithStatement; // babylon parse in strict mode and disable WithStatement
  ReturnStatement: t.ReturnStatement;
  LabeledStatement: t.LabeledStatement;
  BreakStatement: t.BreakStatement;
  ContinueStatement: t.ContinueStatement;
  IfStatement: t.IfStatement;
  SwitchStatement: t.SwitchStatement;
  ThrowStatement: t.ThrowStatement;
  TryStatement: t.TryStatement;
  WhileStatement: t.WhileStatement;
  DoWhileStatement: t.DoWhileStatement;
  ForStatement: t.ForStatement;
  ForInStatement: t.ForInStatement;
  VariableDeclaration: t.VariableDeclaration;
  ThisExpression: t.ThisExpression;
  ObjectExpression: t.ObjectExpression;
  ObjectProperty: t.ObjectProperty;
  ObjectMethod: t.ObjectMethod;
  UnaryExpression: t.UnaryExpression;
  UpdateExpression: t.UpdateExpression;
  BinaryExpression: t.BinaryExpression;
  AssignmentExpression: t.AssignmentExpression;
  LogicalExpression: t.LogicalExpression;
  MemberExpression: t.MemberExpression;
  ConditionalExpression: t.ConditionalExpression;
  CallExpression: t.CallExpression;
  NewExpression: t.NewExpression;
  SequenceExpression: t.SequenceExpression;
}

export interface IES2015TypeMap {
  ArrowFunctionExpression: t.ArrowFunctionExpression;
  TemplateLiteral: t.TemplateLiteral;
  TaggedTemplateExpression: t.TaggedTemplateExpression;
  ForOfStatement: t.ForOfStatement;
  ClassExpression: t.ClassExpression;
  ClassMethod: t.ClassMethod;
  MetaProperty: t.MetaProperty;
  Super: t.Super;
  TemplateElement: t.TemplateElement;
  SpreadElement: t.SpreadElement;
  ClassDeclaration: t.ClassDeclaration;
  YieldExpression: t.YieldExpression;
  // ObjectPattern: t.ObjectPattern;
  // ArrayPattern: t.ArrayPattern;
  RestElement: t.RestElement;
  AssignmentPattern: t.AssignmentPattern;
  ClassBody: t.ClassBody;
  ImportDeclaration: t.ImportDeclaration;
  ExportNamedDeclaration: t.ExportNamedDeclaration;
  ExportDefaultDeclaration: t.ExportDefaultDeclaration;
}

export interface IES2016TypeMap {
  BinaryExpression: t.BinaryExpression;
}

export interface IES2017TypeMap {
  AwaitExpression: t.AwaitExpression;
}

export interface IExperimentalTypeMap {
  // ExportAllDeclaration: t.ExportAllDeclaration;
  ImportSpecifier: t.ImportSpecifier;
  ImportDefaultSpecifier: t.ImportDefaultSpecifier;
  // ImportNamespaceSpecifier: t.ImportNamespaceSpecifier;
  ExportSpecifier: t.ExportSpecifier;
  SpreadProperty: t.SpreadProperty;
  DoExpression: t.DoExpression;
  Decorator: t.Decorator;
}

export interface INodeTypeMap
  extends IES5TypeMap,
    IES2015TypeMap,
    IES2016TypeMap,
    IES2017TypeMap,
    IExperimentalTypeMap {}

export type ES5Map = {
  [key in keyof IES5TypeMap]: (path: Path<IES5TypeMap[key]>) => any
};

export type ES2015Map = {
  [key in keyof IES2015TypeMap]: (path: Path<IES2015TypeMap[key]>) => any
};

export type ES2016Map = {
  [key in keyof IES2016TypeMap]: (path: Path<IES2016TypeMap[key]>) => any
};

export type ES2017Map = {
  [key in keyof IES2017TypeMap]: (path: Path<IES2017TypeMap[key]>) => any
};

export type ExperimentalMap = {
  [key in keyof IExperimentalTypeMap]: (
    path: Path<IExperimentalTypeMap[key]>
  ) => any
};

export type IEcmaScriptMap = {
  [key in keyof INodeTypeMap]: (path: Path<INodeTypeMap[key]>) => any
};

export type EvaluateFunc = (path: Path<t.Node>) => any;

export enum presetMap {
  es5 = "es5",
  es2015 = "es2015",
  es2016 = "es2016",
  es2017 = "es2017",
  es2018 = "es2018",
  env = "env"
}
