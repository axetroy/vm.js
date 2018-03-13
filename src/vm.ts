import { parse } from "babylon";
import Context, { ISandBox } from "./context";
import evaluate from "./evaluate";
import { Path } from "./path";
import { Scope } from "./scope";

export class Vm {
  public createContext(sandbox: ISandBox = {}): Context {
    return new Context(sandbox);
  }
  public isContext(sandbox: any): sandbox is Context {
    return sandbox instanceof Context;
  }
  public runInContext(code: string, context: Context): any | null {
    const scope = new Scope("block", null);
    scope.isTopLevel = true;
    scope.$const("this", this);
    scope.$setContext(context);

    // define module
    const $exports = {};
    const $module = { exports: $exports };
    scope.$const("module", $module);
    scope.$var("exports", $exports);

    // require can be cover
    if (!scope.$find("require")) {
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
      scope.$var("require", requireFunc);
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
    const moduleVar = scope.$find("module");
    return moduleVar ? moduleVar.value.exports : null;
  }
}

export default new Vm();
