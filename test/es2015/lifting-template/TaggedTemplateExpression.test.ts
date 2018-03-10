import test from "ava";
import vm from "../../../src/vm";

test("LiftingTemplate-1", t => {
  const sandbox: any = vm.createContext({});

  const str: any = vm.runInContext(
    "module.exports = String.raw`Hi ${1+5}!`;",
    sandbox
  );

  t.deepEqual(str, "Hi 6!");
});

test("LiftingTemplate-with/", t => {
  const sandbox: any = vm.createContext({});

  const str: any = vm.runInContext(
    "module.exports = String.raw`Hi\n ${1+5}!`;",
    sandbox
  );

  t.deepEqual(str, "Hi\n 6!");
});
