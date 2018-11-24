import { ExperimentalMap, ScopeType } from "../type";
import { MODULE } from "../constant";

export const experimental: ExperimentalMap = {
  ImportSpecifier(path) {
    return path.node.local.name;
  },
  ImportDefaultSpecifier(path) {
    return path.node.local.name;
  },
  ExportSpecifier(path) {
    const { node, scope } = path;
    const moduleVar = scope.hasBinding(MODULE);
    if (moduleVar) {
      const moduleObject = moduleVar.value;
      moduleObject.exports[node.local.name] = path.evaluate(
        path.createChild(node.local)
      );
    }
  },
  SpreadProperty(path) {
    const { node, ctx } = path;
    const { object } = ctx;
    Object.assign(object, path.evaluate(path.createChild(node.argument)));
  },
  DoExpression(path) {
    const newScope = path.scope.createChild(ScopeType.Do);
    newScope.invasive = true;
    return path.evaluate(path.createChild(path.node.body, newScope));
  },
  Decorator(path) {
    return path.evaluate(path.createChild(path.node.expression));
  }
};
