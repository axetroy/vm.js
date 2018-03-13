export type SignalKind = "break" | "continue" | "return";

export class Signal {
  public static is(v: any, type: SignalKind): v is Signal {
    return v instanceof Signal && v.kind === type;
  }
  constructor(public kind: SignalKind, public value?: any) {}
}
