import * as types from "babel-types";
import {
  ErrNotDefined,
  ErrNotSupport,
  ErrDuplicateDeclard,
  ErrUnexpectedToken,
  ErrInvalidIterable,
  ErrNoSuper
} from "./error";
import { Scope, ScopeVar, Kind } from "./scope";
import {
  _classCallCheck,
  _createClass,
  _possibleConstructorReturn,
  _inherits,
  _toConsumableArray,
  _taggedTemplateLiteral,
  __generator
} from "./runtime";
import { Path } from "./path";
import { EvaluateMap, EvaluateFunc } from "./type";

const BREAK_SINGAL: {} = {};
const CONTINUE_SINGAL: {} = {};
const RETURN_SINGAL: { result: any } = { result: undefined };

const evaluate_map: EvaluateMap = {
  File(path) {
    evaluate(path.$child(path.node.program));
  },
  Program(path) {
    const { node: program, scope } = path;
    // hoisting
    for (const node of program.body) {
      if (types.isFunctionDeclaration(node)) {
        evaluate(path.$child(node));
      } else if (types.isVariableDeclaration(node)) {
        for (const declaration of node.declarations) {
          if (node.kind === "var") {
            scope.$var((<types.Identifier>declaration.id).name, undefined);
          }
        }
      }
    }

    for (const node of program.body) {
      if (!types.isFunctionDeclaration(node)) {
        evaluate(path.$child(node));
      }
    }
  },

  Identifier(path) {
    const { node, scope } = path;
    if (node.name === "undefined") {
      return undefined;
    }
    const $var = scope.$find(node.name);
    if ($var) {
      return $var.$get();
    } else {
      throw new ErrNotDefined(node.name);
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
  IfStatement(path) {
    const newScope = path.scope.$child("block");
    newScope.invasive = true;
    if (evaluate(path.$child(path.node.test, newScope))) {
      return evaluate(path.$child(path.node.consequent, newScope));
    } else if (path.node.alternate) {
      return evaluate(path.$child(path.node.alternate, newScope));
    }
  },
  EmptyStatement(path) {},
  BlockStatement(path) {
    const { node: block, scope } = path;
    // hoisting
    for (const node of block.body) {
      if (types.isFunctionDeclaration(node)) {
        evaluate(path.$child(node));
      } else if (types.isVariableDeclaration(node)) {
        for (const declaration of node.declarations) {
          if (node.kind === "var") {
            scope.$var((<types.Identifier>declaration.id).name, undefined);
          }
        }
      }
    }

    let new_scope = scope.invasive ? scope : scope.$child("block");
    let _result;
    for (const node of block.body) {
      const result = (_result = evaluate(path.$child(node, new_scope)));
      if (
        result === BREAK_SINGAL ||
        result === CONTINUE_SINGAL ||
        result === RETURN_SINGAL
      ) {
        return result;
      }
    }
    return _result;
  },
  WithStatement(path) {
    throw new ErrNotSupport(path.node.type);
  },
  DebuggerStatement(path) {
    debugger;
  },
  LabeledStatement(path) {
    throw new ErrNotSupport(path.node.type);
  },
  BreakStatement(path) {
    return BREAK_SINGAL;
  },
  ContinueStatement(path) {
    return CONTINUE_SINGAL;
  },
  ReturnStatement(path) {
    RETURN_SINGAL.result = path.node.argument
      ? evaluate(path.$child(path.node.argument))
      : undefined;
    return RETURN_SINGAL;
  },
  VariableDeclaration(path) {
    const { node, scope } = path;
    const kind = node.kind;

    for (const declaration of node.declarations) {
      const varKeyValueMap: string[] = [];
      let varName: string;
      let varValue: any;
      if (types.isIdentifier(declaration.id)) {
        varKeyValueMap[declaration.id.name] = declaration.init
          ? evaluate(path.$child(declaration.init))
          : undefined;
      } else if (types.isObjectPattern(declaration.id)) {
        // @es2015 destrucuring
        const vars: { key: string; alias: string }[] = [];
        declaration.id.properties.forEach(n => {
          if (types.isObjectProperty(n)) {
            vars.push({
              key: <string>(<any>n.key).name,
              alias: <string>(<any>n.value).name
            });
          }
        });
        const obj = evaluate(path.$child(declaration.init));

        for (let $var of vars) {
          if ($var.key in obj) {
            varKeyValueMap[$var.alias] = obj[$var.key];
          }
        }
      } else if (types.isArrayPattern(declaration.id)) {
        // @es2015 destrucuring
        // @flow
        declaration.id.elements.forEach((n, i) => {
          if (types.isIdentifier(n)) {
            const $varName: string = n.typeAnnotation
              ? (<any>n.typeAnnotation.typeAnnotation).id.name
              : n.name;

            if (types.isArrayExpression(declaration.init)) {
              const el = declaration.init.elements[i];
              if (!el) {
                varKeyValueMap[$varName] = undefined;
              } else {
                const result = evaluate(path.$child(el));
                varKeyValueMap[$varName] = result;
              }
            } else {
              throw node;
            }
          }
        });
      } else {
        throw node;
      }

      for (let varName in varKeyValueMap) {
        if (scope.invasive && kind === "var") {
          if (scope.parent) {
            scope.parent.$declar(kind, varName, varKeyValueMap[varName]);
          } else {
            scope.$declar(kind, varName, varKeyValueMap[varName]);
          }
        } else {
          scope.$declar(kind, varName, varKeyValueMap[varName]);
        }
      }
    }
  },
  VariableDeclarator: path => {
    const { node, scope } = path;
    // @es2015 destructuring
    if (types.isObjectPattern(node.id)) {
      const newScope = scope.$child("block");
      if (types.isObjectExpression(node.init)) {
        evaluate_map.ObjectExpression(path.$child(node.init, newScope));
      }
      node.id.properties.forEach(n => {
        if (types.isObjectProperty(n)) {
          const propertyName: string = (<any>n).id.name;
          const $var = newScope.$find(propertyName);
          const varValue = $var ? $var.$get() : undefined;
          scope.$var(propertyName, varValue);
          return varValue;
        }
      });
    } else if (types.isObjectExpression(node.init)) {
      const varName: string = (<types.Identifier>node.id).name;
      const varValue = evaluate(path.$child(node.init));
      scope.$var(varName, varValue);
      return varValue;
    } else {
      throw node;
    }
  },
  FunctionDeclaration(path) {
    const { node, scope } = path;
    const { name: func_name } = node.id;
    if (node.async === true) {
    } else if (node.generator) {
      const generatorFunc = function generatorFunc() {
        const __this = this;

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

          const r = evaluate(path.$child(block, path.scope, { next: next }));
          if (types.isReturnStatement(block)) {
            return [2, r.result];
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
      // function declartion can be duplicate
      scope.$var(func_name, generatorFunc);
    } else {
      const func = evaluate_map.FunctionExpression(path.$child(<any>node));
      Object.defineProperties(func, {
        length: {
          value: node.params.length
        },
        name: {
          value: func_name
        }
      });

      // function declartion can be duplicate
      scope.$var(func_name, func);
    }
  },
  ExpressionStatement(path) {
    return evaluate(path.$child(path.node.expression));
  },
  ForStatement(path) {
    const { node, scope } = path;

    // FIXME: for循环的作用域问题
    const newScope = scope.$child("loop").$setInvasive(true);

    newScope.invasive = true;
    newScope.redeclare = true;

    const _ = node.init ? evaluate(path.$child(node.init, newScope)) : null;

    for (;;) {
      if (node.test && !evaluate(path.$child(node.test, newScope))) {
        break;
      }

      const result = evaluate(path.$child(node.body, newScope));
      if (result === BREAK_SINGAL) {
        break;
      } else if (result === CONTINUE_SINGAL) {
        continue;
      } else if (result === RETURN_SINGAL) {
        return result;
      }
      node.update ? evaluate(path.$child(node.update, newScope)) : void 0;
    }
  },
  // @es2015 for of
  ForOfStatement(path) {
    const { node, scope } = path;
    const entity = evaluate(path.$child(node.right));
    // not support for of, it mean not support native for of
    if (typeof Symbol !== "undefined") {
      if (!entity || !entity[Symbol.iterator]) {
        // FIXME: how to get function name
        // for (let value of get()){}
        throw new ErrInvalidIterable((<types.Identifier>node.right).name);
      }
    }

    if (types.isVariableDeclaration(node.left)) {
      /**
       * for (let value in array){ // value should define in block scope
       *
       * }
       */
      const declarator: types.VariableDeclarator = node.left.declarations[0];
      const varName = (<types.Identifier>declarator.id).name;
      // typescript will compile it to for(){}
      for (let value of entity) {
        const newScope = scope.$child("loop");
        newScope.$declar(node.left.kind, varName, value); // define in current scope
        evaluate(path.$child(node.body, newScope));
      }
    } else if (types.isIdentifier(node.left)) {
      /**
       * for (value in array){  // value should define in parent scope
       *
       * }
       */
      const varName = node.left.name;
      for (let value of entity) {
        const newScope = scope.$child("loop");
        scope.$var(varName, value); // define in parent scope
        evaluate(path.$child(node.body, newScope));
      }
    }
  },
  ForInStatement(path) {
    const { node, scope } = path;
    const kind = (<types.VariableDeclaration>node.left).kind;
    const decl = (<types.VariableDeclaration>node.left).declarations[0];
    const name = (<types.Identifier>decl.id).name;

    for (const value in evaluate(path.$child(node.right))) {
      const new_scope = scope.$child("loop");
      new_scope.invasive = true;

      new_scope.$declar(kind, name, value);

      const result = evaluate(path.$child(node.body, new_scope));
      if (result === BREAK_SINGAL) {
        break;
      } else if (result === CONTINUE_SINGAL) {
        continue;
      } else if (result === RETURN_SINGAL) {
        return result;
      }
    }
  },
  DoWhileStatement(path) {
    const { node, scope } = path;
    // do while don't have his own scope
    do {
      const new_scope = scope.$child("loop");
      new_scope.invasive = true; // do while循环具有侵入性，定义var的时候，是覆盖父级变量
      const result = evaluate(path.$child(node.body, new_scope)); // 先把do的执行一遍
      if (result === BREAK_SINGAL) {
        break;
      } else if (result === CONTINUE_SINGAL) {
        continue;
      } else if (result === RETURN_SINGAL) {
        return result;
      }
    } while (evaluate(path.$child(node.test)));
  },
  WhileStatement(path) {
    const { node, scope } = path;
    while (evaluate(path.$child(node.test))) {
      const new_scope = scope.$child("loop");
      new_scope.invasive = true;
      const result = evaluate(path.$child(node.body, new_scope));

      if (result === BREAK_SINGAL) {
        break;
      } else if (result === CONTINUE_SINGAL) {
        continue;
      } else if (result === RETURN_SINGAL) {
        return result;
      }
    }
  },
  ThrowStatement(path) {
    throw evaluate(path.$child(path.node.argument));
  },
  CatchClause(path) {
    return evaluate(path.$child(path.node.body));
  },
  TryStatement(path) {
    const { node, scope } = path;
    try {
      const newScope = scope.$child("block");
      return evaluate(path.$child(node.block, newScope));
    } catch (err) {
      if (node.handler) {
        const param = <types.Identifier>node.handler.param;
        const new_scope = scope.$child("block");
        new_scope.invasive = true; // 标记为侵入式Scope，不用再多构造啦
        new_scope.$const(param.name, err);
        return evaluate(path.$child(node.handler, new_scope));
      } else {
        throw err;
      }
    } finally {
      if (node.finalizer) return evaluate(path.$child(node.finalizer));
    }
  },
  SwitchStatement(path) {
    const { node, scope } = path;
    const discriminant = evaluate(path.$child(node.discriminant)); // switch的条件
    const new_scope = scope.$child("switch");

    let matched = false;
    for (const $case of node.cases) {
      // 进行匹配相应的 case
      if (
        !matched &&
        (!$case.test ||
          discriminant === evaluate(path.$child($case.test, new_scope)))
      ) {
        matched = true;
      }

      if (matched) {
        const result = evaluate(path.$child($case, new_scope));

        if (result === BREAK_SINGAL) {
          break;
        } else if (result === CONTINUE_SINGAL || result === RETURN_SINGAL) {
          return result;
        }
      }
    }
  },
  SwitchCase(path) {
    const { node } = path;
    for (const stmt of node.consequent) {
      const result = evaluate(path.$child(stmt));
      if (
        result === BREAK_SINGAL ||
        result === CONTINUE_SINGAL ||
        result === RETURN_SINGAL
      ) {
        return result;
      }
    }
  },
  UpdateExpression(path) {
    const { node, scope } = path;
    const { prefix } = node;
    let $var;
    if (types.isIdentifier(node.argument)) {
      const { name } = node.argument;
      $var = scope.$find(name);
      if (!$var) throw `${name} 未定义`;
    } else if (types.isMemberExpression(node.argument)) {
      const argument = node.argument;
      const object = evaluate(path.$child(argument.object));
      let property = argument.computed
        ? evaluate(path.$child(argument.property))
        : (<types.Identifier>argument.property).name;
      $var = {
        $set(value: any) {
          object[property] = value;
          return true;
        },
        $get() {
          return object[property];
        }
      };
    }

    return {
      "--": v => ($var.$set(v - 1), prefix ? --v : v--),
      "++": v => ($var.$set(v + 1), prefix ? ++v : v++)
    }[node.operator](evaluate(path.$child(node.argument)));
  },
  ThisExpression(path) {
    const { scope } = path;

    // TODO: can not use this before super

    // let classBodyScope;
    // let tempScope = scope;

    // while (!classBodyScope) {
    //   if (!tempScope) break;
    //   if (tempScope.type === "class") {
    //     classBodyScope = tempScope;
    //   } else {
    //     if (!tempScope.parent) break;
    //     tempScope = tempScope.parent;
    //   }
    // }

    // if (classBodyScope) {
    //   const classContext = classBodyScope.$find("this");
    //   const thisExpressionContext = scope.$find("this");
    //   if (
    //     classContext &&
    //     thisExpressionContext &&
    //     classContext.$get() === thisExpressionContext.$get()
    //   ) {
    //     // this and class in same scope

    //     if (!classBodyScope.$find("@super")) {
    //       throw ErrNoSuper;
    //     }
    //   }
    // }

    const this_val = scope.$find("this");
    return this_val ? this_val.$get() : null;
  },
  ArrayExpression(path) {
    const { node } = path;
    let newArray: any[] = [];
    for (let item of node.elements) {
      if (item === null) {
        newArray.push(undefined);
      } else if (types.isSpreadElement(item)) {
        const arr = evaluate(path.$child(item));
        newArray = (<any[]>[]).concat(newArray, _toConsumableArray(arr));
      } else {
        newArray.push(evaluate(path.$child(item)));
      }
    }
    return newArray;
  },
  ObjectExpression(path) {
    const { node, scope } = path;
    let object = {};
    const newScope = scope.$child("block");
    const computedProperties: (
      | types.ObjectProperty
      | types.ObjectMethod)[] = [];

    for (const property of node.properties) {
      const _property = <types.ObjectMethod | types.ObjectProperty>property;
      if (_property.computed === true) {
        computedProperties.push(_property);
        continue;
      }
      evaluate(path.$child(property, newScope, { object }));
    }

    // eval the computed properties
    for (const property of computedProperties) {
      evaluate(path.$child(property, newScope, { object }));
    }

    return object;
  },
  ObjectProperty(path) {
    const { node, scope, ctx } = path;
    const { object } = ctx;
    const val = evaluate(path.$child(node.value));
    if (types.isIdentifier(node.key)) {
      object[node.key.name] = val;
      scope.$const(node.key.name, val);
    } else {
      object[evaluate(path.$child(node.key))] = val;
    }
  },
  ObjectMethod(path) {
    const { node, scope } = path;
    const methodName: string = !node.computed
      ? types.isIdentifier(node.key)
        ? node.key.name
        : evaluate(path.$child(node.key))
      : evaluate(path.$child(node.key));
    const method = function() {
      const _arguments = [].slice.call(arguments);
      const newScope = scope.$child("function");
      newScope.$const("this", this);
      // define argument
      node.params.forEach((param, i) => {
        if (types.isIdentifier(param)) {
          newScope.$const(param.name, _arguments[i]);
        } else {
          throw node;
        }
      });
      const result = evaluate(path.$child(node.body, newScope));
      return result.result ? result.result : result;
    };
    Object.defineProperties(method, {
      length: {
        value: node.params.length
      },
      name: {
        value: methodName
      }
    });
    switch (node.kind) {
      case "get":
        Object.defineProperty(path.ctx.object, methodName, { get: method });
        scope.$const(methodName, method);
        break;
      case "set":
        Object.defineProperty(path.ctx.object, methodName, { set: method });
        break;
      case "method":
        Object.defineProperty(path.ctx.object, methodName, { value: method });
        break;
      default:
        throw new Error("Invalid kind of property");
    }
  },
  FunctionExpression(path) {
    const { node, scope } = path;
    const func = function functionDeclaration(..._arguments) {
      const newScope = scope.$child("function");
      newScope.invasive = true;
      for (let i = 0; i < node.params.length; i++) {
        const param = node.params[i];
        if (types.isIdentifier(param)) {
          newScope.$const(param.name, _arguments[i]);
        } else if (types.isAssignmentPattern(param)) {
          // @es2015 default parameters
          evaluate(path.$child(param, newScope, { value: _arguments[i] }));
        } else if (types.isRestElement(param)) {
          // @es2015 rest parameters
          evaluate(
            path.$child(param, newScope, { value: _arguments.slice(i) })
          );
        }
      }
      newScope.$const("this", this);
      newScope.$const("arguments", arguments);
      const result = evaluate(path.$child(node.body, newScope));
      if (result === RETURN_SINGAL) {
        return result.result;
      }
    };

    Object.defineProperties(func, {
      length: {
        value: node.params.length
      },
      name: {
        value: node.id ? node.id.name : "" // Anonymous function
      }
    });

    return func;
  },
  BinaryExpression(path) {
    const { node } = path;
    return {
      "==": (a, b) => a == b,
      "!=": (a, b) => a != b,
      "===": (a, b) => a === b,
      "!==": (a, b) => a !== b,
      "<": (a, b) => a < b,
      "<=": (a, b) => a <= b,
      ">": (a, b) => a > b,
      ">=": (a, b) => a >= b,
      "<<": (a, b) => a << b,
      ">>": (a, b) => a >> b,
      ">>>": (a, b) => a >>> b,
      "+": (a, b) => a + b,
      "-": (a, b) => a - b,
      "*": (a, b) => a * b,
      "/": (a, b) => a / b,
      "%": (a, b) => a % b,
      "|": (a, b) => a | b,
      "^": (a, b) => a ^ b,
      "&": (a, b) => a & b,
      "**": (a, b) => Math.pow(a, b),
      in: (a, b) => a in b,
      instanceof: (a, b) => a instanceof b
    }[node.operator](
      evaluate(path.$child(node.left)),
      evaluate(path.$child(node.right))
    );
  },
  UnaryExpression(path) {
    const { node, scope } = path;
    return {
      "-": () => -evaluate(path.$child(node.argument)),
      "+": () => +evaluate(path.$child(node.argument)),
      "!": () => !evaluate(path.$child(node.argument)),
      "~": () => ~evaluate(path.$child(node.argument)),
      void: () => void evaluate(path.$child(node.argument)),
      typeof: () => {
        if (types.isIdentifier(node.argument)) {
          const $var = scope.$find(node.argument.name);
          return $var ? typeof $var.$get() : "undefined";
        } else {
          return typeof evaluate(path.$child(node.argument));
        }
      },
      delete: () => {
        if (types.isMemberExpression(node.argument)) {
          const { object, property, computed } = node.argument;
          if (computed) {
            return delete evaluate(path.$child(object))[
              evaluate(path.$child(property))
            ];
          } else {
            return delete evaluate(path.$child(object))[
              (<types.Identifier>property).name
            ];
          }
        } else if (types.isIdentifier(node.argument)) {
          const $this = scope.$find("this");
          if ($this) return $this.$get()[node.argument.name];
        }
      }
    }[node.operator]();
  },

  CallExpression(path) {
    const { node, scope } = path;
    const func = evaluate(path.$child(node.callee));
    const args = node.arguments.map(arg => evaluate(path.$child(arg)));

    if (types.isMemberExpression(node.callee)) {
      const object = evaluate(path.$child(node.callee.object));
      return func.apply(object, args);
    } else {
      const this_val = scope.$find("this");
      return func.apply(this_val ? this_val.$get() : null, args);
    }
  },
  MemberExpression(path) {
    const { node, scope, ctx } = path;
    const { object, property, computed } = node;

    const propertyName: string = computed
      ? evaluate(path.$child(property))
      : (<types.Identifier>property).name;

    const obj = evaluate(path.$child(object));
    const target = obj[propertyName];

    return typeof target === "function" ? target.bind(obj) : target;
  },
  AssignmentExpression(path) {
    const { node, scope } = path;
    let $var: {
      kind: Kind;
      $set(value: any): boolean;
      $get(): any;
    };

    if (types.isIdentifier(node.left)) {
      const { name } = node.left;
      const $var_or_not = scope.$find(name);
      if (!$var_or_not) {
        // here to define global var
        const globalScope = scope.$global;
        globalScope.$var(name, evaluate(path.$child(node.right)));
        const globalVar = globalScope.$find(name);
        if (globalVar) {
          $var = globalVar;
        } else {
          throw new ErrNotDefined(name);
        }
      } else {
        $var = <ScopeVar>$var_or_not;
        /**
         * const test = 123;
         * test = 321 // it should throw an error
         */
        if ($var.kind === "const") {
          throw new TypeError("Assignment to constant variable.");
        }
      }
    } else if (types.isMemberExpression(node.left)) {
      const left = node.left;
      const object: any = evaluate(path.$child(left.object));
      const property: string = left.computed
        ? evaluate(path.$child(left.property))
        : (<types.Identifier>left.property).name;
      $var = {
        kind: "var",
        $set(value: any) {
          object[property] = value;
          return true;
        },
        $get() {
          return object[property];
        }
      };
    } else {
      throw new ErrUnexpectedToken();
    }

    return {
      "=": v => ($var.$set(v), v),
      "+=": v => ($var.$set($var.$get() + v), $var.$get()),
      "-=": v => ($var.$set($var.$get() - v), $var.$get()),
      "*=": v => ($var.$set($var.$get() * v), $var.$get()),
      "/=": v => ($var.$set($var.$get() / v), $var.$get()),
      "%=": v => ($var.$set($var.$get() % v), $var.$get()),
      "<<=": v => ($var.$set($var.$get() << v), $var.$get()),
      ">>=": v => ($var.$set($var.$get() >> v), $var.$get()),
      ">>>=": v => ($var.$set($var.$get() >>> v), $var.$get()),
      "|=": v => ($var.$set($var.$get() | v), $var.$get()),
      "^=": v => ($var.$set($var.$get() ^ v), $var.$get()),
      "&=": v => ($var.$set($var.$get() & v), $var.$get())
    }[node.operator](evaluate(path.$child(node.right)));
  },
  LogicalExpression(path) {
    const { node } = path;
    return {
      "||": () =>
        evaluate(path.$child(node.left)) || evaluate(path.$child(node.right)),
      "&&": () =>
        evaluate(path.$child(node.left)) && evaluate(path.$child(node.right))
    }[node.operator]();
  },
  ConditionalExpression(path) {
    return evaluate(path.$child(path.node.test))
      ? evaluate(path.$child(path.node.consequent))
      : evaluate(path.$child(path.node.alternate));
  },
  NewExpression(path) {
    const { node } = path;
    const func = evaluate(path.$child(node.callee));
    Object.defineProperty(func, "length", { value: node.arguments.length });
    const args = node.arguments.map(arg => evaluate(path.$child(arg)));
    return new (func.bind.apply(func, [null].concat(args)))();
  },

  // ES2015
  ArrowFunctionExpression(path) {
    const { node, scope } = path;
    const func = function(...args) {
      const new_scope = scope.$child("function");
      for (let i = 0; i < node.params.length; i++) {
        const { name } = <types.Identifier>node.params[i];
        new_scope.$const(name, args[i]);
      }

      const lastThis = scope.$find("this");

      new_scope.$const("this", lastThis ? lastThis.$get() : null);
      new_scope.$const("arguments", arguments);
      const result = evaluate(path.$child(node.body, new_scope));

      if (result === RETURN_SINGAL) {
        return result.result;
      } else {
        return result;
      }
    };

    Object.defineProperties(func, {
      length: { value: node.params.length },
      name: { value: node.id ? node.id.name : "" }
    });

    return func;
  },
  TemplateLiteral(path) {
    const { node } = path;
    return (<types.Node[]>[])
      .concat(node.expressions, node.quasis)
      .sort((a, b) => a.start - b.start)
      .map(element => evaluate(path.$child(element)))
      .join("");
  },
  TemplateElement(path) {
    return path.node.value.raw;
  },
  ClassDeclaration(path) {
    const ClassConstructor = evaluate(
      path.$child(path.node.body, path.scope.$child("class"))
    );
    path.scope.$const(path.node.id.name, ClassConstructor);
  },
  ClassBody(path) {
    const { node, scope } = path;
    const constructor: types.ClassMethod | void = <types.ClassMethod | void>node.body.find(
      n => types.isClassMethod(n) && n.kind === "constructor"
    );
    const methods: types.ClassMethod[] = <types.ClassMethod[]>node.body.filter(
      n => types.isClassMethod(n) && n.kind !== "constructor"
    );
    const properties: types.ClassProperty[] = <types.ClassProperty[]>node.body.filter(
      n => types.isClassProperty(n)
    );

    const parentNode = (<Path<types.ClassDeclaration>>path.parent).node;

    const Class = (function(SuperClass) {
      if (SuperClass) {
        _inherits(Class, SuperClass);
      }

      function Class(...args) {
        _classCallCheck(this, Class);
        const classScope = scope.$child("function");
        classScope.$var("this", this);

        // define class property
        properties.forEach(p => {
          this[p.key.name] = evaluate(path.$child(p.value, classScope));
        });

        if (constructor) {
          // defined the params
          constructor.params.forEach((p: types.LVal, i) => {
            if (types.isIdentifier(p)) {
              classScope.$const(p.name, args[i]);
            } else {
              throw new Error("Invalid params");
            }
          });
          constructor.body.body.forEach(n =>
            evaluate(
              path.$child(n, classScope, {
                SuperClass,
                ClassConstructor: Class,
                ClassConstructorArguments: args,
                ClassEntity: this
              })
            )
          );

          if (parentNode.superClass) {
            // if not apply super in construtor
            // FIXME: should define the var in private scope
            if (!scope.$find("@super")) {
              throw ErrNoSuper;
            }
          }
        } else {
          // apply super
          _possibleConstructorReturn(
            this,
            ((<any>Class).__proto__ || Object.getPrototypeOf(Class)).apply(
              this,
              args
            )
          );
          scope.$const("@super", true);
        }

        return this;
      }

      // define class name
      Object.defineProperties(Class, {
        name: { value: parentNode.id.name },
        length: { value: constructor ? constructor.params.length : 0 }
      });

      const _methods = methods
        .map((method: types.ClassMethod) => {
          const newScope = scope.$child("function");
          const func = function(...args) {
            newScope.$var("this", this);

            // defined the params
            method.params.forEach((p: types.LVal, i) => {
              if (types.isIdentifier(p)) {
                newScope.$const(p.name, args[i]);
              }
            });

            const result = evaluate(
              path.$child(method.body, newScope, {
                SuperClass,
                ClassConstructor: Class,
                ClassMethodArguments: args,
                ClassEntity: this
              })
            );
            if (result === RETURN_SINGAL) {
              return result.result ? result.result : result;
            } else {
              return result;
            }
          };

          Object.defineProperty(func, "length", {
            value: method.params.length
          });

          return {
            key: (<any>method.key).name,
            [method.kind === "method" ? "value" : method.kind]: func
          };
        })
        .concat([
          {
            key: "constructor",
            value: Class
          }
        ]);

      // define clsss methods
      _createClass(Class, _methods);

      return Class;
    })(
      parentNode.superClass
        ? (() => {
            const $var = scope.$find((<any>parentNode.superClass).name);
            return $var ? $var.$get() : null;
          })()
        : null
    );

    return Class;
  },
  ClassMethod(path) {
    return evaluate(path.$child(path.node.body));
  },
  ClassExpression(path) {},
  Super(path) {
    const { scope, ctx } = path;
    const {
      SuperClass,
      ClassConstructor,
      ClassConstructorArguments,
      ClassEntity
    } = ctx;
    const ClassBodyPath = path.$findParent("ClassBody");
    // make sure it include in ClassDeclaration
    if (!ClassBodyPath) {
      throw new Error("super() only can use in ClassDeclaration");
    }
    const parentPath = path.parent;
    if (parentPath) {
      // super()
      if (types.isCallExpression(parentPath.node)) {
        return function inherits(...args) {
          _possibleConstructorReturn(
            ClassEntity,
            (
              (<any>ClassConstructor).__proto__ ||
              Object.getPrototypeOf(ClassConstructor)
            ).apply(ClassEntity, args)
          );
          ClassBodyPath.scope.$const("@super", true);
        }.bind(ClassEntity);
      } else if (types.isMemberExpression(parentPath.node)) {
        // super.eat()
        // then return the superclass prototype
        return SuperClass.prototype;
      }
    }
  },
  SpreadElement(path) {
    return evaluate(path.$child(path.node.argument));
  },
  // @experimental Object rest spread
  SpreadProperty(path) {
    const { node, ctx } = path;
    const { object } = ctx;
    Object.assign(object, evaluate(path.$child(node.argument)));
  },
  ImportDeclaration(path) {
    const { node, scope } = path;
    let defaultImport: string = ""; // default import object
    const otherImport: string[] = []; // import property
    const moduleNane: string = evaluate(path.$child(node.source));
    node.specifiers.forEach(n => {
      if (types.isImportDefaultSpecifier(n)) {
        defaultImport = evaluate_map.ImportDefaultSpecifier(path.$child(n));
      } else if (types.isImportSpecifier(n)) {
        otherImport.push(evaluate_map.ImportSpecifier(path.$child(n)));
      } else {
        throw n;
      }
    });

    const _require = scope.$find("require");

    if (_require) {
      const requireFunc = _require.$get();

      const targetModle: any = requireFunc(moduleNane) || {};

      if (defaultImport) {
        scope.$const(
          defaultImport,
          targetModle.default ? targetModle.default : targetModle
        );
      }

      otherImport.forEach((varName: string) => {
        scope.$const(varName, targetModle[varName]);
      });
    }
  },
  ImportDefaultSpecifier(path) {
    return path.node.local.name;
  },
  ImportSpecifier(path) {
    return path.node.local.name;
  },
  ExportDefaultDeclaration(path) {
    const { node, scope } = path;
    const moduleVar = scope.$find("module");
    if (moduleVar) {
      const moduleObject = moduleVar.$get();
      moduleObject.exports = {
        ...moduleObject.exports,
        ...evaluate(path.$child(node.declaration))
      };
    }
  },
  ExportNamedDeclaration(path) {
    const { node } = path;
    node.specifiers.forEach(n => evaluate(path.$child(n)));
  },
  ExportSpecifier(path) {
    const { node, scope } = path;
    const moduleVar = scope.$find("module");
    if (moduleVar) {
      const moduleObject = moduleVar.$get();
      moduleObject.exports[node.local.name] = evaluate(path.$child(node.local));
    }
  },
  AssignmentPattern(path) {
    const { node, scope, ctx } = path;
    const { value } = ctx;
    scope.$const(
      node.left.name,
      value === undefined ? evaluate(path.$child(node.right)) : value
    );
  },
  RestElement(path) {
    const { node, scope, ctx } = path;
    const { value } = ctx;
    scope.$const((<types.Identifier>node.argument).name, value);
  },
  YieldExpression(path) {
    const { next } = path.ctx;
    next(evaluate(path.$child(path.node.argument))); // call next
  },
  SequenceExpression(path) {},
  TaggedTemplateExpression(path) {
    const string = path.node.quasi.quasis.map(v => v.value.cooked);
    const raw = path.node.quasi.quasis.map(v => v.value.raw);
    const _templateObject = _taggedTemplateLiteral(string, raw);
    const func = evaluate(path.$child(path.node.tag));
    const expressionResultList =
      path.node.quasi.expressions.map(n => evaluate(path.$child(n))) || [];
    return func(_templateObject, ...expressionResultList);
  },
  MetaProperty(path) {},
  AwaitExpression(path) {},
  DoExpression(path) {
    return evaluate(path.$child(path.node.body));
  }
};

export default function evaluate(path: Path<types.Node>) {
  const _evalute: EvaluateFunc = evaluate_map[path.node.type];
  if (!_evalute) {
    throw new Error(`Unknown visitors of ${path.node.type}`);
  }
  return _evalute(path);
}
