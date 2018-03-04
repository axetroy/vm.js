import test from "ava";
import * as fs from "fs";

import vm from "../src/vm";

test("FunctionExpression", t => {
  const sandbox: any = vm.createContext({});

  const testFunc = vm.runInContext(
    `
function test(name){
  return "hello " + name;
}

module.exports = test;
  `,
    sandbox
  );

  t.true(typeof testFunc === "function");
  t.deepEqual(testFunc.length, 1);
  t.deepEqual(testFunc("world"), "hello world");
});

test("FunctionDeclaration", t => {
  const sandbox: any = vm.createContext({});

  const testFunc = vm.runInContext(
    `
const func = function test(name){
  return "hello " + name;
}

module.exports = func;
  `,
    sandbox
  );

  t.true(typeof testFunc === "function");
  t.deepEqual(testFunc.length, 1);
  t.deepEqual(testFunc("world"), "hello world");
});
