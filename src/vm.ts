import { parse } from "babylon";
import { Context, ISandBox } from "./context";
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
  scope.level = 0;
  scope.invasive = true;
  scope.const("this", undefined);
  scope.setContext(context);

  // define module
  const $exports = {};
  const $module = { exports: $exports };
  scope.const("module", $module);
  scope.var("exports", $exports);

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

  evaluate(new Path(ast, null, scope, {}));

  // exports
  const moduleVar = scope.hasBinding("module");
  return moduleVar ? moduleVar.value.exports : undefined;
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
