import * as types from "babel-types";
import * as isFunction from "lodash.isfunction";
import {
  ErrNoSuper,
  ErrNotDefined,
  ErrIsNotFunction,
  ErrCanNotReadProperty,
  ErrInvalidIterable
} from "../error";
import { __generator, _toConsumableArray, __awaiter } from "../runtime";
import { Var, IVar } from "../var";
import { ES5Map, Kind, ScopeType } from "../type";
import { Signal } from "../signal";
import { Scope } from "../scope";
import { Stack } from "../stack";
import { THIS, UNDEFINED, ARGUMENTS, NEW, ANONYMOUS } from "../constant";

import {
  isArrayPattern,
  isAssignmentPattern,
  isFunctionDeclaration,
  isIdentifier,
  isMemberExpression,
  isObjectExpression,
  isObjectPattern,
  isObjectProperty,
  isRestElement,
  isSpreadElement,
  isVariableDeclaration,
  isStringLiteral
} from "../packages/babel-types";

import { defineFunctionLength, defineFunctionName } from "../utils";

import { Prototype } from "../Prototype";
import { This } from "../This";

function overriteStack(err: Error, stack: Stack, node: types.Node): Error {
  stack.push({
    filename: ANONYMOUS,
    stack: stack.currentStackName,
    location: node.loc
  });
  err.stack = err.toString() + "\n" + stack.raw;
  return err;
}

export const BinaryExpressionOperatorEvaluateMap = {
  // tslint:disable-next-line
  "==": (a, b) => a == b,
  // tslint:disable-next-line
  "!=": (a, b) => a != b,
  "===": (a, b) => a === b,
  "!==": (a, b) => a !== b,
  "<": (a, b) => a < b,
  "<=": (a, b) => a <= b,
  ">": (a, b) => a > b,
  ">=": (a, b) => a >= b,
  // tslint:disable-next-line
  "<<": (a, b) => a << b,
  // tslint:disable-next-line
  ">>": (a, b) => a >> b,
  // tslint:disable-next-line
  ">>>": (a, b) => a >>> b,
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
  "%": (a, b) => a % b,
  // tslint:disable-next-line
  "|": (a, b) => a | b,
  // tslint:disable-next-line
  "^": (a, b) => a ^ b,
  // tslint:disable-next-line
  "&": (a, b) => a & b,
  // "**": (a, b) => {
  //   throw ErrImplement('**')
  // },
  in: (a, b) => a in b,
  instanceof: (a, b) => a instanceof b
};

export const AssignmentExpressionEvaluateMap = {
  "=": ($var: IVar, v) => {
    $var.set(v);
    return v;
  },
  "+=": ($var: IVar, v) => {
    $var.set($var.value + v);
    return $var.value;
  },
  "-=": ($var: IVar, v) => {
    $var.set($var.value - v);
    return $var.value;
  },
  "*=": ($var: IVar, v) => {
    $var.set($var.value * v);
    return $var.value;
  },
  "**=": ($var: IVar, v) => {
    $var.set(Math.pow($var.value, v));
    return $var.value;
  },
  "/=": ($var: IVar, v) => {
    $var.set($var.value / v);
    return $var.value;
  },
  "%=": ($var: IVar, v) => {
    $var.set($var.value % v);
    return $var.value;
  },
  "<<=": ($var: IVar, v) => {
    // tslint:disable-next-line: no-bitwise
    $var.set($var.value << v);
    return $var.value;
  },
  ">>=": ($var: IVar, v) => {
    // tslint:disable-next-line: no-bitwise
    $var.set($var.value >> v);
    return $var.value;
  },
  ">>>=": ($var: IVar, v) => {
    // tslint:disable-next-line: no-bitwise
    $var.set($var.value >>> v);
    return $var.value;
  },
  "|=": ($var: IVar, v) => {
    // tslint:disable-next-line: no-bitwise
    $var.set($var.value | v);
    return $var.value;
  },
  "^=": ($var: IVar, v) => {
    // tslint:disable-next-line: no-bitwise
    $var.set($var.value ^ v);
    return $var.value;
  },
  "&=": ($var: IVar, v) => {
    // tslint:disable-next-line: no-bitwise
    $var.set($var.value & v);
    return $var.value;
  }
};

export const es5: ES5Map = {
  File(path) {
    path.evaluate(path.createChild(path.node.program));
  },
  Program(path) {
    const { node: program, scope } = path;
    // hoisting
    for (const node of program.body) {
      if (isFunctionDeclaration(node)) {
        path.evaluate(path.createChild(node));
      } else if (isVariableDeclaration(node)) {
        for (const declaration of node.declarations) {
          if (node.kind === Kind.Var) {
            scope.var((declaration.id as types.Identifier).name, undefined);
          }
        }
      }
    }

    for (const node of program.body) {
      if (!isFunctionDeclaration(node)) {
        path.evaluate(path.createChild(node));
      }
    }
  },
  Identifier(path) {
    const { node, scope, stack } = path;
    if (node.name === UNDEFINED) {
      return undefined;
    }
    const $var = scope.hasBinding(node.name);
    if ($var) {
      return $var.value;
    } else {
      throw overriteStack(ErrNotDefined(node.name), stack, node);
    }
  },
  RegExpLiteral(path) {
    const { node } = path;
    return new RegExp(node.pattern, node.flags);
  },
  StringLiteral(path) {
    return path.node.value;
  },
  NumericLiteral(path) {
    return path.node.value;
  },
  BooleanLiteral(path) {
    return path.node.value;
  },
  NullLiteral(path) {
    return null;
  },
  IfStatement(path) {
    const ifScope = path.scope.createChild(ScopeType.If);
    ifScope.invasive = true;
    ifScope.isolated = false;
    if (path.evaluate(path.createChild(path.node.test, ifScope))) {
      return path.evaluate(path.createChild(path.node.consequent, ifScope));
    } else if (path.node.alternate) {
      return path.evaluate(path.createChild(path.node.alternate, ifScope));
    }
  },
  EmptyStatement(path) {
    // do nothing
  },
  BlockStatement(path) {
    const { node: block, scope } = path;

    let blockScope: Scope = !scope.isolated
      ? scope
      : scope.createChild(ScopeType.Block);

    if (scope.isolated) {
      blockScope = scope.createChild(ScopeType.Block);
      blockScope.invasive = true;
    } else {
      blockScope = scope;
    }

    blockScope.isolated = true;

    // hoisting
    for (const node of block.body) {
      if (isFunctionDeclaration(node)) {
        path.evaluate(path.createChild(node));
      } else if (isVariableDeclaration(node)) {
        for (const declaration of node.declarations) {
          if (node.kind === Kind.Var) {
            if (!scope.isolated && scope.invasive) {
              const targetScope = (function get(s: Scope) {
                if (s.parent) {
                  if (s.parent.invasive) {
                    return get(s.parent);
                  } else {
                    return s.parent;
                  }
                } else {
                  return s;
                }
              })(scope);
              targetScope.parent.var(
                (declaration.id as types.Identifier).name,
                undefined
              );
            } else {
              scope.var((declaration.id as types.Identifier).name, undefined);
            }
          }
        }
      }
    }

    let tempResult;
    for (const node of block.body) {
      const result = (tempResult = path.evaluate(
        path.createChild(node, blockScope)
      ));
      if (result instanceof Signal) {
        return result;
      }
    }
    // to support do-expression
    // anyway, return the last item
    return tempResult;
  },
  // babylon parse in strict mode and disable WithStatement
  // WithStatement(path) {
  // throw ErrNotSupport(path.node.type);
  // },
  DebuggerStatement(path) {
    // tslint:disable-next-line
    debugger;
  },
  LabeledStatement(path) {
    const label = path.node.label as types.Identifier;
    return path.evaluate(
      path.createChild(path.node.body, path.scope, { labelName: label.name })
    );
  },
  BreakStatement(path) {
    const label = path.node.label;
    return new Signal("break", label ? label.name : undefined);
  },
  ContinueStatement(path) {
    const label = path.node.label;
    return new Signal("continue", label ? label.name : undefined);
  },
  ReturnStatement(path) {
    return new Signal(
      "return",
      path.node.argument
        ? path.evaluate(path.createChild(path.node.argument))
        : undefined
    );
  },
  VariableDeclaration(path) {
    const { node, scope, stack } = path;
    const kind = node.kind;

    for (const declaration of node.declarations) {
      const varKeyValueMap: { [k: string]: any } = {};
      /**
       * example:
       *
       * var a = 1
       */
      if (isIdentifier(declaration.id)) {
        varKeyValueMap[declaration.id.name] = declaration.init
          ? path.evaluate(path.createChild(declaration.init))
          : undefined;
      } else if (isObjectPattern(declaration.id)) {
        /**
         * example:
         *
         * const {q,w,e} = {};
         */
        const vars: Array<{ key: string; alias: string }> = [];
        for (const n of declaration.id.properties) {
          if (isObjectProperty(n)) {
            vars.push({
              key: (n.key as any).name as string,
              alias: (n.value as any).name as string
            });
          }
        }
        const obj = path.evaluate(path.createChild(declaration.init));

        for (const $var of vars) {
          if ($var.key in obj) {
            varKeyValueMap[$var.alias] = obj[$var.key];
          }
        }
      } else if (isArrayPattern(declaration.id)) {
        // @es2015 destrucuring
        // @flow
        const initValue = path.evaluate(path.createChild(declaration.init));

        if (!initValue[Symbol.iterator]) {
          throw overriteStack(
            ErrInvalidIterable("{(intermediate value)}"),
            stack,
            declaration.init
          );
        }

        declaration.id.elements.forEach((n, i) => {
          if (isIdentifier(n)) {
            const $varName: string = n.typeAnnotation
              ? (n.typeAnnotation.typeAnnotation as any).id.name
              : n.name;

            const el = initValue[i];
            varKeyValueMap[$varName] = el;
          }
        });
      } else {
        throw node;
      }

      // start defned var
      for (const varName in varKeyValueMap) {
        /**
         * If the scope is penetrating and defined as VAR, it is defined on its parent scope
         * example:
         *
         * {
         *   var a = 123
         * }
         */
        if (scope.invasive && kind === Kind.Var) {
          const targetScope = (function get(s: Scope) {
            if (s.parent) {
              if (s.parent.invasive) {
                return get(s.parent);
              } else {
                return s.parent;
              }
            } else {
              return s;
            }
          })(scope);

          targetScope.declare(kind, varName, varKeyValueMap[varName]);
        } else {
          scope.declare(kind, varName, varKeyValueMap[varName]);
        }
      }
    }
  },
  VariableDeclarator: path => {
    const { node, scope } = path;
    // @es2015 destructuring
    if (isObjectPattern(node.id)) {
      const newScope = scope.createChild(ScopeType.Object);
      if (isObjectExpression(node.init)) {
        path.evaluate(path.createChild(node.init, newScope));
      }
      for (const n of node.id.properties) {
        if (isObjectProperty(n)) {
          const propertyName: string = (n as any).id.name;
          const $var = newScope.hasBinding(propertyName);
          const varValue = $var ? $var.value : undefined;
          scope.var(propertyName, varValue);
          return varValue;
        }
      }
    } else if (isObjectExpression(node.init)) {
      const varName: string = (node.id as types.Identifier).name;
      const varValue = path.evaluate(path.createChild(node.init));
      scope.var(varName, varValue);
      return varValue;
    } else {
      throw node;
    }
  },
  FunctionDeclaration(path) {
    const { node, scope } = path;
    const { name: functionName } = node.id;

    let func;

    if (node.async) {
      // FIXME: support async function
      func = function() {
        return __awaiter(this, void 0, void 0, () => {
          // tslint:disable-next-line
          const __this = this;

          // tslint:disable-next-line
          function handler(_a) {
            const functionBody = node.body;
            const block = functionBody.body[_a.label];
            // the last block
            if (!block) {
              return [2, undefined];
            }

            const fieldContext = {
              call: false,
              value: null
            };
            function next(value) {
              fieldContext.value = value;
              fieldContext.call = true;
              _a.sent();
            }

            const r = path.evaluate(
              path.createChild(block, path.scope, { next })
            );

            if (Signal.isReturn(r)) {
              return [2 /* return */, r.value];
            }
            if (fieldContext.call) {
              return [4 /* yield */, fieldContext.value];
            } else {
              // next block
              _a.label++;
              return handler(_a);
            }
          }

          return __generator(__this, handler);
        });
      };
    } else if (node.generator) {
      func = function() {
        // tslint:disable-next-line
        const __this = this;

        // tslint:disable-next-line
        function handler(_a) {
          const functionBody = node.body;
          const block = functionBody.body[_a.label];
          // the last block
          if (!block) {
            return [2, undefined];
          }

          const fieldContext = {
            call: false,
            value: null
          };
          function next(value) {
            fieldContext.value = value;
            fieldContext.call = true;
            _a.sent();
          }

          const r = path.evaluate(
            path.createChild(block, path.scope, { next })
          );

          if (Signal.isReturn(r)) {
            return [2, r.value];
          }
          if (fieldContext.call) {
            return [4, fieldContext.value];
          } else {
            // next block
            _a.label++;
            return handler(_a);
          }
        }

        return __generator(__this, handler);
      };
    } else {
      func = es5.FunctionExpression(path.createChild(node as any));
    }

    defineFunctionLength(func, node.params.length || 0);
    defineFunctionName(func, functionName);

    // Function can repeat declaration
    scope.var(functionName, func);
  },
  ExpressionStatement(path) {
    return path.evaluate(path.createChild(path.node.expression));
  },
  ForStatement(path) {
    const { node, scope, ctx } = path;
    const labelName = ctx.labelName as string | void;
    const forScope = scope.createChild(ScopeType.For);

    forScope.invasive = true; // 有块级作用域

    // init loop
    if (node.init) {
      path.evaluate(path.createChild(node.init, forScope));
    }

    function update(): void {
      if (node.update) {
        path.evaluate(path.createChild(node.update, forScope));
      }
    }

    function test(): boolean {
      return node.test
        ? path.evaluate(path.createChild(node.test, forScope))
        : true;
    }

    for (;;) {
      // every loop will create it's own scope
      // it should inherit from forScope
      const loopScope = forScope.fork(ScopeType.ForChild);
      loopScope.isolated = false;

      if (!test()) {
        break;
      }

      const signal = path.evaluate(
        path.createChild(node.body, loopScope, { labelName: undefined })
      );

      if (Signal.isBreak(signal)) {
        if (!signal.value) {
          break;
        }
        if (signal.value === labelName) {
          break;
        }
        return signal;
      } else if (Signal.isContinue(signal)) {
        if (!signal.value) {
          continue;
        }
        if (signal.value === labelName) {
          update();
          continue;
        }
        return signal;
      } else if (Signal.isReturn(signal)) {
        return signal;
      }

      update();
    }
  },
  ForInStatement(path) {
    const { node, scope, ctx } = path;
    const kind = (node.left as types.VariableDeclaration).kind;
    const decl = (node.left as types.VariableDeclaration).declarations[0];
    const name = (decl.id as types.Identifier).name;

    const labelName: string = ctx.labelName;

    const right = path.evaluate(path.createChild(node.right));

    for (const value in right) {
      if (Object.hasOwnProperty.call(right, value)) {
        const forInScope = scope.createChild(ScopeType.ForIn);
        forInScope.invasive = true;
        forInScope.isolated = false;
        forInScope.declare(kind, name, value);

        const signal = path.evaluate(path.createChild(node.body, forInScope));

        if (Signal.isBreak(signal)) {
          if (!signal.value) {
            break;
          }
          if (signal.value === labelName) {
            break;
          }
          return signal;
        } else if (Signal.isContinue(signal)) {
          if (!signal.value) {
            continue;
          }
          if (signal.value === labelName) {
            continue;
          }
          return signal;
        } else if (Signal.isReturn(signal)) {
          return signal;
        }
      }
    }
  },
  DoWhileStatement(path) {
    const { node, scope, ctx } = path;
    const labelName: string | void = ctx.labelName;
    // do while don't have his own scope
    do {
      const doWhileScope = scope.createChild(ScopeType.DoWhile);
      doWhileScope.invasive = true;
      doWhileScope.isolated = false;
      const signal = path.evaluate(path.createChild(node.body, doWhileScope));
      if (Signal.isBreak(signal)) {
        if (!signal.value) {
          break;
        }
        if (signal.value === labelName) {
          break;
        }
        return signal;
      } else if (Signal.isContinue(signal)) {
        if (!signal.value) {
          continue;
        }
        if (signal.value === labelName) {
          continue;
        }
        return signal;
      } else if (Signal.isReturn(signal)) {
        return signal;
      }
    } while (path.evaluate(path.createChild(node.test)));
  },
  WhileStatement(path) {
    const { node, scope, ctx } = path;
    const labelName: string | void = ctx.labelName;

    while (path.evaluate(path.createChild(node.test))) {
      const whileScope = scope.createChild(ScopeType.While);
      whileScope.invasive = true;
      whileScope.isolated = false;
      const signal = path.evaluate(path.createChild(node.body, whileScope));
      if (Signal.isBreak(signal)) {
        if (!signal.value) {
          break;
        }

        if (signal.value === labelName) {
          break;
        }

        return signal;
      } else if (Signal.isContinue(signal)) {
        if (!signal.value) {
          continue;
        }

        if (signal.value === labelName) {
          continue;
        }
        return signal;
      } else if (Signal.isReturn(signal)) {
        return signal;
      }
    }
  },
  ThrowStatement(path) {
    // TODO: rewrite the stack log
    throw path.evaluate(path.createChild(path.node.argument));
  },
  CatchClause(path) {
    return path.evaluate(path.createChild(path.node.body));
  },
  TryStatement(path) {
    const { node, scope } = path;
    try {
      const tryScope = scope.createChild(ScopeType.Try);
      tryScope.invasive = true;
      tryScope.isolated = false;
      return path.evaluate(path.createChild(node.block, tryScope));
    } catch (err) {
      const param = node.handler.param as types.Identifier;
      const catchScope = scope.createChild(ScopeType.Catch);
      catchScope.invasive = true;
      catchScope.isolated = false;
      catchScope.const(param.name, err);
      return path.evaluate(path.createChild(node.handler, catchScope));
    } finally {
      if (node.finalizer) {
        const finallyScope = scope.createChild(ScopeType.Finally);
        finallyScope.invasive = true;
        finallyScope.isolated = false;
        // tslint:disable-next-line
        return path.evaluate(path.createChild(node.finalizer, finallyScope));
      }
    }
  },
  SwitchStatement(path) {
    const { node, scope } = path;
    const discriminant = path.evaluate(path.createChild(node.discriminant)); // switch的条件
    const switchScope = scope.createChild(ScopeType.Switch);
    switchScope.invasive = true;
    switchScope.isolated = false;

    let matched = false;
    for (const $case of node.cases) {
      // 进行匹配相应的 case
      if (
        !matched &&
        (!$case.test ||
          discriminant ===
            path.evaluate(path.createChild($case.test, switchScope)))
      ) {
        matched = true;
      }

      if (matched) {
        const result = path.evaluate(path.createChild($case, switchScope));

        if (Signal.isBreak(result)) {
          break;
        } else if (Signal.isContinue(result)) {
          // SwitchStatement can not use continue keyword
          // but it can continue parent loop, like for, for-in, for-of, while
          return result;
        } else if (Signal.isReturn(result)) {
          return result;
        }
      }
    }
  },
  SwitchCase(path) {
    const { node } = path;
    for (const stmt of node.consequent) {
      const result = path.evaluate(path.createChild(stmt));
      if (result instanceof Signal) {
        return result;
      }
    }
  },
  UpdateExpression(path) {
    const { node, scope, stack } = path;
    const { prefix } = node;
    let $var: IVar;
    if (isIdentifier(node.argument)) {
      const { name } = node.argument;
      const $$var = scope.hasBinding(name);
      if (!$$var) {
        throw overriteStack(ErrNotDefined(name), stack, node.argument);
      }
      $var = $$var;
    } else if (isMemberExpression(node.argument)) {
      const argument = node.argument;
      const object = path.evaluate(path.createChild(argument.object));
      const property = argument.computed
        ? path.evaluate(path.createChild(argument.property))
        : (argument.property as types.Identifier).name;
      $var = {
        kind: Kind.Const,
        set(value: any) {
          object[property] = value;
        },
        get value() {
          return object[property];
        }
      };
    }

    return {
      "--": v => {
        $var.set(v - 1);
        return prefix ? --v : v--;
      },
      "++": v => {
        $var.set(v + 1);
        return prefix ? ++v : v++;
      }
    }[node.operator](path.evaluate(path.createChild(node.argument)));
  },
  ThisExpression(path) {
    const { scope } = path;
    // use this in class constructor it it never call super();
    if (scope.type === ScopeType.Constructor) {
      if (!scope.hasOwnBinding(THIS)) {
        throw overriteStack(ErrNoSuper(), path.stack, path.node);
      }
    }
    const thisVar = scope.hasBinding(THIS);
    return thisVar ? thisVar.value : null;
  },
  ArrayExpression(path) {
    const { node } = path;
    let newArray: any[] = [];
    for (const item of node.elements) {
      if (item === null) {
        newArray.push(undefined);
      } else if (isSpreadElement(item)) {
        const arr = path.evaluate(path.createChild(item));
        newArray = ([] as any[]).concat(newArray, _toConsumableArray(arr));
      } else {
        newArray.push(path.evaluate(path.createChild(item)));
      }
    }
    return newArray;
  },
  ObjectExpression(path) {
    const { node, scope } = path;
    const object = {};
    const newScope = scope.createChild(ScopeType.Object);
    const computedProperties: Array<
      types.ObjectProperty | types.ObjectMethod
    > = [];

    for (const property of node.properties) {
      const tempProperty = property as
        | types.ObjectMethod
        | types.ObjectProperty;
      if (tempProperty.computed === true) {
        computedProperties.push(tempProperty);
        continue;
      }
      path.evaluate(path.createChild(property, newScope, { object }));
    }

    // eval the computed properties
    for (const property of computedProperties) {
      path.evaluate(path.createChild(property, newScope, { object }));
    }

    return object;
  },
  ObjectProperty(path) {
    const { node, scope, ctx } = path;
    const { object } = ctx;
    const val = path.evaluate(path.createChild(node.value));
    if (isIdentifier(node.key)) {
      object[node.key.name] = val;
      scope.var(node.key.name, val);
    } else {
      object[path.evaluate(path.createChild(node.key))] = val;
    }
  },
  ObjectMethod(path) {
    const { node, scope, stack } = path;
    const methodName: string = !node.computed
      ? isIdentifier(node.key)
        ? node.key.name
        : path.evaluate(path.createChild(node.key))
      : path.evaluate(path.createChild(node.key));
    const method = function() {
      stack.enter("Object." + methodName);
      const args = [].slice.call(arguments);
      const newScope = scope.createChild(ScopeType.Function);
      newScope.const(THIS, this);
      // define arguments
      node.params.forEach((param, i) => {
        newScope.const((param as types.Identifier).name, args[i]);
      });
      const result = path.evaluate(path.createChild(node.body, newScope));
      stack.leave();
      if (Signal.isReturn(result)) {
        return result.value;
      }
    };
    defineFunctionLength(method, node.params.length);
    defineFunctionName(method, methodName);

    const objectKindMap = {
      get() {
        Object.defineProperty(path.ctx.object, methodName, { get: method });
        scope.const(methodName, method);
      },
      set() {
        Object.defineProperty(path.ctx.object, methodName, { set: method });
      },
      method() {
        Object.defineProperty(path.ctx.object, methodName, { value: method });
      }
    };

    const definer = objectKindMap[node.kind];

    if (definer) {
      definer();
    }
  },
  FunctionExpression(path) {
    const { node, scope, stack } = path;

    const functionName = node.id ? node.id.name : "";
    const func = function(...args) {
      stack.enter(functionName); // enter the stack

      // Is this function is a constructor?
      // if it's constructor, it should return instance
      const shouldReturnInstance =
        args.length &&
        args[args.length - 1] instanceof This &&
        args.pop() &&
        true;

      const funcScope = scope.createChild(ScopeType.Function);
      for (let i = 0; i < node.params.length; i++) {
        const param = node.params[i];
        if (isIdentifier(param)) {
          funcScope.let(param.name, args[i]);
        } else if (isAssignmentPattern(param)) {
          // @es2015 default parameters
          path.evaluate(path.createChild(param, funcScope, { value: args[i] }));
        } else if (isRestElement(param)) {
          // @es2015 rest parameters
          path.evaluate(
            path.createChild(param, funcScope, { value: args.slice(i) })
          );
        }
      }

      funcScope.const(THIS, this);
      // support new.target
      funcScope.const(NEW, {
        target:
          this && this.__proto__ && this.__proto__.constructor
            ? this.__proto__.constructor
            : undefined
      });
      funcScope.const(ARGUMENTS, arguments);
      funcScope.isolated = false;

      const result = path.evaluate(path.createChild(node.body, funcScope));
      stack.leave(); // leave stack
      if (shouldReturnInstance) {
        return this;
      } else if (result instanceof Signal) {
        return result.value;
      } else {
        return result;
      }
    };

    defineFunctionLength(func, node.params.length);
    defineFunctionName(func, node.id ? node.id.name : ""); // Anonymous function

    return func;
  },
  BinaryExpression(path) {
    const { node } = path;
    return BinaryExpressionOperatorEvaluateMap[node.operator](
      path.evaluate(path.createChild(node.left)),
      path.evaluate(path.createChild(node.right))
    );
  },
  UnaryExpression(path) {
    const { node, scope } = path;
    return {
      "-": () => -path.evaluate(path.createChild(node.argument)),
      "+": () => +path.evaluate(path.createChild(node.argument)),
      "!": () => !path.evaluate(path.createChild(node.argument)),
      // tslint:disable-next-line
      "~": () => ~path.evaluate(path.createChild(node.argument)),
      void: () => void path.evaluate(path.createChild(node.argument)),
      typeof: (): string => {
        if (isIdentifier(node.argument)) {
          const $var = scope.hasBinding(node.argument.name);
          return $var ? typeof $var.value : UNDEFINED;
        } else {
          return typeof path.evaluate(path.createChild(node.argument));
        }
      },
      delete: () => {
        if (isMemberExpression(node.argument)) {
          const { object, property, computed } = node.argument;
          if (computed) {
            return delete path.evaluate(path.createChild(object))[
              path.evaluate(path.createChild(property))
            ];
          } else {
            return delete path.evaluate(path.createChild(object))[
              (property as types.Identifier).name
            ];
          }
        } else if (isIdentifier(node.argument)) {
          const $this = scope.hasBinding(THIS);
          if ($this) {
            return $this.value[node.argument.name];
          }
        }
      }
    }[node.operator]();
  },
  CallExpression(path) {
    const { node, scope, stack } = path;

    const functionName: string = isMemberExpression(node.callee)
      ? (() => {
          if (isIdentifier(node.callee.property)) {
            return (
              (node.callee.object as any).name + "." + node.callee.property.name
            );
          } else if (isStringLiteral(node.callee.property)) {
            return (
              (node.callee.object as any).name +
              "." +
              node.callee.property.value
            );
          } else {
            return "undefined";
          }
        })()
      : (node.callee as types.Identifier).name;

    const func = path.evaluate(path.createChild(node.callee));
    const args = node.arguments.map(arg =>
      path.evaluate(path.createChild(arg))
    );
    const isValidFunction = isFunction(func) as boolean;

    let context: any = null;

    if (isMemberExpression(node.callee)) {
      if (!isValidFunction) {
        throw overriteStack(
          ErrIsNotFunction(functionName),
          stack,
          node.callee.property
        );
      } else {
        stack.push({
          filename: ANONYMOUS,
          stack: stack.currentStackName,
          location: node.callee.property.loc
        });
      }
      context = path.evaluate(path.createChild(node.callee.object));
    } else {
      if (!isValidFunction) {
        throw overriteStack(ErrIsNotFunction(functionName), stack, node);
      } else {
        stack.push({
          filename: ANONYMOUS,
          stack: stack.currentStackName,
          location: node.loc
        });
      }
      const thisVar = scope.hasBinding(THIS);
      context = thisVar ? thisVar.value : null;
    }

    const result = func.apply(context, args);

    if (result instanceof Error) {
      result.stack = result.toString() + "\n" + stack.raw;
    }

    return result;
  },
  MemberExpression(path) {
    const { node } = path;
    const { object, property, computed } = node;

    const propertyName: string = computed
      ? path.evaluate(path.createChild(property))
      : (property as types.Identifier).name;

    const obj = path.evaluate(path.createChild(object));

    if (obj === undefined) {
      throw ErrCanNotReadProperty(propertyName, "undefined");
    }

    if (obj === null) {
      throw ErrCanNotReadProperty(propertyName, "null");
    }

    const isPrototype =
      propertyName === "prototype" && types.isIdentifier(property);

    const target = isPrototype ? new Prototype(obj) : obj[propertyName];

    return target instanceof Prototype
      ? target
      : isFunction(target)
        ? target.bind(obj)
        : target;
  },
  AssignmentExpression(path) {
    const { node, scope } = path;
    let $var: IVar = {
      kind: Kind.Var,
      set(value: any) {
        //
      },
      get value() {
        return undefined;
      }
    };
    // right first
    const rightValue = path.evaluate(path.createChild(node.right));

    if (isIdentifier(node.left)) {
      const { name } = node.left;
      const varOrNot = scope.hasBinding(name);

      if (!varOrNot) {
        // here to define global var
        const globalScope = scope.global;
        globalScope.var(name, path.evaluate(path.createChild(node.right)));
        const globalVar = globalScope.hasBinding(name);
        if (globalVar) {
          $var = globalVar;
        } else {
          throw overriteStack(ErrNotDefined(name), path.stack, node.right);
        }
      } else {
        $var = varOrNot as Var<any>;
        /**
         * const test = 123;
         * test = 321 // it should throw an error
         */
        if ($var.kind === Kind.Const) {
          throw overriteStack(
            new TypeError("Assignment to constant variable."),
            path.stack,
            node.left
          );
        }
      }
    } else if (isMemberExpression(node.left)) {
      const left = node.left;
      const object: any = path.evaluate(path.createChild(left.object));
      const property: string = left.computed
        ? path.evaluate(path.createChild(left.property))
        : (left.property as types.Identifier).name;

      $var = {
        kind: Kind.Var,
        set(value: any) {
          if (object instanceof Prototype) {
            const Constructor = object.constructor;
            Constructor.prototype[property] = value;
          } else {
            object[property] = value;
          }
        },
        get value() {
          return object[property];
        }
      };
    }

    return AssignmentExpressionEvaluateMap[node.operator]($var, rightValue);
  },
  LogicalExpression(path) {
    const { node } = path;
    return {
      "||": () =>
        path.evaluate(path.createChild(node.left)) ||
        path.evaluate(path.createChild(node.right)),
      "&&": () =>
        path.evaluate(path.createChild(node.left)) &&
        path.evaluate(path.createChild(node.right))
    }[node.operator]();
  },
  ConditionalExpression(path) {
    return path.evaluate(path.createChild(path.node.test))
      ? path.evaluate(path.createChild(path.node.consequent))
      : path.evaluate(path.createChild(path.node.alternate));
  },
  NewExpression(path) {
    const { node, stack } = path;
    const func = path.evaluate(path.createChild(node.callee));
    const args: any[] = node.arguments.map(arg =>
      path.evaluate(path.createChild(arg))
    );
    func.prototype.constructor = func;
    let entity = /native code/.test(func.toString())
      ? new func(...args)
      : new func(...args, new This(null));

    // stack track for Error constructor
    if (func === Error || entity instanceof Error) {
      entity = overriteStack(entity, stack, node);
    }
    return entity;
  },
  SequenceExpression(path) {
    let result;
    for (const expression of path.node.expressions) {
      result = path.evaluate(path.createChild(expression));
    }
    return result;
  }
};
