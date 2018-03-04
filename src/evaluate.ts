import {types} from "babel-core";

import {EvaluateFunc} from "./type";
import {Scope} from "./scope";
import {Var} from "./scope";

const BREAK_SINGAL: {} = {};
const CONTINUE_SINGAL: {} = {};
const RETURN_SINGAL: {result: any} = {result: undefined};

const evaluate_map = {
  File(node: types.File, scope: Scope) {
    evaluate(node.program, scope);
  },
  Program: (program: types.Program, scope: Scope) => {
    for (const node of program.body) {
      evaluate(node, scope);
    }
  },

  Identifier: (node: types.Identifier, scope: Scope) => {
    if (node.name === "undefined") {
      return undefined;
    } // 奇怪的问题
    const $var = scope.$find(node.name);
    if ($var) {
      return $var.$get();
    } else {
      // 返回
      throw new ReferenceError(`${node.name} is not defined`);
    }
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
  BlockStatement(block: types.BlockStatement, scope: Scope) {
    let new_scope = scope.invasived ? scope : new Scope("block", scope);
    for (const node of block.body) {
      const result = evaluate(node, new_scope);
      if (
        result === BREAK_SINGAL ||
        result === CONTINUE_SINGAL ||
        result === RETURN_SINGAL
      ) {
        return result;
      }
    }
  },
  BreakStatement: (node: types.BreakStatement, scope: Scope) => {
    return BREAK_SINGAL;
  },
  ReturnStatement(node: types.ReturnStatement, scope: Scope) {
    RETURN_SINGAL.result = node.argument
      ? evaluate(node.argument, scope)
      : undefined;
    return RETURN_SINGAL;
  },
  VariableDeclaration(node: types.VariableDeclaration, scope: Scope) {
    const kind = node.kind;
    for (const declartor of node.declarations) {
      const {name} = <types.Identifier>declartor.id;
      const value = declartor.init
        ? evaluate(declartor.init, scope)
        : undefined;
      if (!scope.$declar(kind, name, value)) {
        new SyntaxError(`Identifier '${name}' has already been declared`);
      }
    }
  },
  VariableDeclarator: (node: types.VariableDeclarator, scope: Scope) => {
    const varName: string = (<types.Identifier>node.id).name;
    if (types.isObjectExpression(node.init)) {
      scope.$var(varName, evaluate_map.ObjectExpression(node.init, scope));
    }
  },
  FunctionDeclaration(node: types.FunctionDeclaration, scope: Scope) {
    const func = evaluate_map.FunctionExpression(<any>node, scope);

    const {name: func_name} = node.id;
    if (!scope.$const(func_name, func)) {
      throw `[Error] ${func_name} 重复定义`;
    }
  },
  ExpressionStatement(node: types.ExpressionStatement, scope: Scope) {
    evaluate(node.expression, scope);
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
    let $var: {
      $set(value: any): boolean;
      $get(): any;
    };
    if (types.isIdentifier(node.argument)) {
      const {name} = node.argument;
      $var = <Var>scope.$find(name);
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
  ObjectExpression(node: types.ObjectExpression, scope: Scope) {
    const object = {};
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
  CallExpression(node: types.CallExpression, scope: Scope) {
    const func = evaluate(node.callee, scope);
    const args = node.arguments.map(arg => evaluate(arg, scope));

    if (types.isMemberExpression(node.callee)) {
      const object = evaluate(node.callee.object, scope);
      return func.apply(object, args);
    } else {
      const this_val = scope.$find("this");
      return func.apply(this_val ? this_val.$get() : null, args);
    }
  },
  MemberExpression(node: types.MemberExpression, scope: Scope) {
    const {object, property, computed} = node;
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
      if (!$var_or_not) throw new ReferenceError(`${name} is not defined`);
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
  }
};

export default function evaluate(node: types.Node, scope: Scope, arg?: any) {
  const _evalute = <EvaluateFunc>evaluate_map[node.type];
  if (!_evalute) {
    throw new Error(`Unknown visitors of ${node.type}`);
  }
  return _evalute(node, scope, arg);
}
