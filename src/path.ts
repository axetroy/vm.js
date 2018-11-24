import { Node } from "babel-types";
import { Scope } from "./scope";
import { ScopeType, EvaluateFunc, presetMap } from "./type";
import { Stack } from "./stack";

export interface ICtx {
  [k: string]: any;
}

export class Path<T extends Node> {
  public evaluate!: EvaluateFunc;
  public preset!: presetMap;
  constructor(
    public node: T,
    public parent: Path<Node> | null,
    public scope: Scope,
    public ctx: ICtx,
    public stack: Stack
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
  public createChild<Child extends Node>(
    node: Child,
    scope?: ScopeType | Scope,
    ctx?: ICtx
  ): Path<Child> {
    const path = new Path(
      node,
      this,
      scope
        ? typeof scope === "number"
          ? this.scope.createChild(scope)
          : scope
        : this.scope,
      { ...this.ctx, ...ctx },
      this.stack
    );
    path.evaluate = this.evaluate;
    path.preset = this.preset;
    return path;
  }
  /**
   * Find scope scope with type
   * @param {string} type
   * @returns {(Path<Node> | null)}
   * @memberof Path
   */
  public findParent(type: string): Path<Node> | null {
    return this.parent
      ? this.parent.node.type === type
        ? this.parent
        : this.parent.findParent(type)
      : null;
  }
}
