import test from "ava";
import vm from "../src/vm";

test("ConditionalExpression-1", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = true ? 1 : 2;
  `,
    sandbox
  );

  t.deepEqual(num, 1);
});

test("ConditionalExpression-or-2", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = false ? 1 : 2;
  `,
    sandbox
  );

  t.deepEqual(num, 2);
});
