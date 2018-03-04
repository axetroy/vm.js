import test from "ava";
import * as fs from "fs";

import vm from "../src/vm";

test("ForInStatement-1", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  1: false,
  2: false
};

for (let attr in obj) {
  obj[attr] = true;
}

module.exports = obj;
  `,
    sandbox
  );

  t.true(obj[1]);
  t.true(obj[2]);
});
