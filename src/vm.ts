import Context, {Sandbox$} from "./context";
import {Scope} from "./scope";
import {transform} from "babel-core";
import evaluate from "./evaluate";

class Vm {
  constructor() {}
  createContext(sandbox: Sandbox$ = {}) {
    return new Context(sandbox);
  }
  runInContext(code: string, context: Context): any | null {
    const scope = new Scope("block");
    scope.$const("this", this);

    for (let name in context) {
      if (context.hasOwnProperty(name)) {
        scope.$const(name, context[name]);
      }
    }

    // 定义 module
    const $exports = {};
    const $module = {exports: $exports};
    scope.$const("module", $module);
    scope.$const("exports", $exports);

    const {ast} = transform(code);

    ast && evaluate(ast, scope);

    // exports
    const module_var = scope.$find("module");
    return module_var ? module_var.$get().exports : null;
  }
}

export default new Vm();
