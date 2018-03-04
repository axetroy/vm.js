import test from "ava";
import * as fs from "fs";

import vm from "../src/vm";

test("TemplateLiteral-1", t => {
  const sandbox: any = vm.createContext({});

  const word: any = vm.runInContext("module.exports = `hello world`;", sandbox);

  t.deepEqual(word, "hello world");
});

test("TemplateLiteral-2", t => {
  const sandbox: any = vm.createContext({name: "world"});

  const word: any = vm.runInContext(
    "module.exports = `hello ${name}`;",
    sandbox
  );

  t.deepEqual(word, "hello world");
});

test("TemplateLiteral-3", t => {
  const sandbox: any = vm.createContext({name: "world", age: 21});

  const word: any = vm.runInContext(
    "module.exports = `hello ${name}, I am ${age} years old.`;",
    sandbox
  );

  t.deepEqual(word, "hello world, I am 21 years old.");
});
