import test from "ava";
import { Signal } from "./signal";

test("signal check", t => {
  t.false(Signal.isBreak(undefined));
  t.false(Signal.isReturn(null));
  t.false(Signal.isContinue(0));

  const returnSignal = new Signal("return", "signal value");

  t.true(Signal.isReturn(returnSignal));
  t.deepEqual(returnSignal.value, "signal value");
});
