import test from "ava";

import vm from "../src/vm";

test("ShorthandProperties", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const a = 1;
const b = 2;
const c = 3;
const o = {a, b, c};
module.exports = o;
  `,
    sandbox
  );

  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
  t.deepEqual(obj.c, 3);
});
