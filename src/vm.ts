import {parse} from "babylon";
import Context, {Sandbox$} from "./context";
import {Scope} from "./scope";
import evaluate from "./evaluate";

class Vm {
  createContext(sandbox: Sandbox$ = {}) {
    return new Context(sandbox);
  }
  runInContext(code: string, context: Context): any | null {
    const scope = new Scope("block");
    scope.isTopLevel = true;
    scope.$const("this", this);
    scope.$setContext(context);

    // 定义 module
    const $exports = {};
    const $module = {exports: $exports};
    scope.$const("module", $module);
    scope.$const("exports", $exports);

    const ast = parse(code, {
      plugins: [
        // estree,
        // "jsx",
        "flow",
        // "classConstructorCall",
        // "doExpressions",
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

    ast && evaluate(ast, scope);

    // exports
    const module_var = scope.$find("module");
    return module_var ? module_var.$get().exports : null;
  }
}

export default new Vm();
