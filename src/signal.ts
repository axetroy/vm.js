export type SignalKind = "break" | "continue" | "return";

export class Signal {
  public static is(v: any, type: SignalKind): v is Signal {
    return v instanceof Signal && v.kind === type;
  }
  public static isContinue(v: any): v is Signal {
    return Signal.is(v, "continue");
  }
  public static isBreak(v: any): v is Signal {
    return Signal.is(v, "break");
  }
  public static isReturn(v: any): v is Signal {
    return Signal.is(v, "return");
  }
  constructor(public kind: SignalKind, public value?: any) {}
}
