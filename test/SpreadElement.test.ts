import test from "ava";
import * as fs from "fs";

import vm from "../src/vm";

test("SpreadElement-1", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  isTrue: false
};

module.exports = {...obj};
  `,
    sandbox
  );

  t.true(typeof obj.isTrue === "boolean");
  t.false(obj.isTrue);
});

test("SpreadElement-2", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj1 = {
  1: true,
  2: false
};

const obj2 = {
  1: false,
  2: true,
  name: "hello"
};

module.exports = {...obj1, ...obj2};
  `,
    sandbox
  );

  t.false(obj[1]);
  t.true(obj[2]);
  t.deepEqual(obj.name, "hello");
});
