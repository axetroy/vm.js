import { Node } from "babel-types";
import { Scope } from "./scope";
import { ScopeType } from "./type";

export interface ICtx {
  [k: string]: any;
}

export class Path<T extends Node> {
  constructor(
    public node: T,
    public parent: Path<Node> | null,
    public scope: Scope,
    public ctx: ICtx = {}
  ) {}
  /**
   * Generate child scope
   * @template Child
   * @param {Child} node
   * @param {(ScopeType | Scope)} [scope]
   * @param {ICtx} [ctx={}]
   * @returns {Path<Child>}
   * @memberof Path
   */
  public $child<Child extends Node>(
    node: Child,
    scope?: ScopeType | Scope,
    ctx: ICtx = {}
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
  /**
   * Find scope scope with type
   * @param {string} type
   * @returns {(Path<Node> | null)}
   * @memberof Path
   */
  public $findParent(type: string): Path<Node> | null {
    if (this.parent) {
      return this.parent.node.type === type
        ? this.parent
        : this.parent.$findParent(type);
    } else {
      return null;
    }
  }
}
