import {
  Node,
  ClassDeclaration,
  ClassExpression,
  CallExpression
} from "babel-types";
import {Scope, ScopeType} from "./scope";

export class Path<T extends Node> {
  constructor(
    public node: T,
    public parent: Node | null,
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
      this.parent,
      scope
        ? typeof scope === "string" ? this.scope.$child(scope) : scope
        : this.scope,
      {...this.ctx, ...ctx}
    );
  }
}
