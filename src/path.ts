import { Node } from "babel-types";
import { Scope, ScopeType } from "./scope";

export class Path<T extends Node> {
  constructor(
    public node: T,
    public parent: Path<Node> | null,
    public scope: Scope,
    public ctx: any = {}
  ) {}
  $child<Child extends Node>(
    node: Child,
    scope?: ScopeType | Scope,
    ctx: any = {}
  ): Path<Child> {
    return new Path(
      node,
      this,
      scope
        ? typeof scope === "string" ? this.scope.$child(scope) : scope
        : this.scope,
      { ...this.ctx, ...ctx }
    );
  }
  $findParent(type: string): Path<Node> | null {
    if (this.parent) {
      return this.parent.node.type === type
        ? this.parent
        : this.parent.$findParent(type);
    } else {
      return null;
    }
  }
}
