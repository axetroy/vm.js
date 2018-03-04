import test from "ava";
import * as fs from "fs";

import vm from "../src/vm";

test("UnaryExpression-typeof", t => {
  const sandbox: any = vm.createContext({});

  const type: any = vm.runInContext(
    `
module.exports = typeof 123;
  `,
    sandbox
  );

  t.deepEqual(type, "number");
});

test("UnaryExpression-typeof", t => {
  const sandbox: any = vm.createContext({});

  const type: any = vm.runInContext(
    `
module.exports = void 123;
  `,
    sandbox
  );

  t.deepEqual(type, undefined);
});

test("UnaryExpression-delete", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  a: 123
};

delete obj.a;

module.exports = obj;
  `,
    sandbox
  );

  t.deepEqual(obj.a, undefined);
  t.deepEqual(Object.keys(obj).length, 0);
});
