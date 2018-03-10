import { parse } from "babylon";
import Context, { Sandbox$ } from "./context";
import { Scope } from "./scope";
import evaluate from "./evaluate";
import { Path } from "./path";

export interface Options {
  filename?: string;
}

export class Vm {
  createContext(sandbox: Sandbox$ = {}): Context {
    return new Context(sandbox);
  }
  isContext(sandbox: any): boolean {
    return sandbox instanceof Context;
  }
  runInContext(
    code: string,
    context: Context,
    ops: Options = {
      filename: "index.js"
    }
  ): any | null {
    const scope = new Scope("block");
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
        typeof require === "function"
          ? require
          : typeof context["require"] === "function"
            ? context["require"]
            : function _require(id: string) {
                return {};
              };
      scope.$var("require", requireFunc);
    }

    const ast = parse(code, {
      sourceType: "module",
      plugins: [
        // estree,
        // "jsx",
        "flow",
        // "classConstructorCall",
        "doExpressions",
        "objectRestSpread",
        "decorators",
        "classProperties",
        "exportExtensions",
        "asyncGenerators"
        // "functionBind",
        // "functionSent",
        // "dynamicImport"
      ]
    });

    const path = new Path(ast, null, scope, {});

    ast && evaluate(path);

    // exports
    const module_var = scope.$find("module");
    return module_var ? module_var.$get().exports : null;
  }
}

export default new Vm();
