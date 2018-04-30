import { Scope } from "./scope";
import { Kind, KindType } from "./type";

export interface IVar {
  kind: Kind | KindType;
  readonly value: any;
  set(value: any): void;
}

export class Var<T> implements IVar {
  constructor(
    public kind: Kind | KindType,
    public name: string,
    private val: T,
    public scope: Scope
  ) {}
  public get value(): T {
    return this.val;
  }
  public set(value: any): void {
    this.val = value;
  }
}
