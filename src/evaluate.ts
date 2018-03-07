import * as types from "babel-types";
import {
  ErrNotDefined,
  ErrNotSupport,
  ErrDuplicateDeclard,
  ErrUnexpectedToken
} from "./error";
import {Scope, ScopeVar, Kind} from "./scope";
import {
  _classCallCheck,
  _createClass,
  _possibleConstructorReturn,
  _inherits,
  _toConsumableArray
} from "./runtime";

const BREAK_SINGAL: {} = {};
const CONTINUE_SINGAL: {} = {};
const RETURN_SINGAL: {result: any} = {result: undefined};

const evaluate_map = {
  File(node: types.File, scope: Scope, arg) {
    evaluate(node.program, scope, arg);
  },
  Program(program: types.Program, scope: Scope, arg) {
    // hoisting
    for (const node of program.body) {
      if (types.isFunctionDeclaration(node)) {
        evaluate(node, scope, arg);
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
        evaluate(node, scope, arg);
      }
    }
  },

  Identifier(node: types.Identifier, scope: Scope) {
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
  RegExpLiteral(node: types.RegExpLiteral, scope: Scope) {
    return new RegExp(node.pattern, node.flags);
  },
  StringLiteral(node: types.StringLiteral, scope: Scope) {
    return node.value;
  },
  NumericLiteral(node: types.NumericLiteral, scope: Scope) {
    return node.value;
  },
  BooleanLiteral(node: types.BooleanLiteral, scope: Scope) {
    return node.value;
  },
  IfStatement(node: types.IfStatement, scope: Scope, arg) {
    if (evaluate(node.test, scope, arg)) {
      return evaluate(node.consequent, scope, arg);
    } else if (node.alternate) {
      return evaluate(node.alternate, scope, arg);
    }
  },
  EmptyStatement(node: types.EmptyStatement, scope: Scope) {},
  BlockStatement(block: types.BlockStatement, scope: Scope, arg) {
    // hoisting
    for (const node of block.body) {
      if (types.isFunctionDeclaration(node)) {
        evaluate(node, scope, arg);
      } else if (types.isVariableDeclaration(node)) {
        for (const declaration of node.declarations) {
          if (node.kind === "var") {
            scope.$var((<types.Identifier>declaration.id).name, undefined);
          }
        }
      }
    }

    let new_scope = scope.invasived ? scope : scope.$child("block");
    for (const node of block.body) {
      const result = evaluate(node, new_scope, arg);
      if (
        result === BREAK_SINGAL ||
        result === CONTINUE_SINGAL ||
        result === RETURN_SINGAL
      ) {
        return result;
      }
    }
  },
  WithStatement(node: types.WithStatement, scope: Scope) {
    throw new ErrNotSupport("with");
  },
  DebuggerStatement(node: types.DebuggerStatement, scope: Scope) {
    debugger;
  },
  LabeledStatement(node: types.LabeledStatement, scope: Scope) {
    `${node.type} 未实现`;
  },

  BreakStatement(node: types.BreakStatement, scope: Scope) {
    return BREAK_SINGAL;
  },
  ContinueStatement(node: types.ContinueStatement, scope: Scope) {
    return CONTINUE_SINGAL;
  },
  ReturnStatement(node: types.ReturnStatement, scope: Scope, arg) {
    RETURN_SINGAL.result = node.argument
      ? evaluate(node.argument, scope, arg)
      : undefined;
    return RETURN_SINGAL;
  },
  VariableDeclaration(node: types.VariableDeclaration, scope: Scope, arg) {
    const kind = node.kind;
    for (const declartor of node.declarations) {
      if (types.isIdentifier(declartor.id)) {
        const {name} = declartor.id;
        const value = declartor.init
          ? evaluate(declartor.init, scope, arg)
          : undefined;
        if (!scope.$declar(kind, name, value)) {
          throw new ErrDuplicateDeclard(name);
        }
      } else if (types.isObjectPattern(declartor.id)) {
        // @es2015 destrucuring
        const vars: {key: string; alias: string}[] = [];
        declartor.id.properties.forEach(n => {
          if (types.isObjectProperty(n)) {
            vars.push({
              key: <string>(<any>n.key).name,
              alias: <string>(<any>n.value).name
            });
          }
        });
        const obj = evaluate(declartor.init, scope, arg);

        for (let $var of vars) {
          if ($var.key in obj) {
            scope.$declar(kind, $var.alias, obj[$var.key]);
          }
        }
      } else if (types.isArrayPattern(declartor.id)) {
        // @es2015 destrucuring
        // @flow
        declartor.id.elements.forEach((n, i) => {
          if (types.isIdentifier(n)) {
            const $varName: string = n.typeAnnotation
              ? (<any>n.typeAnnotation.typeAnnotation).id.name
              : n.name;

            if (types.isArrayExpression(declartor.init)) {
              const el = declartor.init.elements[i];
              if (!el) {
                scope.$declar(kind, $varName, undefined);
              } else {
                scope.$declar(kind, $varName, evaluate(el, scope, arg));
              }
            } else {
              throw node;
            }
          }
        });
      } else {
        throw node;
      }
    }
  },
  VariableDeclarator: (node: types.VariableDeclarator, scope: Scope, arg) => {
    // @es2015 destructuring
    if (types.isObjectPattern(node.id)) {
      const newScope = scope.$child("block");
      if (types.isObjectExpression(node.init)) {
        evaluate_map.ObjectExpression(node.init, newScope, arg);
      }
      node.id.properties.forEach(n => {
        if (types.isObjectProperty(n)) {
          const propertyName: string = (<any>n).id.name;
          const $var = newScope.$find(propertyName);
          scope.$var(propertyName, $var ? $var.$get() : undefined);
        }
      });
    } else if (types.isObjectExpression(node.init)) {
      const varName: string = (<types.Identifier>node.id).name;
      scope.$var(varName, evaluate_map.ObjectExpression(node.init, scope, arg));
    } else {
      throw node;
    }
  },
  FunctionDeclaration(node: types.FunctionDeclaration, scope: Scope, arg) {
    if (node.async === true) {
    } else {
      const func = evaluate_map.FunctionExpression(<any>node, scope, arg);
      const {name: func_name} = node.id;

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
  ExpressionStatement(node: types.ExpressionStatement, scope: Scope, arg) {
    evaluate(node.expression, scope, arg);
  },
  ForStatement(node: types.ForStatement, scope: Scope, arg) {
    for (
      const new_scope = scope.$child("loop"),
        _ = node.init ? evaluate(node.init, new_scope, arg) : null;
      node.test ? evaluate(node.test, new_scope, arg) : true;
      node.update ? evaluate(node.update, new_scope, arg) : void 0
    ) {
      const result = evaluate(node.body, new_scope, arg);
      if (result === BREAK_SINGAL) {
        break;
      } else if (result === CONTINUE_SINGAL) {
        continue;
      } else if (result === RETURN_SINGAL) {
        return result;
      }
    }
  },
  ForInStatement: (node: types.ForInStatement, scope: Scope, arg) => {
    const kind = (<types.VariableDeclaration>node.left).kind;
    const decl = (<types.VariableDeclaration>node.left).declarations[0];
    const name = (<types.Identifier>decl.id).name;

    for (const value in evaluate(node.right, scope, arg)) {
      const new_scope = scope.$child("loop");
      new_scope.invasived = true;

      new_scope.$declar(kind, name, value);

      const result = evaluate(node.body, new_scope, arg);
      if (result === BREAK_SINGAL) {
        break;
      } else if (result === CONTINUE_SINGAL) {
        continue;
      } else if (result === RETURN_SINGAL) {
        return result;
      }
    }
  },
  DoWhileStatement(node: types.DoWhileStatement, scope: Scope, arg) {
    do {
      const new_scope = scope.$child("loop");
      new_scope.invasived = true;
      const result = evaluate(node.body, new_scope, arg); // 先把do的执行一遍
      if (result === BREAK_SINGAL) {
        break;
      } else if (result === CONTINUE_SINGAL) {
        continue;
      } else if (result === RETURN_SINGAL) {
        return result;
      }
    } while (evaluate(node.test, scope, arg));
  },
  WhileStatement(node: types.WhileStatement, scope: Scope, arg) {
    while (evaluate(node.test, scope, arg)) {
      const new_scope = scope.$child("loop");
      new_scope.invasived = true;
      const result = evaluate(node.body, new_scope, arg);

      if (result === BREAK_SINGAL) {
        break;
      } else if (result === CONTINUE_SINGAL) {
        continue;
      } else if (result === RETURN_SINGAL) {
        return result;
      }
    }
  },
  ThrowStatement(node: types.ThrowStatement, scope: Scope, arg) {
    throw evaluate(node.argument, scope, arg);
  },
  CatchClause(node: types.CatchClause, scope, Scope, arg) {
    return evaluate(node.body, scope, arg);
  },
  TryStatement(node: types.TryStatement, scope: Scope, arg) {
    try {
      const newScope = scope.$child("block");
      return evaluate(node.block, newScope, arg);
    } catch (err) {
      if (node.handler) {
        const param = <types.Identifier>node.handler.param;
        const new_scope = scope.$child("block");
        new_scope.invasived = true; // 标记为侵入式Scope，不用再多构造啦
        new_scope.$const(param.name, err);
        return evaluate(node.handler, new_scope, arg);
      } else {
        throw err;
      }
    } finally {
      if (node.finalizer) return evaluate(node.finalizer, scope, arg);
    }
  },
  SwitchStatement(node: types.SwitchStatement, scope: Scope, arg) {
    const discriminant = evaluate(node.discriminant, scope, arg); // switch的条件
    const new_scope = scope.$child("switch");

    let matched = false;
    for (const $case of node.cases) {
      // 进行匹配相应的 case
      if (
        !matched &&
        (!$case.test || discriminant === evaluate($case.test, new_scope, arg))
      ) {
        matched = true;
      }

      if (matched) {
        const result = evaluate($case, new_scope, arg);

        if (result === BREAK_SINGAL) {
          break;
        } else if (result === CONTINUE_SINGAL || result === RETURN_SINGAL) {
          return result;
        }
      }
    }
  },
  SwitchCase: (node: types.SwitchCase, scope: Scope, arg) => {
    for (const stmt of node.consequent) {
      const result = evaluate(stmt, scope, arg);
      if (
        result === BREAK_SINGAL ||
        result === CONTINUE_SINGAL ||
        result === RETURN_SINGAL
      ) {
        return result;
      }
    }
  },
  UpdateExpression(node: types.UpdateExpression, scope: Scope, arg) {
    const {prefix} = node;
    let $var;
    if (types.isIdentifier(node.argument)) {
      const {name} = node.argument;
      $var = scope.$find(name);
      if (!$var) throw `${name} 未定义`;
    } else if (types.isMemberExpression(node.argument)) {
      const argument = node.argument;
      const object = evaluate(argument.object, scope, arg);
      let property = argument.computed
        ? evaluate(argument.property, scope, arg)
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
    }[node.operator](evaluate(node.argument, scope, arg));
  },
  ThisExpression(node: types.ThisExpression, scope: Scope) {
    const this_val = scope.$find("this");
    return this_val ? this_val.$get() : null;
  },
  ArrayExpression(node: types.ArrayExpression, scope: Scope, arg) {
    let newArray: any[] = [];
    node.elements.forEach(item => {
      if (types.isSpreadElement(item)) {
        const arr = evaluate(item, scope, arg);
        newArray = (<any[]>[]).concat(newArray, _toConsumableArray(arr));
      } else {
        newArray.push(evaluate(item, scope, arg));
      }
    });
    return newArray;
  },
  ObjectExpression(node: types.ObjectExpression, scope: Scope, arg) {
    let object = {};
    const newScope = scope.$child("block");
    const computedProperties: (
      | types.ObjectProperty
      | types.ObjectMethod)[] = [];

    const newArg = {...arg, ...{object}};

    for (const property of node.properties) {
      const _property = <types.ObjectMethod | types.ObjectProperty>property;
      if (_property.computed === true) {
        computedProperties.push(_property);
        continue;
      }
      evaluate(property, newScope, newArg);
    }

    // eval the computed properties
    for (const property of computedProperties) {
      evaluate(property, newScope, newArg);
    }

    return object;
  },
  ObjectProperty(node: types.ObjectProperty, scope: Scope, arg) {
    const {object} = arg;
    const val = evaluate(node.value, scope, arg);
    if (types.isIdentifier(node.key)) {
      object[node.key.name] = val;
      scope.$const(node.key.name, val);
    } else {
      object[evaluate(node.key, scope, arg)] = val;
    }
  },
  ObjectMethod(node: types.ObjectMethod, scope: Scope, arg) {
    const key = evaluate(node.key, scope, arg);
    const val = function() {
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
      const result = evaluate(node.body, newScope, arg);
      return result.result ? result.result : result;
    };
    Object.defineProperty(val, "length", {value: node.params.length});
    switch (node.kind) {
      case "get":
        Object.defineProperty(arg.object, key, {get: val});
        scope.$const(key, val);
        break;
      case "set":
        Object.defineProperty(arg.object, key, {set: val});
        break;
      case "method":
        break;
      default:
        throw new Error("Invalid kind of property");
    }
  },
  FunctionExpression(node: types.FunctionExpression, scope: Scope, arg) {
    const func = function(...args) {
      const new_scope = scope.$child("function");
      new_scope.invasived = true;
      for (let i = 0; i < node.params.length; i++) {
        const {name} = <types.Identifier>node.params[i];
        new_scope.$const(name, args[i]);
      }
      new_scope.$const("this", this);
      new_scope.$const("arguments", arguments);
      const result = evaluate(node.body, new_scope, arg);
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
  BinaryExpression(node: types.BinaryExpression, scope: Scope, arg) {
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
      in: (a, b) => a in b,
      instanceof: (a, b) => a instanceof b
    }[node.operator](
      evaluate(node.left, scope, arg),
      evaluate(node.right, scope, arg)
    );
  },
  UnaryExpression(node: types.UnaryExpression, scope: Scope, arg) {
    return {
      "-": () => -evaluate(node.argument, scope, arg),
      "+": () => +evaluate(node.argument, scope, arg),
      "!": () => !evaluate(node.argument, scope, arg),
      "~": () => ~evaluate(node.argument, scope, arg),
      void: () => void evaluate(node.argument, scope, arg),
      typeof: () => {
        if (types.isIdentifier(node.argument)) {
          const $var = scope.$find(node.argument.name);
          return $var ? typeof $var.$get() : "undefined";
        } else {
          return typeof evaluate(node.argument, scope, arg);
        }
      },
      delete: () => {
        if (types.isMemberExpression(node.argument)) {
          const {object, property, computed} = node.argument;
          if (computed) {
            return delete evaluate(object, scope, arg)[
              evaluate(property, scope, arg)
            ];
          } else {
            return delete evaluate(object, scope, arg)[
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

  CallExpression(node: types.CallExpression, scope: Scope, arg) {
    const func = evaluate(node.callee, scope, arg);
    const args = node.arguments.map(arg => evaluate(arg, scope, arg));

    if (types.isMemberExpression(node.callee)) {
      const object = evaluate(node.callee.object, scope, arg);
      return func.apply(object, args);
    } else {
      const this_val = scope.$find("this");
      return func.apply(this_val ? this_val.$get() : null, args);
    }
  },
  MemberExpression(node: types.MemberExpression, scope: Scope, arg) {
    const {object, property, computed} = node;
    if (types.isSuper(node.object)) {
      const $var = scope.$find("this");
      if ($var) {
        const __this = $var.$get();
        if (arg.SuperClass) {
          return arg.SuperClass.prototype[(<any>property).name].bind(__this);
        } else {
          throw node;
        }
      }
    }
    if (computed) {
      return evaluate(object, scope, arg)[evaluate(property, scope, arg)];
    } else {
      return evaluate(object, scope, arg)[(<types.Identifier>property).name];
    }
  },
  AssignmentExpression(node: types.AssignmentExpression, scope: Scope, arg) {
    let $var: {
      kind: Kind;
      $set(value: any): boolean;
      $get(): any;
    };

    if (types.isIdentifier(node.left)) {
      const {name} = node.left;
      const $var_or_not = scope.$find(name);
      if (!$var_or_not) {
        // here to define global var
        const globalScope = scope.$global;
        globalScope.$var(name, evaluate(node.right, scope, arg));
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
      const object: any = evaluate(left.object, scope, arg);
      const property: string = left.computed
        ? evaluate(left.property, scope, arg)
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
    }[node.operator](evaluate(node.right, scope, arg));
  },
  LogicalExpression(node: types.LogicalExpression, scope: Scope, arg) {
    return {
      "||": () =>
        evaluate(node.left, scope, arg) || evaluate(node.right, scope, arg),
      "&&": () =>
        evaluate(node.left, scope, arg) && evaluate(node.right, scope, arg)
    }[node.operator]();
  },
  ConditionalExpression(node: types.ConditionalExpression, scope: Scope, arg) {
    return evaluate(node.test, scope, arg)
      ? evaluate(node.consequent, scope, arg)
      : evaluate(node.alternate, scope, arg);
  },
  NewExpression(node: types.NewExpression, scope: Scope, arg) {
    const func = evaluate(node.callee, scope, arg);
    Object.defineProperty(func, "length", {value: node.arguments.length});
    const args = node.arguments.map(arg => evaluate(arg, scope, arg));
    return new (func.bind.apply(func, [null].concat(args)))();
  },

  // ES2015
  ArrowFunctionExpression(
    node: types.ArrowFunctionExpression,
    scope: Scope,
    arg
  ) {
    const func = function(...args) {
      const new_scope = scope.$child("function");
      new_scope.invasived = true;
      for (let i = 0; i < node.params.length; i++) {
        const {name} = <types.Identifier>node.params[i];
        new_scope.$const(name, args[i]);
      }

      const lastThis = scope.$find("this");

      new_scope.$const("this", lastThis ? lastThis.$get() : null);
      new_scope.$const("arguments", arguments);
      const result = evaluate(node.body, new_scope, arg);

      if (result === RETURN_SINGAL) {
        return result.result;
      } else {
        return result;
      }
    };

    Object.defineProperty(func, "length", {value: node.params.length});

    return func;
  },
  TemplateLiteral(node: types.TemplateLiteral, scope: Scope, arg) {
    return (<types.Node[]>[])
      .concat(node.expressions, node.quasis)
      .sort((a, b) => a.start - b.start)
      .map(element => evaluate(element, scope, arg))
      .join("");
  },
  TemplateElement(node: types.TemplateElement, scope: Scope) {
    return node.value.raw;
  },
  ClassDeclaration(node: types.ClassDeclaration, scope: Scope, arg) {
    const constructor: types.ClassMethod | void = <types.ClassMethod | void>node.body.body.find(
      n => types.isClassMethod(n) && n.kind === "constructor"
    );
    const methods: types.ClassMethod[] = <types.ClassMethod[]>node.body.body.filter(
      n => types.isClassMethod(n) && n.kind !== "constructor"
    );
    const properties: types.ClassProperty[] = <types.ClassProperty[]>node.body.body.filter(
      n => types.isClassProperty(n)
    );

    let SuperClass;

    if (node.superClass) {
      const superClassName: string = (<any>node.superClass).name;
      const $var = scope.$find(superClassName);

      if ($var) {
        SuperClass = $var.$get();
      } else {
        throw new ErrNotDefined(superClassName);
      }
    }

    const Class = (function(SuperClass) {
      if (SuperClass) {
        _inherits(Class, SuperClass);
      }
      function Class(...args) {
        _classCallCheck(this, Class);

        const newScope = scope.$child("function");

        // babel way to call super();
        const __this = _possibleConstructorReturn(
          this,
          ((<any>Class).__proto__ || Object.getPrototypeOf(Class)).apply(
            this,
            args
          )
        );

        newScope.$const("super", this.__proto__);

        // typescript way to call super()
        // const __this = superClass ? superClass.apply(this, args) || this : this;

        newScope.$const("this", __this);

        // define class property
        properties.forEach(p => {
          __this[p.key.name] = evaluate(p.value, newScope, arg);
        });

        if (constructor) {
          // defined the params
          constructor.params.forEach((p: types.LVal, i) => {
            if (types.isIdentifier(p)) {
              newScope.$const(p.name, args[i]);
            } else {
              throw new Error("Invalid params");
            }
          });

          evaluate(constructor, newScope, {SuperClass});
        }

        return __this;
      }

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

            const result = evaluate(method.body, newScope, {SuperClass});
            if (result === RETURN_SINGAL) {
              return result.result ? result.result : result;
            } else {
              return result;
            }
          };

          Object.defineProperty(func, "length", {value: method.params.length});

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
    })(SuperClass);

    scope.$const(node.id.name, Class);
  },
  ClassMethod(node: types.ClassMethod, scope: Scope, arg) {
    return evaluate(node.body, scope, arg);
  },
  Super(node: types.Super, scope: Scope) {
    return function() {};
  },
  SpreadElement(node: types.SpreadElement, scope: Scope, arg) {
    return evaluate(node.argument, scope, arg);
  },
  // @experimental Object rest spread
  SpreadProperty(node: types.SpreadProperty, scope: Scope, arg) {
    const {object} = arg;
    Object.assign(object, evaluate(node.argument, scope, arg));
  },
  ImportDeclaration(node: types.ImportDeclaration, scope: Scope, arg) {
    let defaultImport: string = ""; // default import object
    const otherImport: string[] = []; // import property
    const moduleNane: string = evaluate(node.source, scope, arg);
    node.specifiers.forEach(n => {
      if (types.isImportDefaultSpecifier(n)) {
        defaultImport = evaluate_map.ImportDefaultSpecifier(n, scope, arg);
      } else if (types.isImportSpecifier(n)) {
        otherImport.push(evaluate_map.ImportSpecifier(n, scope, arg));
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
  ImportDefaultSpecifier(
    node: types.ImportDefaultSpecifier,
    scope: Scope,
    arg
  ) {
    return node.local.name;
  },
  ImportSpecifier(node: types.ImportSpecifier, scope: Scope, arg) {
    return node.local.name;
  },
  ExportDefaultDeclaration(
    node: types.ExportDefaultDeclaration,
    scope: Scope,
    arg
  ) {
    const moduleVar = scope.$find("module");
    if (moduleVar) {
      const moduleObject = moduleVar.$get();
      moduleObject.exports = {
        ...moduleObject.exports,
        ...evaluate(node.declaration, scope, arg)
      };
    }
  },
  ExportNamedDeclaration(
    node: types.ExportNamedDeclaration,
    scope: Scope,
    arg
  ) {
    node.specifiers.forEach(n => evaluate(n, scope, arg));
  },
  ExportSpecifier(node: types.ExportSpecifier, scope: Scope, arg) {
    const moduleVar = scope.$find("module");
    if (moduleVar) {
      const moduleObject = moduleVar.$get();
      moduleObject.exports[node.local.name] = evaluate(node.local, scope, arg);
    }
  }
};

export type EvaluateFunc = (node: types.Node, scope: Scope, arg: any) => any;

export default function evaluate(node: types.Node, scope: Scope, arg: any) {
  const _evalute = <EvaluateFunc>evaluate_map[node.type];
  if (!_evalute) {
    throw new Error(`Unknown visitors of ${node.type}`);
  }
  return _evalute(node, scope, arg);
}
