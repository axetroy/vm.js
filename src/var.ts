import { Scope } from "./scope";
import { Kind } from "./type";

export interface IVar {
  kind: Kind;
  readonly value: any;
  set(value: any): void;
}

export class Var<T> implements IVar {
  constructor(
    public kind: Kind,
    public name: string,
    private val: T,
    public scope: Scope
  ) {}
  public get value(): T {
    return this.val;
  }
  public set(value: any) {
    this.val = value;
  }
}
