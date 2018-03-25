import { parse } from "babylon";
import Context, { ISandBox } from "./context";
import evaluate from "./evaluate";
import { Path } from "./path";
import { Scope } from "./scope";

/**
 * Run the code in context
 * @export
 * @param {string} code
 * @param {Context} context
 * @returns
 */
export function runInContext(code: string, context: Context) {
  const scope = new Scope("root", null);
  scope.isTopLevel = true;
  scope.const("this", this);
  scope.setContext(context);

  // define module
  const $exports = {};
  const $module = { exports: $exports };
  scope.const("module", $module);
  scope.var("exports", $exports);

  // require can be cover
  if (!scope.hasBinding("require")) {
    const requireFunc =
      // tslint:disable-next-line
      typeof context["require"] === "function"
        ? // tslint:disable-next-line
          context["require"]
        : typeof require === "function"
          ? require
          : function _require(id: string) {
              return {};
            };
    scope.var("require", requireFunc);
  }

  const ast = parse(code, {
    sourceType: "module",
    plugins: [
      "asyncGenerators",
      "classProperties",
      "decorators",
      "doExpressions",
      "exportExtensions",
      "flow",
      "objectRestSpread"
    ]
  });

  const path = new Path(ast, null, scope, {});
  evaluate(path);

  // exports
  const moduleVar = scope.hasBinding("module");
  return moduleVar ? moduleVar.value.exports : null;
}

/**
 * Create a context
 * @export
 * @param {ISandBox} [sandbox={}]
 * @returns {Context}
 */
export function createContext(sandbox: ISandBox = {}): Context {
  return new Context(sandbox);
}

export default { runInContext, createContext };
