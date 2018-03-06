import * as types from "babel-types";
import {ErrNotDefined, ErrNotSupport, ErrDuplicateDeclard} from "./error";
import {EvaluateFunc} from "./type";
import {Scope} from "./scope";
import {
  _classCallCheck,
  _createClass,
  _possibleConstructorReturn,
  _inherits,
  _extends,
  _toConsumableArray
} from "./runtime";
import {debug} from "util";

const BREAK_SINGAL: {} = {};
const CONTINUE_SINGAL: {} = {};
const RETURN_SINGAL: {result: any} = {result: undefined};

const evaluate_map = {
  File(node: types.File, scope: Scope) {
    evaluate(node.program, scope);
  },
  Program(program: types.Program, scope: Scope) {
    // hoisting
    for (const node of program.body) {
      if (types.isFunctionDeclaration(node)) {
        evaluate(node, scope);
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
        evaluate(node, scope);
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
  IfStatement(node: types.IfStatement, scope: Scope) {
    if (evaluate(node.test, scope)) {
      return evaluate(node.consequent, scope);
    } else if (node.alternate) {
      return evaluate(node.alternate, scope);
    }
  },
  EmptyStatement(node: types.EmptyStatement, scope: Scope) {},
  BlockStatement(block: types.BlockStatement, scope: Scope, {SuperClass}) {
    // hoisting
    for (const node of block.body) {
      if (types.isFunctionDeclaration(node)) {
        evaluate(node, scope);
      } else if (types.isVariableDeclaration(node)) {
        for (const declaration of node.declarations) {
          if (node.kind === "var") {
            scope.$var((<types.Identifier>declaration.id).name, undefined);
          }
        }
      }
    }

    let new_scope = scope.invasived ? scope : new Scope("block", scope);
    for (const node of block.body) {
      const result = evaluate(node, new_scope, {SuperClass});
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
  ReturnStatement(node: types.ReturnStatement, scope: Scope, {SuperClass}) {
    RETURN_SINGAL.result = node.argument
      ? evaluate(node.argument, scope, {SuperClass})
      : undefined;
    return RETURN_SINGAL;
  },
  VariableDeclaration(node: types.VariableDeclaration, scope: Scope) {
    const kind = node.kind;
    for (const declartor of node.declarations) {
      if (types.isIdentifier(declartor.id)) {
        const {name} = declartor.id;
        const value = declartor.init
          ? evaluate(declartor.init, scope)
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
        const obj = evaluate(declartor.init, scope);

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
                scope.$declar(kind, $varName, evaluate(el, scope));
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
  VariableDeclarator: (node: types.VariableDeclarator, scope: Scope) => {
    // @es2015 destructuring
    // console.log(node);
    if (types.isObjectPattern(node.id)) {
      const newScope = new Scope("block");
      if (types.isObjectExpression(node.init)) {
        evaluate_map.ObjectExpression(node.init, newScope);
      }
      console.log(node);
      node.id.properties.forEach(n => {
        console.log(n);
        if (types.isObjectProperty(n)) {
          const propertyName: string = (<any>n).id.name;
          const $var = newScope.$find(propertyName);
          console.log("set", propertyName, (<any>$var).$get());
          scope.$var(propertyName, $var ? $var.$get() : undefined);
        }
      });
    } else if (types.isObjectExpression(node.init)) {
      const varName: string = (<types.Identifier>node.id).name;
      scope.$var(varName, evaluate_map.ObjectExpression(node.init, scope));
    } else {
      throw node;
    }
  },
  FunctionDeclaration(node: types.FunctionDeclaration, scope: Scope) {
    if (node.async === true) {
    } else {
      const func = evaluate_map.FunctionExpression(<any>node, scope);

      const {name: func_name} = node.id;
      // function declartion can be duplicate
      scope.$var(func_name, func);
    }
  },
  ExpressionStatement(
    node: types.ExpressionStatement,
    scope: Scope,
    {SuperClass}
  ) {
    evaluate(node.expression, scope, {SuperClass});
  },
  ForStatement(node: types.ForStatement, scope: Scope) {
    for (
      const new_scope = new Scope("loop", scope),
        init_val = node.init ? evaluate(node.init, new_scope) : null;
      node.test ? evaluate(node.test, new_scope) : true;
      node.update ? evaluate(node.update, new_scope) : void 0
    ) {
      const result = evaluate(node.body, new_scope);
      if (result === BREAK_SINGAL) {
        break;
      } else if (result === CONTINUE_SINGAL) {
        continue;
      } else if (result === RETURN_SINGAL) {
        return result;
      }
    }
  },
  ForInStatement: (node: types.ForInStatement, scope: Scope) => {
    const kind = (<types.VariableDeclaration>node.left).kind;
    const decl = (<types.VariableDeclaration>node.left).declarations[0];
    const name = (<types.Identifier>decl.id).name;

    for (const value in evaluate(node.right, scope)) {
      const new_scope = new Scope("loop", scope);
      new_scope.invasived = true;

      new_scope.$declar(kind, name, value);

      const result = evaluate(node.body, new_scope);
      if (result === BREAK_SINGAL) {
        break;
      } else if (result === CONTINUE_SINGAL) {
        continue;
      } else if (result === RETURN_SINGAL) {
        return result;
      }
    }
  },
  DoWhileStatement(node: types.DoWhileStatement, scope: Scope) {
    do {
      const new_scope = new Scope("loop", scope);
      new_scope.invasived = true;
      const result = evaluate(node.body, new_scope); // 先把do的执行一遍
      if (result === BREAK_SINGAL) {
        break;
      } else if (result === CONTINUE_SINGAL) {
        continue;
      } else if (result === RETURN_SINGAL) {
        return result;
      }
    } while (evaluate(node.test, scope));
  },
  WhileStatement(node: types.WhileStatement, scope: Scope) {
    while (evaluate(node.test, scope)) {
      const new_scope = new Scope("loop", scope);
      new_scope.invasived = true;
      const result = evaluate(node.body, new_scope);

      if (result === BREAK_SINGAL) {
        break;
      } else if (result === CONTINUE_SINGAL) {
        continue;
      } else if (result === RETURN_SINGAL) {
        return result;
      }
    }
  },
  ThrowStatement(node: types.ThrowStatement, scope: Scope) {
    throw evaluate(node.argument, scope);
  },
  CatchClause(node: types.CatchClause, scope, Scope) {
    return evaluate(node.body, scope);
  },
  TryStatement(node: types.TryStatement, scope: Scope) {
    try {
      const newScope = new Scope("block", scope);
      return evaluate(node.block, newScope);
    } catch (err) {
      if (node.handler) {
        const param = <types.Identifier>node.handler.param;
        const new_scope = new Scope("block", scope);
        new_scope.invasived = true; // 标记为侵入式Scope，不用再多构造啦
        new_scope.$const(param.name, err);
        return evaluate(node.handler, new_scope);
      } else {
        throw err;
      }
    } finally {
      if (node.finalizer) return evaluate(node.finalizer, scope);
    }
  },
  SwitchStatement(node: types.SwitchStatement, scope: Scope) {
    const discriminant = evaluate(node.discriminant, scope); // switch的条件
    const new_scope = new Scope("switch", scope);

    let matched = false;
    for (const $case of node.cases) {
      // 进行匹配相应的 case
      if (
        !matched &&
        (!$case.test || discriminant === evaluate($case.test, new_scope))
      ) {
        matched = true;
      }

      if (matched) {
        const result = evaluate($case, new_scope);

        if (result === BREAK_SINGAL) {
          break;
        } else if (result === CONTINUE_SINGAL || result === RETURN_SINGAL) {
          return result;
        }
      }
    }
  },
  SwitchCase: (node: types.SwitchCase, scope: Scope) => {
    for (const stmt of node.consequent) {
      const result = evaluate(stmt, scope);
      if (
        result === BREAK_SINGAL ||
        result === CONTINUE_SINGAL ||
        result === RETURN_SINGAL
      ) {
        return result;
      }
    }
  },
  UpdateExpression(node: types.UpdateExpression, scope: Scope) {
    const {prefix} = node;
    let $var;
    if (types.isIdentifier(node.argument)) {
      const {name} = node.argument;
      $var = scope.$find(name);
      if (!$var) throw `${name} 未定义`;
    } else if (types.isMemberExpression(node.argument)) {
      const argument = node.argument;
      const object = evaluate(argument.object, scope);
      let property = argument.computed
        ? evaluate(argument.property, scope)
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
    }[node.operator](evaluate(node.argument, scope));
  },
  ThisExpression(node: types.ThisExpression, scope: Scope) {
    const this_val = scope.$find("this");
    return this_val ? this_val.$get() : null;
  },
  ArrayExpression(node: types.ArrayExpression, scope: Scope) {
    const gotSpreadElement: boolean = !!node.elements.find(v =>
      types.isSpreadElement(v)
    );
    let newArray: any[] = [];
    node.elements.forEach(item => {
      if (types.isSpreadElement(item)) {
        const arr = evaluate(item, scope);
        newArray = (<any[]>[]).concat(newArray, _toConsumableArray(arr));
      } else {
        newArray.push(evaluate(item, scope));
      }
    });
    return newArray;
  },
  ObjectExpression(node: types.ObjectExpression, scope: Scope) {
    let object = {};
    for (const property of node.properties) {
      if (types.isObjectProperty(property)) {
        if (types.isIdentifier(property.key)) {
          object[property.key.name] = evaluate(property.value, scope);
        } else {
          object[evaluate(property.key, scope)] = evaluate(
            property.value,
            scope
          );
        }
      } else if (types.isObjectMethod(property)) {
        switch (property.kind) {
          case "get":
            Object.defineProperty(object, evaluate(property.key, scope), {
              get: evaluate(property.value, scope)
            });
            break;
          case "set":
            Object.defineProperty(object, evaluate(property.key, scope), {
              set: evaluate(property.value, scope)
            });
            break;
          case "method":
            break;
          default:
            throw new Error("Invalid kind of property");
        }
      } else if (types.isSpreadProperty(property)) {
        // @experimental Object rest spread
        object = Object.assign(object, evaluate(property.argument, scope));
      } else {
        throw node;
      }
    }
    return object;
  },
  FunctionExpression(node: types.FunctionExpression, scope: Scope) {
    const func = function(...args) {
      const new_scope = new Scope("function", scope);
      new_scope.invasived = true;
      for (let i = 0; i < node.params.length; i++) {
        const {name} = <types.Identifier>node.params[i];
        new_scope.$const(name, args[i]);
      }
      new_scope.$const("this", this);
      new_scope.$const("arguments", arguments);
      const result = evaluate(node.body, new_scope);
      if (result === RETURN_SINGAL) {
        return result.result;
      }
    };

    Object.defineProperty(func, "length", {value: node.params.length});

    return func;
  },
  BinaryExpression(node: types.BinaryExpression, scope: Scope) {
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
    }[node.operator](evaluate(node.left, scope), evaluate(node.right, scope));
  },
  UnaryExpression(node: types.UnaryExpression, scope: Scope) {
    return {
      "-": () => -evaluate(node.argument, scope),
      "+": () => +evaluate(node.argument, scope),
      "!": () => !evaluate(node.argument, scope),
      "~": () => ~evaluate(node.argument, scope),
      void: () => void evaluate(node.argument, scope),
      typeof: () => {
        if (types.isIdentifier(node.argument)) {
          const $var = scope.$find(node.argument.name);
          return $var ? typeof $var.$get() : "undefined";
        } else {
          return typeof evaluate(node.argument, scope);
        }
      },
      delete: () => {
        if (types.isMemberExpression(node.argument)) {
          const {object, property, computed} = node.argument;
          if (computed) {
            return delete evaluate(object, scope)[evaluate(property, scope)];
          } else {
            return delete evaluate(object, scope)[
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

  CallExpression(node: types.CallExpression, scope: Scope, {SuperClass}) {
    const func = evaluate(node.callee, scope, {SuperClass});
    const args = node.arguments.map(arg => evaluate(arg, scope));

    if (typeof func !== "function") {
      // throw new Error();
      return;
    }

    if (types.isMemberExpression(node.callee)) {
      const object = evaluate(node.callee.object, scope, {SuperClass});
      return func.apply(object, args);
    } else {
      const this_val = scope.$find("this");
      return func.apply(this_val ? this_val.$get() : null, args);
    }
  },
  MemberExpression(node: types.MemberExpression, scope: Scope, {SuperClass}) {
    const {object, property, computed} = node;
    if (types.isSuper(node.object)) {
      const $var = scope.$find("this");
      if ($var) {
        const __this = $var.$get();
        return SuperClass.prototype[(<any>property).name].bind(__this);
      }
    }
    if (computed) {
      return evaluate(object, scope)[evaluate(property, scope)];
    } else {
      return evaluate(object, scope)[(<types.Identifier>property).name];
    }
  },
  AssignmentExpression(node: types.AssignmentExpression, scope: Scope) {
    let $var: {
      $set(value: any): boolean;
      $get(): any;
    };

    if (types.isIdentifier(node.left)) {
      const {name} = node.left;
      const $var_or_not = scope.$find(name);
      if (!$var_or_not) throw new ErrNotDefined(name);
      $var = $var_or_not;
    } else if (types.isMemberExpression(node.left)) {
      const left = node.left;
      const object = evaluate(left.object, scope);
      let property = left.computed
        ? evaluate(left.property, scope)
        : (<types.Identifier>left.property).name;
      $var = {
        $set(value: any) {
          object[property] = value;
          return true;
        },
        $get() {
          return object[property];
        }
      };
    } else {
      throw `如果出现在这里，那就说明有问题了`;
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
    }[node.operator](evaluate(node.right, scope));
  },
  LogicalExpression(node: types.LogicalExpression, scope: Scope) {
    return {
      "||": () => evaluate(node.left, scope) || evaluate(node.right, scope),
      "&&": () => evaluate(node.left, scope) && evaluate(node.right, scope)
    }[node.operator]();
  },
  ConditionalExpression(node: types.ConditionalExpression, scope: Scope) {
    return evaluate(node.test, scope)
      ? evaluate(node.consequent, scope)
      : evaluate(node.alternate, scope);
  },
  NewExpression(node: types.NewExpression, scope: Scope) {
    const func = evaluate(node.callee, scope);
    Object.defineProperty(func, "length", {value: node.arguments.length});
    const args = node.arguments.map(arg => evaluate(arg, scope));
    return new (func.bind.apply(func, [null].concat(args)))();
  },

  // ES2015
  ArrowFunctionExpression(node: types.ArrowFunctionExpression, scope: Scope) {
    const func = function(...args) {
      const new_scope = new Scope("function", scope);
      new_scope.invasived = true;
      for (let i = 0; i < node.params.length; i++) {
        const {name} = <types.Identifier>node.params[i];
        new_scope.$const(name, args[i]);
      }

      const lastThis = scope.$find("this");

      new_scope.$const("this", lastThis ? lastThis.$get() : null);
      new_scope.$const("arguments", arguments);
      const result = evaluate(node.body, new_scope);

      if (result === RETURN_SINGAL) {
        return result.result;
      } else {
        return result;
      }
    };

    Object.defineProperty(func, "length", {value: node.params.length});

    return func;
  },
  TemplateLiteral(node: types.TemplateLiteral, scope: Scope) {
    return (<types.Node[]>[])
      .concat(node.expressions, node.quasis)
      .sort((a, b) => a.start - b.start)
      .map(element => evaluate(element, scope))
      .join("");
  },
  TemplateElement(node: types.TemplateElement, scope: Scope) {
    return node.value.raw;
  },
  ClassDeclaration(node: types.ClassDeclaration, scope: Scope) {
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

        // TODO: need babel plugin to support class property
        const newScope = new Scope("function", scope);

        // babel way to call super();
        const __this = _possibleConstructorReturn(
          this,
          ((<any>Class).__proto__ || Object.getPrototypeOf(Class)).apply(
            this,
            args
          )
        );

        // typescript way to call super()
        // const __this = superClass ? superClass.apply(this, args) || this : this;

        newScope.$const("this", __this);

        // define class property
        properties.forEach(p => (__this[p.key.name] = p.value));

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
          const newScope = new Scope("function", scope);
          const func = function(...args) {
            newScope.$const("this", this);

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
  ClassMethod(node: types.ClassMethod, scope: Scope, {SuperClass}) {
    return evaluate(node.body, scope, {SuperClass});
  },
  Super(node: types.Super, scope: Scope) {
    return function() {};
  },
  SpreadElement(node: types.SpreadElement, scope: Scope) {
    return evaluate(node.argument, scope);
  },
  ObjectProperty(node: types.ObjectProperty, scope: Scope) {
    // do nothing
  }
};

export default function evaluate(
  node: types.Node,
  scope: Scope,
  arg: any = {}
) {
  const _evalute = <EvaluateFunc>evaluate_map[node.type];
  if (!_evalute) {
    throw new Error(`Unknown visitors of ${node.type}`);
  }
  return _evalute(node, scope, arg);
}
