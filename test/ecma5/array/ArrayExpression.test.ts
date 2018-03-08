import test from "ava";

import vm from "../../../src/vm";

test("ObjectExpression", t => {
  const sandbox: any = vm.createContext({});

  const arr: any = vm.runInContext(
    `
const arr = [1, 2, 3];
arr.push(4);

module.exports = arr;
  `,
    sandbox
  );

  t.true(Array.isArray(arr));
  t.deepEqual(arr.length, 4);
  t.deepEqual(arr, [1, 2, 3, 4]);
});
