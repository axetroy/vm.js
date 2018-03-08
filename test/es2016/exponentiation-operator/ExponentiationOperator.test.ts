import test from "ava";

import vm from "../../../src/vm";

test("ExponentiationOperator", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
const num = 2 ** 2;

module.exports = num;
  `,
    sandbox
  );
  t.deepEqual(num, 4);
});
