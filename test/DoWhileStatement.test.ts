import test from "ava";
import * as fs from "fs";

import vm from "../src/vm";

test("DoWhileStatement-1", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  i: 0
};
do {
  obj.i++;
} while (obj.i < 3);

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.i === "number");
  t.deepEqual(obj.i, 3);
});
