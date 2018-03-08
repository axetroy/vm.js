import test from "ava";
import vm from "../../../src/vm";

test("FunctionExpression-1", t => {
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
  t.deepEqual(testFunc.name, "test");
  t.deepEqual(testFunc("world"), "hello world");
});

test("FunctionDeclaration-2", t => {
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
  t.deepEqual(testFunc.name, "test");
  t.deepEqual(testFunc("world"), "hello world");
});

test("FunctionDeclaration-name", t => {
  const sandbox: any = vm.createContext({});

  const person = vm.runInContext(
    `
const person = {
  sayName() {
    console.log('hello!');
  },
};

module.exports = person;
  `,
    sandbox
  );

  t.deepEqual(person.sayName.name, "sayName");
});
