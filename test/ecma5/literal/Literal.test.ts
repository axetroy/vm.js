import test from "ava";

import vm from "../../../src/vm";

test("Literal", t => {
  const sandbox: any = vm.createContext({});

  const output: any = vm.runInContext(
    `
module.exports = {
  a: null,
  b: undefined,
  c: 0,
  d: "1",
  e: true
};
  `,
    sandbox
  );
  t.deepEqual(output, {
    a: null,
    b: undefined,
    c: 0,
    d: "1",
    e: true
  });
});
