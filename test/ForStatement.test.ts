import test from "ava";
import * as fs from "fs";

import vm from "../src/vm";

test("ForStatement-1", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {num: 0};
for (let i = 0; i < 100; i++) {
  obj.num++;
}

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.num === "number");
  t.deepEqual(obj.num, 100);
});
