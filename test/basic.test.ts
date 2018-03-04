import test from "ava";
import * as fs from "fs";

import vm from "../src/vm";

test("hello world", t => {
  const sandbox = vm.createContext({});

  vm.runInContext('console.log("hello world")', sandbox);

  t.pass();
});

test("basic", t => {
  const sandbox: any = vm.createContext({
    name: "hello"
  });

  vm.runInContext('name = "world"', sandbox);

  t.deepEqual(sandbox.name, "hello");
});

test("readFile", t => {
  const sandbox: any = vm.createContext({
    fs,
    __filename
  });

  const output = vm.runInContext(
    `
  const raw = fs.readFileSync(__filename, "utf8");
  module.exports = raw;
  `,
    sandbox
  );

  t.deepEqual(output, fs.readFileSync(__filename, "utf8"));
});

test("Function Expression", t => {
  const sandbox: any = vm.createContext({
    fs,
    __filename
  });

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

test("Function", t => {
  const sandbox: any = vm.createContext({
    fs,
    __filename
  });

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