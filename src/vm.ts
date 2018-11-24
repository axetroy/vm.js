import { parse } from "babylon";
import { Context, ISandBox } from "./context";
import evaluate from "./evaluate";
import { Path } from "./path";
import { Scope } from "./scope";
import { MODULE, EXPORTS, THIS } from "./constant";
import { ScopeType, presetMap } from "./type";
import { Stack } from "./stack";

/**
 * Run the code in context
 * @export
 * @param {string} code
 * @param {Context} context
 * @returns
 */
export function runInContext(
  code: string,
  context: Context,
  preset: presetMap = presetMap.env
) {
  const scope = new Scope(ScopeType.Root, null);
  scope.level = 0;
  scope.invasive = true;
  scope.const(THIS, undefined);
  scope.setContext(context);

  // define module
  const $exports = {};
  const $module = { exports: $exports };
  scope.const(MODULE, $module);
  scope.var(EXPORTS, $exports);

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

  const path = new Path(ast, null, scope, {}, new Stack());
  path.preset = preset;
  path.evaluate = evaluate;

  evaluate(path);

  // exports
  const moduleVar = scope.hasBinding(MODULE);
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
