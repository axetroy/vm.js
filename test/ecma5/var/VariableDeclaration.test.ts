import test from "ava";
import vm from "../../../src/vm";
import { ErrDuplicateDeclard } from "../../../src/error";

test("VariableDeclaration-var", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 123;

module.exports = a;
  `,
    sandbox
  );

  t.deepEqual(a, 123);
});

test("VariableDeclaration-duplicate-var", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 123;

var a = 321;

module.exports = a;
  `,
    sandbox
  );

  t.deepEqual(a, 321);
});

test("VariableDeclaration-duplicate-with-context-var", t => {
  const sandbox: any = vm.createContext({
    global: "hello"
  });

  const g = vm.runInContext(
    `
var global = "world"  // context can not be rewrite
module.exports = global;
    `,
    sandbox
  );

  t.deepEqual(g, "hello");
});

test("VariableDeclaration-replace-context-var", t => {
  const sandbox: any = vm.createContext({
    global: "hello"
  });

  const g = vm.runInContext(
    `
function test(){
  let global = 123;
  return global;
}
module.exports = test();
    `,
    sandbox
  );
  t.deepEqual(g, 123);
});

test("VariableDeclaration-define global var", t => {
  const sandbox: any = vm.createContext({
    global: "hello"
  });

  const output = vm.runInContext(
    `
name = "axetroy"
module.exports = {name: name, global}
    `,
    sandbox
  );
  t.deepEqual(output.global, "hello");
  t.deepEqual(output.name, "axetroy");
});

test("VariableDeclaration-define var then cover value", t => {
  const sandbox: any = vm.createContext({});

  const output = vm.runInContext(
    `
var name = "hello"
name = "world"  // cover the name var
module.exports = {name: name}
    `,
    sandbox
  );
  t.deepEqual(output.name, "world");
});

test("VariableDeclaration-define global var in block scope", t => {
  const sandbox: any = vm.createContext({});

  const func = vm.runInContext(
    `
function run(){
  name = "world";
  return name;
}

module.exports = run;
      `,
    sandbox
  );

  t.deepEqual(func(), "world");
});

test("VariableDeclaration-redefine global var in block scope", t => {
  const sandbox: any = vm.createContext({});

  const func = vm.runInContext(
    `
function run(){
  name = "world";
  name = "hello";
  return name;
}

module.exports = run;
      `,
    sandbox
  );

  t.deepEqual(func(), "hello");
});
