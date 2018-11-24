import * as types from "babel-types";
import * as isFunction from "lodash.isfunction";
import {
  ErrInvalidIterable,
  ErrNoSuper,
  ErrNotDefined,
  ErrIsNotFunction
} from "../error";
import { Path } from "../path";
import {
  _classCallCheck,
  _createClass,
  _inherits,
  _possibleConstructorReturn,
  _taggedTemplateLiteral
} from "../runtime";
import { ES2015Map, ScopeType } from "../type";
import { Signal } from "../signal";
import { Scope } from "../scope";
import { Stack } from "../stack";
import { MODULE, THIS, REQUIRE, ARGUMENTS, NEW, ANONYMOUS } from "../constant";

import {
  isCallExpression,
  isClassMethod,
  isClassProperty,
  isIdentifier,
  isImportDefaultSpecifier,
  isImportSpecifier,
  isMemberExpression,
  isVariableDeclaration
} from "../packages/babel-types";

import { defineFunctionLength, defineFunctionName } from "../utils";

function overriteStack(err: Error, stack: Stack, node: types.Node): Error {
  stack.push({
    filename: ANONYMOUS,
    stack: stack.currentStackName,
    location: node.loc
  });
  err.stack = err.toString() + "\n" + stack.raw;
  return err;
}

export const es2015: ES2015Map = {
  ArrowFunctionExpression(path) {
    const { node, scope } = path;
    const func = (...args) => {
      const newScope = scope.createChild(ScopeType.Function);

      for (let i = 0; i < node.params.length; i++) {
        const { name } = node.params[i] as types.Identifier;
        newScope.const(name, args[i]);
      }

      const lastThis = scope.hasBinding(THIS);

      newScope.const(THIS, lastThis ? lastThis.value : null);
      newScope.const(ARGUMENTS, args);
      const result = path.evaluate(path.createChild(node.body, newScope));

      if (Signal.isReturn(result)) {
        return result.value;
      } else {
        return result;
      }
    };

    defineFunctionLength(func, node.params.length);
    defineFunctionName(func, node.id ? node.id.name : "");

    return func;
  },
  TemplateLiteral(path) {
    const { node } = path;
    return ([] as types.Node[])
      .concat(node.expressions, node.quasis)
      .sort((a, b) => a.start - b.start)
      .map(element => path.evaluate(path.createChild(element)))
      .join("");
  },
  TemplateElement(path) {
    return path.node.value.raw;
  },
  ForOfStatement(path) {
    const { node, scope, ctx, stack } = path;
    const labelName: string | void = ctx.labelName;
    const entity = path.evaluate(path.createChild(node.right));
    const SymbolConst: any = (() => {
      const $var = scope.hasBinding("Symbol");
      return $var ? $var.value : undefined;
    })();
    // not support for of, it mean not support native for of
    if (SymbolConst) {
      if (!entity || !entity[SymbolConst.iterator]) {
        // FIXME: how to get function name
        // for (let value of get()){}
        throw overriteStack(
          ErrInvalidIterable((node.right as types.Identifier).name),
          stack,
          node.right
        );
      }
    }

    if (isVariableDeclaration(node.left)) {
      /**
       * for (let value in array){ // value should define in block scope
       *
       * }
       */
      const declarator: types.VariableDeclarator = node.left.declarations[0];
      const varName = (declarator.id as types.Identifier).name;
      for (const value of entity) {
        const forOfScope = scope.createChild(ScopeType.ForOf);
        forOfScope.invasive = true;
        forOfScope.isolated = false;
        forOfScope.declare(node.left.kind, varName, value); // define in current scope
        const signal = path.evaluate(path.createChild(node.body, forOfScope));
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
    } else if (isIdentifier(node.left)) {
      /**
       * for (value in array){  // value should define in parent scope
       *
       * }
       */
      const varName = node.left.name;
      for (const value of entity) {
        const forOfScope = scope.createChild(ScopeType.ForOf);
        forOfScope.invasive = true;
        scope.var(varName, value); // define in parent scope
        const signal = path.evaluate(path.createChild(node.body, forOfScope));
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
  ClassDeclaration(path) {
    const ClassConstructor = path.evaluate(
      path.createChild(path.node.body, path.scope.createChild(ScopeType.Class))
    );

    // support class decorators
    const classDecorators = (path.node.decorators || [])
      .map(node => path.evaluate(path.createChild(node)))
      .reverse(); // revers decorators

    // TODO: support class property decorator
    // support class method decorators
    // const propertyDecorators = path.node.body.body.filter(
    //   node => node.decorators && node.decorators.length
    // );

    for (const decorator of classDecorators) {
      decorator(ClassConstructor);
    }

    path.scope.const(path.node.id.name, ClassConstructor);
  },
  ClassBody(path) {
    const { node, scope, stack } = path;
    const constructor: types.ClassMethod | void = node.body.find(
      n => isClassMethod(n) && n.kind === "constructor"
    ) as types.ClassMethod | void;
    const methods: types.ClassMethod[] = node.body.filter(
      n => isClassMethod(n) && n.kind !== "constructor"
    ) as types.ClassMethod[];
    const properties: types.ClassProperty[] = node.body.filter(n =>
      isClassProperty(n)
    ) as types.ClassProperty[];

    const parentNode = (path.parent as Path<types.ClassDeclaration>).node;

    const Class = (SuperClass => {
      if (SuperClass) {
        _inherits(ClassConstructor, SuperClass);
      }

      function ClassConstructor(...args) {
        stack.enter(parentNode.id.name + ".constructor");
        _classCallCheck(this, ClassConstructor);
        const classScope = scope.createChild(ScopeType.Constructor);

        // define class property
        properties.forEach(p => {
          this[p.key.name] = path.evaluate(
            path.createChild(p.value, classScope)
          );
        });

        if (constructor) {
          // defined the params
          constructor.params.forEach((param: types.LVal, i) => {
            classScope.const((param as types.Identifier).name, args[i]);
          });

          if (!SuperClass) {
            classScope.const(THIS, this);
          }

          classScope.const(NEW, {
            target: ClassConstructor
          });

          for (const n of constructor.body.body) {
            path.evaluate(
              path.createChild(n, classScope, {
                SuperClass,
                ClassConstructor,
                ClassConstructorArguments: args,
                ClassEntity: this,
                classScope
              })
            );
          }
        } else {
          classScope.const(THIS, this);
          // apply super if constructor not exist
          _possibleConstructorReturn(
            this,
            (
              (ClassConstructor as any).__proto__ ||
              Object.getPrototypeOf(ClassConstructor)
            ).apply(this, args)
          );
        }

        if (!classScope.hasOwnBinding(THIS)) {
          throw overriteStack(ErrNoSuper(), path.stack, node);
        }

        stack.leave();

        return this;
      }

      // define class name and length
      defineFunctionLength(
        ClassConstructor,
        constructor ? constructor.params.length : 0
      );
      defineFunctionName(ClassConstructor, parentNode.id.name);

      const classMethods = methods
        .map((method: types.ClassMethod) => {
          const methodName: string = method.id
            ? method.id.name
            : method.computed
              ? path.evaluate(path.createChild(method.key))
              : (method.key as types.Identifier).name;
          const methodScope = scope.createChild(ScopeType.Function);
          const func = function(...args) {
            stack.enter(parentNode.id.name + "." + methodName);
            methodScope.const(THIS, this);
            methodScope.const(NEW, { target: undefined });

            // defined the params
            method.params.forEach((p: types.LVal, i) => {
              if (isIdentifier(p)) {
                methodScope.const(p.name, args[i]);
              }
            });

            const result = path.evaluate(
              path.createChild(method.body, methodScope, {
                SuperClass,
                ClassConstructor,
                ClassMethodArguments: args,
                ClassEntity: this
              })
            );

            stack.leave();

            if (Signal.isReturn(result)) {
              return result.value;
            }
          };

          defineFunctionLength(func, method.params.length);
          defineFunctionName(func, methodName);

          return {
            key: (method.key as any).name,
            [method.kind === "method" ? "value" : method.kind]: func
          };
        })
        .concat([{ key: "constructor", value: ClassConstructor }]);
      // define class methods
      _createClass(ClassConstructor, classMethods);

      return ClassConstructor;
    })(
      parentNode.superClass
        ? (() => {
            const $var = scope.hasBinding((parentNode.superClass as any).name);
            return $var ? $var.value : null;
          })()
        : null
    );

    return Class;
  },
  ClassMethod(path) {
    return path.evaluate(path.createChild(path.node.body));
  },
  // refactor class
  ClassExpression(path) {
    //
  },
  Super(path) {
    const { ctx } = path;
    const { SuperClass, ClassConstructor, ClassEntity } = ctx;
    const classScope: Scope = ctx.classScope;
    const ClassBodyPath = path.findParent("ClassBody");
    // make sure it include in ClassDeclaration
    if (!ClassBodyPath) {
      throw new Error("super() only can use in ClassDeclaration");
    }
    const parentPath = path.parent;
    if (parentPath) {
      // super()
      if (isCallExpression(parentPath.node)) {
        if (classScope && !classScope.hasOwnBinding(THIS)) {
          classScope.const(THIS, ClassEntity);
        }
        return function inherits(...args) {
          _possibleConstructorReturn(
            ClassEntity,
            (
              (ClassConstructor as any).__proto__ ||
              Object.getPrototypeOf(ClassConstructor)
            ).apply(ClassEntity, args)
          );
        }.bind(ClassEntity);
      } else if (isMemberExpression(parentPath.node)) {
        // super.eat()
        // then return the superclass prototype
        return SuperClass.prototype;
      }
    }
  },
  SpreadElement(path) {
    return path.evaluate(path.createChild(path.node.argument));
  },
  ImportDeclaration(path) {
    const { node, scope, stack } = path;
    let defaultImport: string = ""; // default import object
    const otherImport: string[] = []; // import property
    const moduleName: string = path.evaluate(path.createChild(node.source));
    node.specifiers.forEach(n => {
      if (isImportDefaultSpecifier(n)) {
        // defaultImport = visitors.ImportDefaultSpecifier(path.createChild(n));
        defaultImport = path.evaluate(path.createChild(n));
      } else if (isImportSpecifier(n)) {
        otherImport.push(path.evaluate(path.createChild(n)));
        // otherImport.push(visitors.ImportSpecifier(path.createChild(n)));
      } else {
        throw n;
      }
    });

    const requireVar = scope.hasBinding(REQUIRE);

    if (requireVar === undefined) {
      throw overriteStack(ErrNotDefined(REQUIRE), stack, node);
    }

    const requireFunc = requireVar.value;

    if (!isFunction(requireFunc)) {
      throw overriteStack(ErrIsNotFunction(REQUIRE), stack, node);
    }

    const targetModule: any = requireFunc(moduleName) || {};

    if (defaultImport) {
      scope.const(
        defaultImport,
        targetModule.default ? targetModule.default : targetModule
      );
    }

    for (const varName of otherImport) {
      scope.const(varName, targetModule[varName]);
    }
  },
  ExportDefaultDeclaration(path) {
    const { node, scope } = path;
    const moduleVar = scope.hasBinding(MODULE);
    if (moduleVar) {
      const moduleObject = moduleVar.value;
      moduleObject.exports = {
        ...moduleObject.exports,
        ...path.evaluate(path.createChild(node.declaration))
      };
    }
  },
  ExportNamedDeclaration(path) {
    const { node } = path;
    node.specifiers.forEach(n => path.evaluate(path.createChild(n)));
  },
  AssignmentPattern(path) {
    const { node, scope, ctx } = path;
    const { value } = ctx;
    scope.const(
      node.left.name,
      value === undefined ? path.evaluate(path.createChild(node.right)) : value
    );
  },
  RestElement(path) {
    const { node, scope, ctx } = path;
    const { value } = ctx;
    scope.const((node.argument as types.Identifier).name, value);
  },
  YieldExpression(path) {
    const { next } = path.ctx;
    next(path.evaluate(path.createChild(path.node.argument))); // call next
  },
  TaggedTemplateExpression(path) {
    const str = path.node.quasi.quasis.map(v => v.value.cooked);
    const raw = path.node.quasi.quasis.map(v => v.value.raw);
    const templateObject = _taggedTemplateLiteral(str, raw);
    const func = path.evaluate(path.createChild(path.node.tag));
    const expressionResultList =
      path.node.quasi.expressions.map(n =>
        path.evaluate(path.createChild(n))
      ) || [];
    return func(templateObject, ...expressionResultList);
  },
  MetaProperty(path) {
    const obj = path.evaluate(path.createChild(path.node.meta));
    return obj[path.node.property.name];
  }
};
